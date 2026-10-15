import mongoose from 'mongoose'
import { loadEnv } from './env'

// Ensure environment variables are loaded once
loadEnv()

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