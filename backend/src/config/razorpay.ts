import Razorpay from 'razorpay'

/**
 * Initializes and returns a Razorpay client instance using environment variables.
 * Never hardcodes credentials or exposes secrets to the client.
 */
export function getRazorpayClient(): Razorpay {
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
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.')
  }
  return key_secret
}
