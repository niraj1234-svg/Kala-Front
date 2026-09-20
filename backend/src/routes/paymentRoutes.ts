import { Router } from 'express'
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController'
import { orderLimiter } from '../middleware/rateLimiter'
import { requireAuth } from '../middleware/authMiddleware'

export const paymentRouter = Router()

/**
 * POST /api/create-order
 * Creates a Razorpay order with amount in paise, currency, and receipt.
 * Requires authenticated customer.
 */
paymentRouter.post('/create-order', orderLimiter, requireAuth, createRazorpayOrder)

/**
 * POST /api/verify-payment
 * Verifies Razorpay HMAC-SHA256 signature and confirms order payment.
 * Requires authenticated customer.
 */
paymentRouter.post('/verify-payment', orderLimiter, requireAuth, verifyRazorpayPayment)

export default paymentRouter
