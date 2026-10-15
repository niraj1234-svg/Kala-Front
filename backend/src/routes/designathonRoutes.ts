import { Router } from 'express'
import {
  getDesignathonPublicConfig,
  registerForDesignathon,
  createDesignathonOrder,
  verifyDesignathonPayment,
  handleDesignathonWebhook,
  getRegistrationStatus,
} from '../controllers/designathonController'
import { designathonLimiter } from '../middleware/rateLimiter'

export const designathonRouter = Router()

/**
 * GET /api/designathon/config
 * Public event configuration and registration window status.
 */
designathonRouter.get('/config', getDesignathonPublicConfig)

/**
 * POST /api/designathon/register
 * Creates a pending individual registration with server validation.
 */
designathonRouter.post('/register', designathonLimiter, registerForDesignathon)

/**
 * POST /api/designathon/create-order
 * Initiates Razorpay checkout order for an existing pending registration.
 * Fixed ₹49 amount computed server-side.
 */
designathonRouter.post('/create-order', designathonLimiter, createDesignathonOrder)

/**
 * POST /api/designathon/verify-payment
 * Verifies Razorpay HMAC signature, confirms registration, and triggers email.
 */
designathonRouter.post('/verify-payment', designathonLimiter, verifyDesignathonPayment)

/**
 * POST /api/designathon/webhook
 * Authenticated server-to-server webhook endpoint for Razorpay payment capture.
 */
designathonRouter.post('/webhook', handleDesignathonWebhook)

/**
 * GET /api/designathon/status/:registrationId
 * Public sanitized registration and payment status lookup.
 */
designathonRouter.get('/status/:registrationId', getRegistrationStatus)

export default designathonRouter
