import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

let envLoaded = false

/**
 * Centrally loads environment variables from backend/.env for Node.js.
 * Correctly locates backend/.env whether executed from:
 * 1. Project root ("F:\Final kala")
 * 2. Backend directory ("F:\Final kala\backend")
 * 3. Relative to __dirname (works in src/config and dist/config)
 * Avoids loading .env multiple times unnecessarily.
 */
export function loadEnv(): void {
  if (envLoaded) return

  const candidatePaths = [
    // 1. Running from project root
    path.resolve(process.cwd(), 'backend', '.env'),
    // 2. Running from backend directory
    path.resolve(process.cwd(), '.env'),
    // 3. Relative to this file (both src/config and dist/config are 2 levels deep)
    path.resolve(__dirname, '../../.env'),
  ]

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate, override: true })
      envLoaded = true
      return
    }
  }

  // Fallback for cloud/container environments where variables are injected directly
  dotenv.config()
  envLoaded = true
}

// Automatically execute once on initial module import
loadEnv()

export interface EnvValidationResult {
  isValid: boolean
  isProduction: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Validates required environment variables for production and development.
 * Never prints or leaks secret values in error messages or logs.
 */
export function validateEnv(): EnvValidationResult {
  const isProduction = process.env.NODE_ENV === 'production'
  const missing: string[] = []
  const warnings: string[] = []

  // Check required production variables
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    missing.push('MONGODB_URI')
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    missing.push('JWT_SECRET')
  }

  if (!process.env.CLIENT_URL || !process.env.CLIENT_URL.trim()) {
    if (isProduction) {
      missing.push('CLIENT_URL')
    } else {
      warnings.push('CLIENT_URL is not set. Defaulting to http://localhost:5173 for local development.')
    }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_ID.trim()) {
    if (isProduction) {
      missing.push('RAZORPAY_KEY_ID')
    } else {
      warnings.push('RAZORPAY_KEY_ID is not set in environment.')
    }
  }

  if (!process.env.RAZORPAY_KEY_SECRET || !process.env.RAZORPAY_KEY_SECRET.trim()) {
    if (isProduction) {
      missing.push('RAZORPAY_KEY_SECRET')
    } else {
      warnings.push('RAZORPAY_KEY_SECRET is not set in environment.')
    }
  }

  if (isProduction && missing.length > 0) {
    console.error(
      `\n[Environment] CRITICAL ERROR: Missing required production environment variable(s): ${missing.join(', ')}`
    )
    console.error('[Environment] Startup aborted. Please configure these variables before running in production.\n')
    throw new Error(`Missing required production environment variable(s): ${missing.join(', ')}`)
  }

  if (!isProduction && missing.length > 0) {
    console.warn(`\n[Environment] Development Warning: Missing recommended variable(s): ${missing.join(', ')}\n`)
  }

  return {
    isValid: missing.length === 0,
    isProduction,
    missing,
    warnings,
  }
}

/**
 * Resolves allowed CORS origins from CLIENT_URL (supports single or comma-separated origins),
 * ensuring local development origins are preserved in non-production environments.
 */
export function getAllowedOrigins(): string[] {
  const rawClientUrl = process.env.CLIENT_URL || ''
  const parsedOrigins = rawClientUrl
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

  const isProduction = process.env.NODE_ENV === 'production'

  // In development, ensure common local development ports are included in allowlist
  const devOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ]

  if (!isProduction) {
    for (const devOrigin of devOrigins) {
      if (!parsedOrigins.includes(devOrigin)) {
        parsedOrigins.push(devOrigin)
      }
    }
  }

  // Safe fallback if CLIENT_URL is empty
  if (parsedOrigins.length === 0) {
    parsedOrigins.push('http://localhost:5173')
  }

  return parsedOrigins
}
