import { Router } from 'express'
import { recordFirstVisit } from '../controllers/visitorController'
import rateLimit from 'express-rate-limit'

export const visitorRouter = Router()

// Dedicated rate limiter for first visit tracking (prevents spam abuse)
const visitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many visit recordings from this IP. Please try again later.',
  },
})

// POST /api/visitors/first-visit
visitorRouter.post('/first-visit', visitorLimiter, recordFirstVisit)

export default visitorRouter
