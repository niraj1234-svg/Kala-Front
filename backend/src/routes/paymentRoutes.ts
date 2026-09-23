import { Router } from 'express'
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController'
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

export default paymentRouter
