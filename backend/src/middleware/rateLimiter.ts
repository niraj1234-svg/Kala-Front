import rateLimit from 'express-rate-limit'

/**
 * Authentication Rate Limiter
 * Applied to:
 * - /api/auth/login
 * - /api/auth/register
 * - /api/auth/admin/login
 *
 * Allows 30 requests per 15 minutes window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per windowMs
  standardHeaders: true, // Return standard RateLimit headers in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
})

/**
 * Order Placement & Checkout Rate Limiter
 * Applied to:
 * - POST /api/orders
 * - POST /api/coupons/validate
 *
 * Allows 60 requests per 15 minutes window per IP.
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 order / coupon requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order or checkout requests. Please slow down and try again shortly.',
  },
})

/**
 * Review Submission Rate Limiter
 * Applied to:
 * - POST /api/reviews
 *
 * Allows 30 review submissions per 15 minutes window per IP.
 */
export const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many review submissions. Please wait before submitting another review.',
  },
})

/**
 * Inquiries Rate Limiter
 * Applied to:
 * - POST /api/custom-requests
 * - POST /api/business-requests
 *
 * Allows 20 requests per 15 minutes window per IP.
 */
export const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiry requests submitted. Please wait before trying again.',
  },
})

const isProduction = process.env.NODE_ENV === 'production'

/**
 * OTP Generation & Sending Rate Limiter
 * Applied to: POST /api/otp/send
 * Limits to 15 OTP generation requests per 15 minutes window per IP in production.
 */
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 15 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this connection. Please try again after 15 minutes.',
  },
})

/**
 * OTP Verification Rate Limiter
 * Applied to: POST /api/otp/verify
 * Limits to 25 verification attempts per 15 minutes window per IP to prevent brute-force attacks.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 25 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait 15 minutes before trying again.',
  },
})

