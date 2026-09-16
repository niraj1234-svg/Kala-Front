import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import { seedProducts } from './config/seed'
import productRouter from './routes/productRoutes'
import orderRouter from './routes/orderRoutes'
import customRequestRouter from './routes/customRequestRoutes'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
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
app.use('/api/custom-requests', customRequestRouter)

// Start Server
app.listen(PORT, async () => {
  await connectDB()
  await seedProducts()
  console.log(`[KALA Backend] Server running on port ${PORT}`)
  console.log(`[KALA Backend] Health check:    http://localhost:${PORT}/api/health`)
  console.log(`[KALA Backend] Products API:    http://localhost:${PORT}/api/products`)
  console.log(`[KALA Backend] Orders API:      http://localhost:${PORT}/api/orders`)
  console.log(`[KALA Backend] Custom Req API:  http://localhost:${PORT}/api/custom-requests`)
})

export default app
