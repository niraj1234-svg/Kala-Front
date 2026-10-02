import Razorpay from 'razorpay'
import dotenv from 'dotenv'
import path from 'path'

// In development, allow local .env to override stale terminal session variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })
}

/**
 * Sanitizes environment variable values for payment gateways:
 * - Trims whitespace, newlines (\r, \n), and tabs
 * - Removes enclosing quotes (both single ' and double ")
 */
export function sanitizeCredential(val?: string | null): string {
  if (!val) return ''
  let cleaned = String(val).trim().replace(/[\r\n\t]/g, '')
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'") && cleaned.length >= 2) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  return cleaned
}

/**
 * Safely masks a key ID for logs and diagnostics (e.g. rzp_live...UojF).
 */
export function getMaskedKey(key?: string): string {
  if (!key) return '(not set)'
  if (key.length <= 8) return '****'
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}

/**
 * Retrieves the sanitized Razorpay Key ID.
 */
export function getRazorpayKeyId(): string {
  return sanitizeCredential(process.env.RAZORPAY_KEY_ID)
}

/**
 * Retrieves the Razorpay Key Secret securely for HMAC-SHA256 signature verification.
 */
export function getRazorpayKeySecret(): string {
  const key_secret = sanitizeCredential(process.env.RAZORPAY_KEY_SECRET)
  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.')
  }
  return key_secret
}

/**
 * Initializes and returns a Razorpay client instance using sanitized environment variables.
 * Never hardcodes credentials or exposes secrets to the client.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = getRazorpayKeyId()
  let key_secret = ''
  try {
    key_secret = getRazorpayKeySecret()
  } catch {
    // will be caught by missing check below
  }

  if (!key_id || !key_secret) {
    console.error('[Razorpay Config] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment.')
    throw new Error('Razorpay credentials are not configured on the server.')
  }

  return new Razorpay({
    key_id,
    key_secret,
  })
}

/**
 * Tests live connection to Razorpay API without charging or creating dummy orders.
 */
export async function testRazorpayConnection(): Promise<{
  connected: boolean
  mode: 'live' | 'test' | 'unknown'
  keyIdMasked: string
  message: string
  error?: string
}> {
  const key_id = getRazorpayKeyId()
  let key_secret = ''
  try {
    key_secret = getRazorpayKeySecret()
  } catch {
    // handled below
  }

  const masked = getMaskedKey(key_id)
  const mode = key_id.startsWith('rzp_live_') ? 'live' : key_id.startsWith('rzp_test_') ? 'test' : 'unknown'

  if (!key_id || !key_secret) {
    return {
      connected: false,
      mode,
      keyIdMasked: masked,
      message: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in server environment.',
    }
  }

  try {
    const client = new Razorpay({ key_id, key_secret })
    await client.payments.all({ count: 1 })
    return {
      connected: true,
      mode,
      keyIdMasked: masked,
      message: `Razorpay credentials verified successfully in ${mode.toUpperCase()} mode.`,
    }
  } catch (err: any) {
    const errDesc = err?.error?.description || err?.message || 'Authentication failed'
    return {
      connected: false,
      mode,
      keyIdMasked: masked,
      message: `Razorpay authentication failed: ${errDesc}`,
      error: errDesc,
    }
  }
}

