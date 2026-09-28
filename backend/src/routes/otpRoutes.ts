import { Router } from 'express'
import { requestOtp, verifyOtpCode } from '../controllers/otpController'
import { otpSendLimiter, otpVerifyLimiter } from '../middleware/rateLimiter'

export const otpRouter = Router()

/**
 * POST /api/otp/send
 * Rate limited to 15 requests per 15 minutes window per IP.
 */
otpRouter.post('/send', otpSendLimiter, requestOtp)

/**
 * POST /api/otp/verify
 * Rate limited to 25 attempts per 15 minutes window per IP.
 */
otpRouter.post('/verify', otpVerifyLimiter, verifyOtpCode)

export default otpRouter
