import dotenv from 'dotenv'
import path from 'path'

// Attempt to load .env from standard backend locations without overwriting system env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false })
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false })
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false })

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

  // In development, ensure localhost is always included in allowlist
  const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']

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
