import { Request, Response } from 'express'
import crypto from 'crypto'
import { getRazorpayClient, getRazorpayKeySecret } from '../config/razorpay'
import { Order } from '../models/Order'
import { getAuthenticatedUser, AuthResult } from '../middleware/authMiddleware'

/**
 * Verifies that the requester has legitimate ownership over the KALA order.
 * - If the order was created by an authenticated user, requester must match that user.
 * - If the order was created by a guest, an authenticated user with a different email is denied.
 * - No client-provided query parameters are trusted for identity.
 */
function verifyOrderOwnership(order: any, auth: AuthResult): { allowed: boolean; message?: string } {
  // If the order was created by an authenticated user (has userId)
  if (order.userId) {
    if (!auth.user) {
      return { allowed: false, message: 'Authentication required: This order belongs to a registered customer account.' }
    }
    const isOwnerByUserId = order.userId === auth.user.userId
    const isOwnerByEmail = Boolean(
      order.customer?.email &&
      order.customer.email.trim().toLowerCase() === auth.user.email.trim().toLowerCase()
    )
    if (!isOwnerByUserId && !isOwnerByEmail) {
      return { allowed: false, message: 'Access denied: You do not have permission to access or pay for this order.' }
    }
    return { allowed: true }
  }

  // If the order was created as a guest (no userId)
  // If the requester is authenticated, ensure their email matches the order's customer email
  if (auth.user && order.customer?.email) {
    if (order.customer.email.trim().toLowerCase() !== auth.user.email.trim().toLowerCase()) {
      return { allowed: false, message: 'Access denied: You do not have permission to access or pay for this order.' }
    }
  }

  return { allowed: true }
}

/**
 * POST /api/create-order
 * or POST /api/payment/create-order
 *
 * Creates a Razorpay order for Standard Web Checkout.
 * Amount is ALWAYS derived strictly from Order.pricing.total in MongoDB.
 * Request Body:
 * - orderId: string (required - KALA order ID)
 *
 * Returns:
 * { order_id, amount, currency, success: true, key_id }
 */
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body

    // 1. Validate required orderId
    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: orderId is required.',
      })
      return
    }

    // 2. Validate requester authentication state
    const auth = getAuthenticatedUser(req)
    if (auth.error) {
      res.status(401).json({
        success: false,
        message: auth.error,
      })
      return
    }

    // 3. Fetch authoritative order from MongoDB
    const cleanOrderId = orderId.trim()
    const existingOrder = await Order.findOne({ orderId: cleanOrderId })

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: `Order not found with ID '${cleanOrderId}'.`,
      })
      return
    }

    // 4. Verify payment ownership
    const ownership = verifyOrderOwnership(existingOrder, auth)
    if (!ownership.allowed) {
      res.status(403).json({
        success: false,
        message: ownership.message || 'Access denied: You do not have permission for this order.',
      })
      return
    }

    // 5. Order state validation
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

    // 6. SERVER-AUTHORITATIVE AMOUNT: Derive strictly from Order.pricing.total (paise)
    // Never trust frontend amount, subtotal, shipping, discount, or total
    const numericAmount = Math.round(existingOrder.pricing.total * 100)

    // Razorpay requires a minimum transaction amount of 100 paise (₹1.00).
    // Do NOT artificially inflate order amount with Math.max. If below 100 paise, reject with 400.
    if (!Number.isInteger(numericAmount) || numericAmount < 100) {
      res.status(400).json({
        success: false,
        message: `Invalid order amount for Razorpay checkout: Order total is ₹${existingOrder.pricing.total.toLocaleString('en-IN')}, but Razorpay requires a minimum amount of ₹1.00 (100 paise).`,
      })
      return
    }

    const validCurrency = 'INR'
    const cleanReceipt = existingOrder.orderId.slice(0, 40)
    const mergedNotes: Record<string, string> = {
      orderId: existingOrder.orderId,
      ...(existingOrder.customer?.email ? { customerEmail: existingOrder.customer.email } : {}),
    }

    // 7. Initialize Razorpay Client
    let razorpay
    try {
      razorpay = getRazorpayClient()
    } catch (configErr: any) {
      console.error('[PaymentController] Razorpay config error:', configErr.message)
      res.status(401).json({
        success: false,
        message: 'Payment gateway authentication failed: Server credentials not configured.',
      })
      return
    }

    // 8. Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const options: any = {
      amount: numericAmount,
      currency: validCurrency,
      receipt: cleanReceipt,
      notes: mergedNotes,
    }

    const razorpayOrder = await razorpay.orders.create(options)

    if (!razorpayOrder || !razorpayOrder.id) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order with Razorpay.',
      })
      return
    }

    // 9. Immediately link Razorpay Order ID to MongoDB order document
    existingOrder.payment = {
      ...(existingOrder.payment || {}),
      method: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    }
    await existingOrder.save()

    // Return required fields including server's public key_id
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
 * Request Body:
 * - orderId: string (required - KALA order ID)
 * - razorpay_order_id: string (required)
 * - razorpay_payment_id: string (required)
 * - razorpay_signature: string (required)
 *
 * Response:
 * - 200: { success: true, message: 'Payment verified successfully' }
 * - 400: Signature mismatch, missing fields, or duplicate payment
 * - 403: Ownership violation
 * - 404: Order not found
 */
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    // 1. Validate required fields
    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      res.status(400).json({
        success: false,
        message: 'Missing required field: orderId is required.',
      })
      return
    }

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

    // 2. Validate requester authentication state
    const auth = getAuthenticatedUser(req)
    if (auth.error) {
      res.status(401).json({
        success: false,
        message: auth.error,
      })
      return
    }

    // 3. Find order in MongoDB
    const cleanOrderId = orderId.trim()
    const order = await Order.findOne({ orderId: cleanOrderId })

    if (!order) {
      res.status(404).json({
        success: false,
        message: `Order not found with ID '${cleanOrderId}'.`,
      })
      return
    }

    // 4. Verify payment ownership
    const ownership = verifyOrderOwnership(order, auth)
    if (!ownership.allowed) {
      res.status(403).json({
        success: false,
        message: ownership.message || 'Access denied: You do not have permission for this order.',
      })
      return
    }

    // 5. DUPLICATE PAYMENT CHECK: An already-paid order cannot be marked paid again
    if (order.payment?.status === 'paid' || order.status === 'confirmed') {
      res.status(400).json({
        success: false,
        message: 'Duplicate payment error: This order has already been paid and confirmed.',
      })
      return
    }

    // 6. ORDER LINKAGE & REPLAY PREVENTION: Verify razorpay_order_id matches recorded order
    if (
      !order.payment?.razorpayOrderId ||
      order.payment.razorpayOrderId !== razorpay_order_id.trim()
    ) {
      console.warn(
        `[PaymentController] Razorpay Order ID mismatch for ${cleanOrderId}: expected ${order.payment?.razorpayOrderId}, received ${razorpay_order_id.trim()}`
      )
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Razorpay order mismatch.',
      })
      return
    }

    // 7. Retrieve Secret Key
    let keySecret: string
    try {
      keySecret = getRazorpayKeySecret()
    } catch (secretErr: any) {
      console.error('[PaymentController] Key secret missing:', secretErr.message)
      res.status(500).json({
        success: false,
        message: 'Server payment configuration error.',
      })
      return
    }

    // 8. Compute Expected Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const signPayload = `${razorpay_order_id.trim()}|${razorpay_payment_id.trim()}`
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signPayload)
      .digest('hex')

    // 9. Compare Signatures using timing-safe buffer comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const receivedBuffer = Buffer.from(razorpay_signature.trim(), 'utf8')

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

    if (!isMatch) {
      console.warn(`[PaymentController] Signature mismatch for order: ${razorpay_order_id}`)
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.',
      })
      return
    }

    // 10. Signature Matched! Update order status to confirmed and record payment
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
      note: `Payment verified via Razorpay (Payment ID: ${razorpay_payment_id.trim()})`,
    })

    await order.save()
    console.log(`[PaymentController] Order ${cleanOrderId} marked as paid & confirmed.`)

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      payment_id: razorpay_payment_id.trim(),
      order_id: razorpay_order_id.trim(),
    })
  } catch (error: any) {
    console.error('[PaymentController] verifyRazorpayPayment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Server error during payment verification.',
    })
  }
}
