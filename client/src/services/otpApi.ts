import { API_BASE_URL } from '../config/api'

export interface SendOtpResponse {
  success: boolean
  message: string
  maskedTarget?: string
  cooldownSeconds?: number
  expiresInMinutes?: number
}

export interface VerifyOtpResponse {
  success: boolean
  message: string
  verificationToken?: string
  verifiedContact?: {
    type: 'phone' | 'email'
    target: string
  }
  remainingAttempts?: number
}

/**
 * Request a 6-digit OTP code to mobile number or email.
 */
export async function sendOtp(
  target: string,
  type: 'phone' | 'email'
): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target: target.trim(), type }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data.message || 'Failed to send OTP code. Please try again.'
    const err: any = new Error(errorMsg)
    err.cooldownSeconds = data.cooldownSeconds
    err.status = response.status
    throw err
  }

  return data
}

/**
 * Verify the 6-digit OTP code entered by the user.
 * Returns signed verificationToken upon success.
 */
export async function verifyOtp(
  target: string,
  type: 'phone' | 'email',
  otp: string
): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: target.trim(),
      type,
      otp: otp.trim(),
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data.message || 'Invalid or expired OTP code.'
    const err: any = new Error(errorMsg)
    err.remainingAttempts = data.remainingAttempts
    err.status = response.status
    throw err
  }

  return data
}
