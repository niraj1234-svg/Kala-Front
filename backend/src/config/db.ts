import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'

// Attempt to load .env from backend root or src directory with override enabled
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true })

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim()

  if (!mongoUri) {
    console.error('\n[MongoDB] Config Error: MONGODB_URI is not set or is empty.')
    console.error('[MongoDB] Please specify a valid connection string in backend/.env:')
    console.error('          Local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/kala')
    console.error('          MongoDB Atlas: MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kala\n')
    return
  }

  if (mongoose.connection.readyState === 1) {
    console.log('[MongoDB] Already connected')
    return
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected. Reconnecting...')
  })

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection event error:', err.message)
  })

  try {
    await mongoose.connect(mongoUri)
    console.log('[MongoDB] Connected successfully')
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
  }
}