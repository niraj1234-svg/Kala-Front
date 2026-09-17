import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { validateEnv, getAllowedOrigins } from './config/env'
import { connectDB } from './config/db'
import { seedProducts } from './config/seed'
import { authLimiter, orderLimiter, reviewLimiter, inquiryLimiter } from './middleware/rateLimiter'
import productRouter from './routes/productRoutes'
import orderRouter from './routes/orderRoutes'
import customRequestRouter from './routes/customRequestRoutes'
import businessRequestRouter from './routes/businessRequestRoutes'
import authRouter from './routes/authRoutes'
import adminOrderRouter from './routes/adminOrderRoutes'
import { adminCustomRequestRouter, adminBusinessRequestRouter } from './routes/adminRequestRoutes'
import adminProductRouter from './routes/adminProductRoutes'
import adminCustomerRouter from './routes/adminCustomerRoutes'
import adminAnalyticsRouter from './routes/adminAnalyticsRoutes'
import adminDashboardRouter from './routes/adminDashboardRoutes'
import adminCouponRouter from './routes/adminCouponRoutes'
import customerCouponRouter from './routes/customerCouponRoutes'
import reviewRouter from './routes/reviewRoutes'
import adminReviewRouter from './routes/adminReviewRoutes'

// Validate required environment configuration at startup
validateEnv()

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = getAllowedOrigins()

// Trust reverse proxy (e.g. AWS ALB, Render, Nginx, Cloudflare) for accurate rate limiting and protocol detection
app.set('trust proxy', 1)

// Production Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// CORS configuration with explicit allowlisting and credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, health check)
      if (!origin) {
        return callback(null, true)
      }

      const normalizedOrigin = origin.replace(/\/+$/, '')
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true)
      }

      // In local development, permit loopback origins on any port allocated by dev servers
      const isProduction = process.env.NODE_ENV === 'production'
      if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true)
      }

      return callback(null, false)
    },
    credentials: true,
  })
)

// Request body size limits to protect against denial-of-service
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Health Check Endpoint (Excluded from rate limiting)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'KALA API is running',
  })
})

// Public & Customer API Routes (Protected by dedicated rate limiters)
app.use('/api/products', productRouter)
app.use('/api/orders', orderLimiter, orderRouter)
app.use('/api/coupons', orderLimiter, customerCouponRouter)
app.use('/api/reviews', reviewLimiter, reviewRouter)
app.use('/api/custom-requests', inquiryLimiter, customRequestRouter)
app.use('/api/business-requests', inquiryLimiter, businessRequestRouter)
app.use('/api/auth', authLimiter, authRouter)

// Admin Management Routes (Protected by requireAuth + requireAdmin)
app.use('/api/admin/dashboard', adminDashboardRouter)
app.use('/api/admin/orders', adminOrderRouter)
app.use('/api/admin/products', adminProductRouter)
app.use('/api/admin/customers', adminCustomerRouter)
app.use('/api/admin/coupons', adminCouponRouter)
app.use('/api/admin/reviews', adminReviewRouter)
app.use('/api/admin/analytics', adminAnalyticsRouter)
app.use('/api/admin/custom-requests', adminCustomRequestRouter)
app.use('/api/admin/business-requests', adminBusinessRequestRouter)

// 404 Handler for Unmatched API Routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  })
})

// Global Production-Safe Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const statusCode =
    typeof err.status === 'number'
      ? err.status
      : typeof err.statusCode === 'number'
        ? err.statusCode
        : 500

  // Server-side diagnostic log only
  console.error('[Server Error]', err.message || err)

  // Safe client-facing message
  let clientMessage = 'Internal server error.'
  if (err.type === 'entity.parse.failed') {
    clientMessage = 'Invalid JSON in request body.'
  } else if (!isProduction && err.message) {
    clientMessage = err.message
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(!isProduction && err.stack ? { stack: err.stack } : {}),
  })
})

// Start Server
app.listen(PORT, async () => {
  await connectDB()
  await seedProducts()
  console.log(`[KALA Backend] Server running on port ${PORT}`)
  console.log(`[KALA Backend] Health check:    http://localhost:${PORT}/api/health`)
  console.log(`[KALA Backend] Products API:    http://localhost:${PORT}/api/products`)
  console.log(`[KALA Backend] Orders API:      http://localhost:${PORT}/api/orders`)
  console.log(`[KALA Backend] Custom Req API:  http://localhost:${PORT}/api/custom-requests`)
  console.log(`[KALA Backend] Business API:    http://localhost:${PORT}/api/business-requests`)
  console.log(`[KALA Backend] Auth API:        http://localhost:${PORT}/api/auth`)
})

export default app
