import Razorpay from 'razorpay'
import dotenv from 'dotenv'
import path from 'path'

// Ensure backend .env is loaded and overrides stale environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })

/**
 * Initializes and returns a Razorpay client instance using environment variables.
 * Never hardcodes credentials or exposes secrets to the client.
 */
export function getRazorpayClient(): Razorpay {
  // Reload .env if needed to guarantee fresh credentials
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })

  const key_id = process.env.RAZORPAY_KEY_ID?.trim()
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()

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
 * Retrieves the Razorpay Key Secret securely for HMAC-SHA256 signature verification.
 */
export function getRazorpayKeySecret(): string {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })
  dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true })
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.')
  }
  return key_secret
}
