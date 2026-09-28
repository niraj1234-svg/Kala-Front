import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { OtpVerification, IOtpVerification } from '../models/OtpVerification'

// Environment Configurations with Safe Defaults
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10)
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10)
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10)

/**
 * Pluggable Delivery Provider Interface
 */
export interface IOtpDeliveryProvider {
  name: string
  sendOtp(target: string, type: 'phone' | 'email', otp: string): Promise<boolean>
}

/**
 * Development & Console Delivery Provider
 * Logs the OTP securely to the backend terminal for local testing.
 * The OTP is NEVER exposed to the frontend HTTP response.
 */
class ConsoleDeliveryProvider implements IOtpDeliveryProvider {
  name = 'console'

  async sendOtp(target: string, type: 'phone' | 'email', otp: string): Promise<boolean> {
    console.log('\n======================================================')
    console.log(`[KALA OTP SERVICE] Delivery Provider: CONSOLE (Development Mode)`)
    console.log(`Target (${type.toUpperCase()}): ${target}`)
    console.log(`Generated OTP: >>> ${otp} <<<`)
    console.log(`Expires in: ${OTP_EXPIRY_MINUTES} minutes`)
    console.log('======================================================\n')
    return true
  }
}

/**
 * Placeholder for Production SMS Provider (e.g. Twilio, MSG91, Fast2SMS)
 */
class ProductionSmsProvider implements IOtpDeliveryProvider {
  name = 'production_sms'

  async sendOtp(target: string, type: 'phone' | 'email', otp: string): Promise<boolean> {
    const apiKey = process.env.SMS_API_KEY
    if (!apiKey) {
      console.warn('[OTP Service] SMS_API_KEY not configured. Falling back to console delivery.')
      const fallback = new ConsoleDeliveryProvider()
      return fallback.sendOtp(target, type, otp)
    }
    // Future integration with chosen SMS gateway
    console.log(`[OTP Service] Sending SMS OTP to ${target} via external gateway...`)
    return true
  }
}

/**
 * Placeholder for Production Email Provider (e.g. SendGrid, Nodemailer, AWS SES)
 */
class ProductionEmailProvider implements IOtpDeliveryProvider {
  name = 'production_email'

  async sendOtp(target: string, type: 'phone' | 'email', otp: string): Promise<boolean> {
    const apiKey = process.env.EMAIL_API_KEY
    if (!apiKey) {
      console.warn('[OTP Service] EMAIL_API_KEY not configured. Falling back to console delivery.')
      const fallback = new ConsoleDeliveryProvider()
      return fallback.sendOtp(target, type, otp)
    }
    // Future integration with chosen email gateway
    console.log(`[OTP Service] Sending Email OTP to ${target} via external gateway...`)
    return true
  }
}

/**
 * Select delivery provider based on configuration and channel
 */
function getDeliveryProvider(type: 'phone' | 'email'): IOtpDeliveryProvider {
  const configuredProvider = process.env.OTP_PROVIDER?.toLowerCase()

  if (configuredProvider === 'production') {
    return type === 'phone' ? new ProductionSmsProvider() : new ProductionEmailProvider()
  }

  // Default to console provider for local development and test environments
  return new ConsoleDeliveryProvider()
}

/**
 * Helper to get the HMAC secret
 */
function getOtpSecret(): string {
  return process.env.JWT_SECRET || 'kala-secure-otp-secret-key-2026'
}

/**
 * Normalizes phone numbers and emails to canonical format
 */
export function normalizeTarget(rawTarget: string, type: 'phone' | 'email'): string {
  if (type === 'email') {
    return rawTarget.trim().toLowerCase()
  }

  // Mobile number normalization for India (+91)
  const clean = rawTarget.replace(/[\s\-\(\)]/g, '')
  if (clean.startsWith('+91')) {
    return clean
  }
  if (clean.startsWith('91') && clean.length === 12) {
    return `+${clean}`
  }
  if (clean.startsWith('0') && clean.length === 11) {
    return `+91${clean.substring(1)}`
  }
  if (clean.length === 10) {
    return `+91${clean}`
  }
  return clean.startsWith('+') ? clean : `+91${clean}`
}

/**
 * Masks target phone or email for safe frontend display
 * e.g. "+91 98*** **210" or "n***@gmail.com"
 */
export function maskTarget(target: string, type: 'phone' | 'email'): string {
  if (type === 'email') {
    const [local, domain] = target.split('@')
    if (!domain) return target
    const maskedLocal =
      local.length <= 2
        ? `${local[0]}***`
        : `${local[0]}${'*'.repeat(Math.max(2, local.length - 2))}${local[local.length - 1]}`
    return `${maskedLocal}@${domain}`
  }

  // Phone masking
  const digitsOnly = target.replace(/\D/g, '')
  if (digitsOnly.length >= 10) {
    const last4 = digitsOnly.slice(-4)
    const first2 = digitsOnly.slice(0, 2)
    return `+91 ${first2}*** **${last4}`
  }
  return target
}

/**
 * Generates HMAC-SHA256 hash of (target + otp)
 */
export function hashOtp(target: string, otp: string): string {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(`${target.trim().toLowerCase()}:${otp.trim()}`)
    .digest('hex')
}

export interface SendOtpResult {
  success: boolean
  message: string
  maskedTarget?: string
  cooldownSeconds?: number
  expiresInMinutes?: number
}

export interface VerifyOtpResult {
  success: boolean
  message: string
  verificationToken?: string
  target?: string
  type?: 'phone' | 'email'
  remainingAttempts?: number
}

/**
 * Sends a new 6-digit OTP to the recipient
 */
export async function sendOtp(
  rawTarget: string,
  type: 'phone' | 'email'
): Promise<SendOtpResult> {
  const target = normalizeTarget(rawTarget, type)

  // Validation
  if (type === 'phone') {
    const digits = target.replace(/\D/g, '')
    // Must have 10 digits for Indian number (with 91 prefix = 12 digits)
    if (digits.length < 10 || digits.length > 13) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit mobile number.',
      }
    }
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(target)) {
      return {
        success: false,
        message: 'Please provide a valid email address.',
      }
    }
  }

  const now = new Date()

  // 1. Check for active cooldown on existing OTP for this target
  const existing = await OtpVerification.findOne({
    target,
    type,
    verified: false,
  }).sort({ createdAt: -1 })

  if (existing && existing.resendAvailableAt > now) {
    const secondsLeft = Math.ceil(
      (existing.resendAvailableAt.getTime() - now.getTime()) / 1000
    )
    return {
      success: false,
      message: `Please wait ${secondsLeft} second${secondsLeft > 1 ? 's' : ''} before requesting another OTP.`,
      cooldownSeconds: secondsLeft,
    }
  }

  // 2. Generate cryptographically strong 6-digit OTP
  const otpNumber = crypto.randomInt(100000, 1000000)
  const otpString = otpNumber.toString()

  // 3. Hash OTP with salt and target
  const otpHash = hashOtp(target, otpString)

  // 4. Set expiration and resend cooldown dates
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)
  const resendAvailableAt = new Date(
    now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000
  )

  // 5. Invalidate older unverified OTPs for this target
  await OtpVerification.deleteMany({ target, type, verified: false })

  // 6. Save new OTP record
  await OtpVerification.create({
    target,
    type,
    otpHash,
    expiresAt,
    attempts: 0,
    resendAvailableAt,
    verified: false,
  })

  // 7. Deliver OTP via configured provider (Console in dev, SMS/Email in prod)
  const provider = getDeliveryProvider(type)
  await provider.sendOtp(target, type, otpString)

  return {
    success: true,
    message: `OTP sent to ${maskTarget(target, type)}`,
    maskedTarget: maskTarget(target, type),
    cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  }
}

/**
 * Verifies the 6-digit OTP code provided by the customer
 */
export async function verifyOtp(
  rawTarget: string,
  type: 'phone' | 'email',
  enteredOtp: string
): Promise<VerifyOtpResult> {
  const target = normalizeTarget(rawTarget, type)
  const cleanCode = enteredOtp.trim()

  if (!/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      message: 'Please enter a valid 6-digit verification code.',
    }
  }

  const now = new Date()

  // Find latest active OTP record
  const record = await OtpVerification.findOne({
    target,
    type,
    verified: false,
  }).sort({ createdAt: -1 })

  if (!record) {
    return {
      success: false,
      message: 'No active OTP found. Please request a new verification code.',
    }
  }

  // Check if expired
  if (record.expiresAt < now) {
    await OtpVerification.deleteOne({ _id: record._id })
    return {
      success: false,
      message: 'Verification code has expired. Please request a new OTP.',
    }
  }

  // Check max attempts limit
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await OtpVerification.deleteOne({ _id: record._id })
    return {
      success: false,
      message: 'Too many incorrect attempts. This OTP has expired. Please request a new code.',
      remainingAttempts: 0,
    }
  }

  // Check hash with timing-safe comparison
  const computedHash = hashOtp(target, cleanCode)
  const computedBuffer = Buffer.from(computedHash, 'utf8')
  const recordBuffer = Buffer.from(record.otpHash, 'utf8')

  const isMatch =
    computedBuffer.length === recordBuffer.length &&
    crypto.timingSafeEqual(computedBuffer, recordBuffer)

  if (!isMatch) {
    record.attempts += 1
    await record.save()

    const remaining = Math.max(0, OTP_MAX_ATTEMPTS - record.attempts)
    if (remaining === 0) {
      await OtpVerification.deleteOne({ _id: record._id })
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
        remainingAttempts: 0,
      }
    }

    return {
      success: false,
      message: `Invalid verification code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
      remainingAttempts: remaining,
    }
  }

  // SUCCESS: Issue a signed verification token (valid for 30 minutes)
  const tokenPayload = {
    target,
    type,
    verified: true,
    verifiedAt: now.toISOString(),
  }

  const verificationToken = jwt.sign(tokenPayload, getOtpSecret(), {
    expiresIn: '30m',
  })

  // Mark record as verified and store verificationToken
  record.verified = true
  record.verifiedAt = now
  record.verificationToken = verificationToken
  // Extend record expiry so token check works during checkout
  record.expiresAt = new Date(now.getTime() + 30 * 60 * 1000)
  await record.save()

  return {
    success: true,
    message: 'Contact verified successfully.',
    verificationToken,
    target,
    type,
  }
}

/**
 * Validates a verification token against both cryptographic signature and database record
 */
export async function validateVerificationToken(
  token: string,
  expectedTarget?: string
): Promise<{ valid: boolean; target?: string; type?: 'phone' | 'email'; message?: string }> {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { valid: false, message: 'Missing verification token.' }
  }

  try {
    const decoded = jwt.verify(token.trim(), getOtpSecret()) as any
    if (!decoded || !decoded.verified || !decoded.target || !decoded.type) {
      return { valid: false, message: 'Invalid verification token format.' }
    }

    // Verify token exists in database and is marked verified
    const dbRecord = await OtpVerification.findOne({
      verificationToken: token.trim(),
      verified: true,
    })

    if (!dbRecord) {
      return { valid: false, message: 'Verification session has expired or is invalid.' }
    }

    if (expectedTarget) {
      const normalizedExpected = normalizeTarget(expectedTarget, decoded.type)
      const normalizedTokenTarget = normalizeTarget(decoded.target, decoded.type)

      // Allow matching either normalized with or without country code for phone
      const phoneMatch =
        decoded.type === 'phone' &&
        (normalizedExpected.replace(/\D/g, '').endsWith(normalizedTokenTarget.replace(/\D/g, '').slice(-10)) ||
          normalizedTokenTarget.replace(/\D/g, '').endsWith(normalizedExpected.replace(/\D/g, '').slice(-10)))

      const emailMatch =
        decoded.type === 'email' &&
        normalizedExpected.toLowerCase() === normalizedTokenTarget.toLowerCase()

      if (!phoneMatch && !emailMatch) {
        return {
          valid: false,
          message: 'Verification token contact does not match order contact details.',
        }
      }
    }

    return {
      valid: true,
      target: decoded.target,
      type: decoded.type,
    }
  } catch (err: any) {
    return { valid: false, message: 'Expired or invalid verification token.' }
  }
}
