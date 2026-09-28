import { Router } from 'express'
import { createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook } from '../controllers/paymentController'
import { orderLimiter } from '../middleware/rateLimiter'
import { requireAuth } from '../middleware/authMiddleware'

export const paymentRouter = Router()

/**
 * POST /api/create-order
 * Creates a Razorpay order with amount in paise, currency, and receipt.
 */
paymentRouter.post('/create-order', orderLimiter, createRazorpayOrder)

/**
 * POST /api/verify-payment
 * Verifies Razorpay HMAC-SHA256 signature and confirms order payment.
 */
paymentRouter.post('/verify-payment', orderLimiter, verifyRazorpayPayment)

/**
 * POST /api/payment/webhook and /payment-webhook
 * Verified server-to-server webhook from Razorpay for authoritative payment capture & order confirmation.
 */
paymentRouter.post('/webhook', handleRazorpayWebhook)
paymentRouter.post('/payment-webhook', handleRazorpayWebhook)

export default paymentRouter
