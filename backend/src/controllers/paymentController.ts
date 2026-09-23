import { Request, Response } from 'express'
import crypto from 'crypto'
import { getRazorpayClient, getRazorpayKeySecret } from '../config/razorpay'
import { Order } from '../models/Order'
import { getAuthenticatedUser, AuthResult } from '../middleware/authMiddleware'

/**
 * Verifies that the requester has legitimate ownership over the KALA order.
 * - Customer must be authenticated.
 * - Order must belong to the authenticated customer (by userId or matching verified customer email).
 * - No client-provided query parameters or body parameters are trusted for identity.
 */
function verifyOrderOwnership(order: any, auth: AuthResult): { allowed: boolean; message?: string } {
  if (!auth.user || !auth.user.userId) {
    return { allowed: false, message: 'Authentication required: Please log in to continue.' }
  }

  const isOwnerByUserId = Boolean(order.userId && order.userId === auth.user.userId)
  const isOwnerByEmail = Boolean(
    order.customer?.email &&
    order.customer.email.trim().toLowerCase() === auth.user.email.trim().toLowerCase()
  )

  if (!isOwnerByUserId && !isOwnerByEmail) {
    return { allowed: false, message: 'Access denied: You do not have permission to access or pay for this order.' }
  }

  return { allowed: true }
}

/**
 * POST /api/create-order
 * or POST /api/payment/create-order
 *
 * Creates a Razorpay order for Standard Web Checkout.
 * Accepts:
 * 1. Standard Razorpay payload: { amount (paise), currency, receipt, notes }
 * 2. KALA e-commerce payload: { orderId } (amount authoritatively derived from MongoDB Order.pricing.total)
 *
 * Returns:
 * { order_id, amount, currency, receipt, key_id, success: true }
 */
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, currency, receipt, notes } = req.body

    // Check optional authentication state
    const auth = getAuthenticatedUser(req)
    if (auth.error) {
      res.status(401).json({
        success: false,
        message: auth.error,
      })
      return
    }

    let numericAmount: number
    let validCurrency = typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'INR'
    let cleanReceipt = typeof receipt === 'string' && receipt.trim() ? receipt.trim() : `rcpt_${Date.now()}`
    let mergedNotes: Record<string, string> = typeof notes === 'object' && notes !== null ? { ...notes } : {}
    let existingOrder: any = null

    // Case 1: KALA e-commerce flow with internal orderId
    if (orderId && typeof orderId === 'string' && orderId.trim()) {
      if (!auth.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required: Please log in to complete checkout.',
        })
        return
      }

      const cleanOrderId = orderId.trim()
      existingOrder = await Order.findOne({ orderId: cleanOrderId })

      if (!existingOrder) {
        res.status(404).json({
          success: false,
          message: `Order not found with ID '${cleanOrderId}'.`,
        })
        return
      }

      const ownership = verifyOrderOwnership(existingOrder, auth)
      if (!ownership.allowed) {
        res.status(403).json({
          success: false,
          message: ownership.message || 'Access denied: You do not have permission for this order.',
        })
        return
      }

      if (existingOrder.status === 'cancelled') {
        res.status(400).json({
          success: false,
          message: 'Cannot initialize payment for a cancelled order.',
        })
        return
      }

      if (existingOrder.payment?.status === 'paid' || existingOrder.status === 'confirmed') {
        res.status(400).json({
          success: false,
          message: 'This order has already been paid and confirmed.',
        })
        return
      }

      // Authoritative amount in paise from MongoDB
      numericAmount = Math.round(existingOrder.pricing.total * 100)
      cleanReceipt = existingOrder.orderId.slice(0, 40)
      mergedNotes = {
        orderId: existingOrder.orderId,
        ...(existingOrder.customer?.email ? { customerEmail: existingOrder.customer.email } : {}),
        ...mergedNotes,
      }
    } else if (amount !== undefined && amount !== null && !isNaN(Number(amount))) {
      // Case 2: Direct amount passed (Standard Razorpay order creation)
      numericAmount = Math.round(Number(amount))
    } else {
      res.status(400).json({
        success: false,
        message: 'Missing required field: orderId or amount (in paise) is required.',
      })
      return
    }

    // Minimum amount validation: 100 paise (₹1.00)
    if (!Number.isInteger(numericAmount) || numericAmount < 100) {
      res.status(400).json({
        success: false,
        message: `Invalid order amount for Razorpay checkout: Amount must be at least 100 paise (₹1.00). Received ${numericAmount} paise.`,
      })
      return
    }

    // Initialize Razorpay Client with environment credentials
    let razorpay
    try {
      razorpay = getRazorpayClient()
    } catch (configErr: any) {
      console.error('[PaymentController] Razorpay config error:', configErr.message)
      res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error: Server credentials not configured.',
      })
      return
    }

    const options = {
      amount: numericAmount,
      currency: validCurrency,
      receipt: cleanReceipt,
      notes: mergedNotes,
    }

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const razorpayOrder = await razorpay.orders.create(options)

    if (!razorpayOrder || !razorpayOrder.id) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order with Razorpay.',
      })
      return
    }

    // If an existing KALA order exists, link Razorpay Order ID to MongoDB document
    if (existingOrder) {
      existingOrder.payment = {
        ...(existingOrder.payment || {}),
        method: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      }
      await existingOrder.save()
    }

    res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key_id: process.env.RAZORPAY_KEY_ID?.trim() || '',
    })
  } catch (error: any) {
    console.error('[PaymentController] createRazorpayOrder error:', error)

    if (error?.statusCode === 401 || (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.includes('auth'))) {
      res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Please verify API keys.',
      })
      return
    }

    res.status(500).json({
      success: false,
      message: error?.error?.description || error?.message || 'Error communicating with Razorpay API.',
    })
  }
}

/**
 * POST /api/verify-payment
 * or POST /api/payment/verify-payment
 *
 * Verifies Razorpay payment signature using HMAC-SHA256:
 * HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 *
 * Accepts:
 * - razorpay_order_id: string (required)
 * - razorpay_payment_id: string (required)
 * - razorpay_signature: string (required)
 * - orderId?: string (optional KALA order ID for MongoDB persistence)
 *
 * Response:
 * - 200: { success: true, message: 'Payment verified successfully' }
 * - 400: Signature mismatch or missing fields
 */
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    // 1. Validate required Razorpay signature fields
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: razorpay_order_id is required.',
      })
      return
    }

    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: razorpay_payment_id is required.',
      })
      return
    }

    if (!razorpay_signature || typeof razorpay_signature !== 'string' || !razorpay_signature.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: razorpay_signature is required.',
      })
      return
    }

    // 2. Retrieve Secret Key from environment
    let keySecret: string
    try {
      keySecret = getRazorpayKeySecret()
    } catch (secretErr: any) {
      console.error('[PaymentController] Key secret missing:', secretErr.message)
      res.status(500).json({
        success: false,
        message: 'Server payment configuration error: RAZORPAY_KEY_SECRET missing.',
      })
      return
    }

    // 3. Compute Expected Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const signPayload = `${razorpay_order_id.trim()}|${razorpay_payment_id.trim()}`
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signPayload)
      .digest('hex')

    // 4. Compare Signatures using timing-safe buffer comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const receivedBuffer = Buffer.from(razorpay_signature.trim(), 'utf8')

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

    if (!isMatch) {
      console.warn(`[PaymentController] Signature mismatch for Razorpay order: ${razorpay_order_id}`)
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.',
      })
      return
    }

    // 5. If linked to a KALA e-commerce order, update MongoDB document
    if (orderId && typeof orderId === 'string' && orderId.trim()) {
      const cleanOrderId = orderId.trim()
      const order = await Order.findOne({ orderId: cleanOrderId })

      if (order) {
        if (order.payment?.status === 'paid' || order.status === 'confirmed') {
          console.warn(`[PaymentController] Duplicate payment notice: order ${cleanOrderId} already marked paid.`)
        } else {
          order.status = 'confirmed'
          order.payment = {
            method: 'razorpay',
            razorpayOrderId: razorpay_order_id.trim(),
            razorpayPaymentId: razorpay_payment_id.trim(),
            razorpaySignature: razorpay_signature.trim(),
            status: 'paid',
            paidAt: new Date(),
          }

          if (!order.statusHistory) {
            order.statusHistory = []
          }
          order.statusHistory.push({
            status: 'confirmed',
            changedAt: new Date(),
            note: `Payment verified via Razorpay Standard Checkout (Payment ID: ${razorpay_payment_id.trim()})`,
          })

          await order.save()
          console.log(`[PaymentController] Order ${cleanOrderId} marked as paid & confirmed.`)
        }
      }
    }

    // 6. Return success
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id: razorpay_order_id.trim(),
      payment_id: razorpay_payment_id.trim(),
    })
  } catch (error: any) {
    console.error('[PaymentController] verifyRazorpayPayment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Server error during payment verification.',
    })
  }
}
