import express, { Request, Response } from 'express'
import cors from 'cors'
import { validateEnv, getAllowedOrigins } from './config/env'
import { connectDB } from './config/db'
import { seedProducts } from './config/seed'
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

      return callback(null, false)
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'KALA API is running',
  })
})

// API Routes
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)
app.use('/api/coupons', customerCouponRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/custom-requests', customRequestRouter)
app.use('/api/business-requests', businessRequestRouter)
app.use('/api/auth', authRouter)

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
