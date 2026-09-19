import { Request, Response } from 'express'
import crypto from 'crypto'
import { getRazorpayClient, getRazorpayKeySecret } from '../config/razorpay'
import { Order } from '../models/Order'

/**
 * POST /api/create-order
 * or POST /api/payment/create-order
 *
 * Creates a Razorpay order for Standard Web Checkout.
 * Request Body:
 * - amount: number in paise (e.g. 100 = ₹1.00, 50000 = ₹500.00). Minimum 100 paise.
 * - currency?: string (default: 'INR')
 * - receipt?: string (unique receipt identifier, max 40 chars)
 * - notes?: Record<string, string>
 *
 * Returns:
 * { order_id, amount, currency, success: true }
 */
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body

    // 1. Validate Amount (must be integer >= 100 paise)
    const numericAmount = Number(amount)
    if (!Number.isInteger(numericAmount) || numericAmount < 100) {
      res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is 100 paise (₹1.00) and must be an integer.',
      })
      return
    }

    // 2. Validate Currency (3-letter uppercase, e.g. INR)
    const validCurrency = typeof currency === 'string' ? currency.trim().toUpperCase() : 'INR'
    if (!/^[A-Z]{3}$/.test(validCurrency)) {
      res.status(400).json({
        success: false,
        message: 'Invalid currency code. Expected standard 3-letter currency code (e.g. INR).',
      })
      return
    }

    // 3. Prepare Receipt (Razorpay requires receipt <= 40 chars)
    const cleanReceipt = receipt && typeof receipt === 'string'
      ? receipt.trim().slice(0, 40)
      : `rcpt_${Date.now()}`.slice(0, 40)

    // 4. Initialize Razorpay Client
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

    // 5. Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const options: any = {
      amount: numericAmount,
      currency: validCurrency,
      receipt: cleanReceipt,
    }

    if (notes && typeof notes === 'object') {
      options.notes = notes
    }

    const razorpayOrder = await razorpay.orders.create(options)

    if (!razorpayOrder || !razorpayOrder.id) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order with Razorpay.',
      })
      return
    }

    // Return required fields: order_id, amount, currency
    res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    })
  } catch (error: any) {
    console.error('[PaymentController] createRazorpayOrder error:', error)

    // Handle authentication failures from Razorpay API
    if (error?.statusCode === 401 || error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.includes('auth')) {
      res.status(401).json({
        success: false,
        message: 'Razorpay authentication failed. Please verify API keys.',
      })
      return
    }

    // Handle other Razorpay API errors (return 500)
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
 * - razorpay_order_id: string (required)
 * - razorpay_payment_id: string (required)
 * - razorpay_signature: string (required)
 * - orderId?: string (optional internal KALA orderId to update in DB)
 *
 * Response:
 * - 200: { success: true, message: 'Payment verified successfully' }
 * - 400: Signature mismatch or missing fields
 */
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body

    // 1. Validate required fields
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

    // 2. Retrieve Secret Key
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
      console.warn(`[PaymentController] Signature mismatch for order: ${razorpay_order_id}`)
      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.',
      })
      return
    }

    // 5. Signature Matched! If orderId provided, update order status in MongoDB
    if (orderId && typeof orderId === 'string' && orderId.trim()) {
      try {
        const cleanOrderId = orderId.trim()
        const order = await Order.findOne({ orderId: cleanOrderId })
        if (order) {
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
        }
      } catch (dbErr: any) {
        console.error('[PaymentController] Error updating order status in DB:', dbErr.message)
        // Signature was still valid, so return 200 with note
      }
    }

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
