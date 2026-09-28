import React, { useState, useEffect, useRef } from 'react'
import { sendOtp, verifyOtp } from '../../services/otpApi'

interface ContactVerificationProps {
  phone: string
  email: string
  onPhoneChange: (newPhone: string) => void
  onEmailChange: (newEmail: string) => void
  isVerified: boolean
  verificationToken: string | null
  verifiedContact: { type: 'phone' | 'email'; target: string } | null
  onVerificationSuccess: (token: string, contact: { type: 'phone' | 'email'; target: string }) => void
  onResetVerification: () => void
}

export const ContactVerification: React.FC<ContactVerificationProps> = ({
  phone,
  email,
  onPhoneChange,
  onEmailChange,
  isVerified,
  verifiedContact,
  onVerificationSuccess,
  onResetVerification,
}) => {
  // Verification method tab: 'phone' or 'email'
  const [method, setMethod] = useState<'phone' | 'email'>('phone')

  // Step state: 'input' | 'otp'
  const [step, setStep] = useState<'input' | 'otp'>('input')

  // Input states
  const [phoneInput, setPhoneInput] = useState<string>(phone)
  const [emailInput, setEmailInput] = useState<string>(email)

  // Sync external changes when not in OTP mode
  useEffect(() => {
    if (step === 'input' && !isVerified) {
      if (phone) setPhoneInput(phone)
      if (email) setEmailInput(email)
    }
  }, [phone, email, step, isVerified])

  // OTP 6-box input state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Loading & error states
  const [isSending, setIsSending] = useState<boolean>(false)
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [maskedRecipient, setMaskedRecipient] = useState<string>('')

  // Cooldown countdown timer
  const [countdown, setCountdown] = useState<number>(0)
  const timerRef = useRef<any>(null)

  // Start countdown timer helper
  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdown(seconds)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Auto-focus first input when OTP step opens
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  // Handle Send OTP
  const handleSendOtp = async (_isResend = false) => {
    setErrorMessage(null)

    const target = method === 'phone' ? phoneInput.trim() : emailInput.trim()

    // Client-side quick check
    if (method === 'phone') {
      const cleanPhone = target.replace(/[\s-+]/g, '')
      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.')
        return
      }
      onPhoneChange(target)
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!target || !emailRegex.test(target)) {
        setErrorMessage('Please enter a valid email address.')
        return
      }
      onEmailChange(target)
    }

    setIsSending(true)

    try {
      const res = await sendOtp(target, method)
      if (res.success) {
        setMaskedRecipient(res.maskedTarget || target)
        setStep('otp')
        setOtpDigits(['', '', '', '', '', ''])
        startCountdown(res.cooldownSeconds || 60)
        setErrorMessage(null)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code. Please try again.')
      if (err.cooldownSeconds) {
        startCountdown(err.cooldownSeconds)
      }
    } finally {
      setIsSending(false)
    }
  }

  // Handle OTP Box Input Change
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length > 1) {
      // User pasted into box or typed multiple characters
      handleOtpPaste(cleaned)
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = cleaned

    setOtpDigits(nextDigits)
    setErrorMessage(null)

    // Auto-focus next input box if a digit was entered
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle Backspace & Navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        // Clear current box
        const nextDigits = [...otpDigits]
        nextDigits[index] = ''
        setOtpDigits(nextDigits)
      } else if (index > 0) {
        // Focus previous box and clear it
        inputRefs.current[index - 1]?.focus()
        const nextDigits = [...otpDigits]
        nextDigits[index - 1] = ''
        setOtpDigits(nextDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle Paste
  const handleOtpPaste = (pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length === 0) return

    const nextDigits = [...otpDigits]
    digits.forEach((d, idx) => {
      if (idx < 6) nextDigits[idx] = d
    })

    setOtpDigits(nextDigits)
    setErrorMessage(null)

    // Focus appropriate box
    const nextFocusIndex = Math.min(digits.length, 5)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)

    const code = otpDigits.join('')
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.')
      return
    }

    const target = method === 'phone' ? phoneInput.trim() : emailInput.trim()

    setIsVerifying(true)

    try {
      const res = await verifyOtp(target, method, code)
      if (res.success && res.verificationToken) {
        onVerificationSuccess(res.verificationToken, {
          type: method,
          target: res.verifiedContact?.target || target,
        })
        if (timerRef.current) clearInterval(timerRef.current)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code. Please check and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle "Change number/email" option
  const handleChangeContact = () => {
    setStep('input')
    setErrorMessage(null)
    setOtpDigits(['', '', '', '', '', ''])
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // ==========================================
  // 1. SUCCESS STATE: Contact Verified ✓
  // ==========================================
  if (isVerified && verifiedContact) {
    const isMobile = verifiedContact.type === 'phone'
    return (
      <section className="kala-checkout-section kala-otp-verified-section" aria-labelledby="verify-contact-heading">
        <div className="kala-otp-verified-card">
          <div className="kala-otp-verified-icon" aria-hidden="true">
            ✓
          </div>
          <div className="kala-otp-verified-content">
            <h2 id="verify-contact-heading" className="kala-otp-verified-title">
              Contact Verified ✓
            </h2>
            <p className="kala-otp-verified-subtitle">
              Your contact details have been verified for this order.
            </p>
            <div className="kala-otp-verified-badge">
              <span>{isMobile ? '📱 Mobile Verified:' : '✉ Email Verified:'}</span>
              <strong>{verifiedContact.target}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetVerification}
            className="kala-otp-change-btn"
            title="Verify a different mobile number or email"
          >
            Change
          </button>
        </div>
      </section>
    )
  }

  // ==========================================
  // 2. ACTIVE VERIFICATION STEP
  // ==========================================
  return (
    <section className="kala-checkout-section kala-contact-verification-section" aria-labelledby="verify-heading">
      <div className="kala-verification-header">
        <h2 id="verify-heading" className="kala-checkout-section-title" style={{ marginBottom: '0.25rem' }}>
          VERIFY YOUR CONTACT
        </h2>
        <p className="kala-verification-subtitle">
          Verify your contact details to securely place your order.
        </p>
      </div>

      {step === 'input' ? (
        /* STEP A: Select Phone or Email & Request OTP */
        <div className="kala-verification-body">
          {/* Method Selector Tabs */}
          <div className="kala-otp-method-selector" role="tablist" aria-label="Verification method">
            <button
              type="button"
              role="tab"
              aria-selected={method === 'phone'}
              className={`kala-otp-method-tab ${method === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setMethod('phone')
                setErrorMessage(null)
              }}
            >
              <span className="kala-tab-icon">📱</span>
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={method === 'email'}
              className={`kala-otp-method-tab ${method === 'email' ? 'active' : ''}`}
              onClick={() => {
                setMethod('email')
                setErrorMessage(null)
              }}
            >
              <span className="kala-tab-icon">✉</span>
              <span>Email OTP</span>
            </button>
          </div>

          {/* Input field based on selected method */}
          {method === 'phone' ? (
            <div className="kala-otp-input-wrap">
              <label htmlFor="otp-phone-input" className="kala-form-label">
                Mobile Number *
              </label>
              <div className="kala-phone-input-group">
                <span className="kala-country-code-badge" title="Country code India">+91</span>
                <input
                  id="otp-phone-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="kala-form-input kala-otp-contact-input"
                  value={phoneInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhoneInput(cleaned)
                    onPhoneChange(cleaned)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  autoComplete="tel-national"
                />
              </div>
              <p className="kala-otp-field-hint">
                We'll send a 6-digit verification code to this mobile number.
              </p>
            </div>
          ) : (
            <div className="kala-otp-input-wrap">
              <label htmlFor="otp-email-input" className="kala-form-label">
                Email Address *
              </label>
              <input
                id="otp-email-input"
                type="email"
                placeholder="name@example.com"
                className="kala-form-input kala-otp-contact-input"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  onEmailChange(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                autoComplete="email"
              />
              <p className="kala-otp-field-hint">
                We'll send a 6-digit verification code to this email address.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="kala-otp-error-alert" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSendOtp(false)}
            disabled={isSending || (method === 'phone' ? phoneInput.length < 10 : !emailInput.trim())}
            className="kala-btn kala-btn-primary kala-send-otp-btn"
          >
            {isSending ? 'SENDING CODE...' : 'SEND OTP →'}
          </button>
        </div>
      ) : (
        /* STEP B: Enter 6-Digit OTP Code */
        <div className="kala-otp-code-container">
          <div className="kala-otp-code-header">
            <h3 className="kala-otp-code-title">Enter Verification Code</h3>
            <p className="kala-otp-code-destination">
              OTP sent to <strong>{maskedRecipient}</strong>
            </p>
          </div>

          {/* 6 Separate OTP Boxes */}
          <div
            className="kala-otp-boxes-group"
            onPaste={(e) => {
              e.preventDefault()
              const pastedData = e.clipboardData.getData('text')
              handleOtpPaste(pastedData)
            }}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className={`kala-otp-box ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {errorMessage && (
            <div className="kala-otp-error-alert" role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verify & Continue Button */}
          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={isVerifying || otpDigits.join('').length !== 6}
            className="kala-btn kala-btn-primary kala-verify-otp-btn"
          >
            {isVerifying ? 'VERIFYING CODE...' : 'VERIFY & CONTINUE'}
          </button>

          {/* Resend & Change Target Footer */}
          <div className="kala-otp-footer-controls">
            <div className="kala-otp-resend-wrap">
              {countdown > 0 ? (
                <span className="kala-otp-countdown-text">
                  Resend code in <strong>{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp(true)}
                  disabled={isSending}
                  className="kala-otp-resend-btn"
                >
                  {isSending ? 'Resending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleChangeContact}
              className="kala-otp-change-target-btn"
            >
              Change {method === 'phone' ? 'number' : 'email'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ContactVerification
