import { Request, Response } from 'express'
import { sendOtp as sendOtpService, verifyOtp as verifyOtpService } from '../services/otpService'

/**
 * POST /api/otp/send
 * Sends a 6-digit OTP code to the provided mobile number or email.
 * OTP is never returned in the HTTP response body.
 */
export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target, type } = req.body

    if (!target || typeof target !== 'string' || !target.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid mobile number or email address is required.',
      })
      return
    }

    if (type !== 'phone' && type !== 'email') {
      res.status(400).json({
        success: false,
        message: "Invalid verification type. Must be 'phone' or 'email'.",
      })
      return
    }

    const result = await sendOtpService(target.trim(), type)

    if (!result.success) {
      const isCooldown = result.cooldownSeconds !== undefined && result.cooldownSeconds > 0
      res.status(isCooldown ? 429 : 400).json({
        success: false,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds,
      })
      return
    }

    res.status(200).json({
      success: true,
      message: result.message,
      maskedTarget: result.maskedTarget,
      cooldownSeconds: result.cooldownSeconds,
      expiresInMinutes: result.expiresInMinutes,
    })
  } catch (error: any) {
    console.error('[OtpController] requestOtp error:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again shortly.',
    })
  }
}

/**
 * POST /api/otp/verify
 * Validates the 6-digit OTP code entered by the user.
 * Upon success, returns a signed verification token required for checkout order creation.
 */
export const verifyOtpCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { target, type, otp } = req.body

    if (!target || typeof target !== 'string' || !target.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid mobile number or email address is required.',
      })
      return
    }

    if (type !== 'phone' && type !== 'email') {
      res.status(400).json({
        success: false,
        message: "Invalid verification type. Must be 'phone' or 'email'.",
      })
      return
    }

    if (!otp || typeof otp !== 'string' || !otp.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit verification code.',
      })
      return
    }

    const result = await verifyOtpService(target.trim(), type, otp.trim())

    if (!result.success) {
      const isLockout = result.remainingAttempts === 0
      res.status(isLockout ? 429 : 400).json({
        success: false,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
      })
      return
    }

    res.status(200).json({
      success: true,
      message: result.message,
      verificationToken: result.verificationToken,
      verifiedContact: {
        type: result.type,
        target: result.target,
      },
    })
  } catch (error: any) {
    console.error('[OtpController] verifyOtpCode error:', error?.message || error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify code. Please try again.',
    })
  }
}
