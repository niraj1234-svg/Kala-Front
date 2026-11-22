import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getServiceability } from '../controllers/shippingController'
import shiprocketWebhookRouter from './shiprocketWebhookRoutes'

export const shippingRouter = Router()

/**
 * IP-based rate limiter for public shipping serviceability inquiries.
 * Allows maximum 60 requests per 15 minutes window per IP.
 */
export const shippingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: 'temporarily_unavailable',
    serviceable: false,
    customerShippingCharge: 0,
    message: 'Too many shipping serviceability checks. Please slow down and try again shortly.',
  },
})

// GET /api/shipping/serviceability (Rate limited public inquiry endpoint)
shippingRouter.get('/serviceability', shippingLimiter, getServiceability)

// POST /api/shipping/webhook (Authenticated Shiprocket webhook endpoint - bypasses IP rate limiter)
shippingRouter.use('/webhook', shiprocketWebhookRouter)

export default shippingRouter
