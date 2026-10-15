import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DESIGNATHON_CLIENT_CONFIG } from '../config/designathonConfig'
import {
  fetchDesignathonConfig,
  registerForDesignathon,
  createDesignathonOrder,
  verifyDesignathonPayment,
  type DesignathonRegistrationPayload,
} from '../services/designathonApi'
import { loadRazorpayScript } from '../services/paymentApi'
import type { RazorpaySuccessResponse, RazorpayErrorResponse } from '../types/razorpay'
import '../styles/Designathon.css'

interface FormState {
  fullName: string
  whatsappNumber: string
  email: string
  collegeName: string
  department: string
  currentYearSemester: string
  refundPolicyAcknowledged: boolean
  termsAcknowledged: boolean
}

const INITIAL_FORM: FormState = {
  fullName: '',
  whatsappNumber: '',
  email: '',
  collegeName: '',
  department: '',
  currentYearSemester: '1st Year',
  refundPolicyAcknowledged: false,
  termsAcknowledged: false,
}

const SUPPORTED_YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year / Integrated',
  'Postgraduate / Masters',
  'Other / PhD',
]

export const Designathon: React.FC = () => {
  const [eventConfig, setEventConfig] = useState<any>(null)
  const [windowState, setWindowState] = useState<{
    isOpen: boolean
    status: 'upcoming' | 'open' | 'closed'
    message: string
  }>({
    isOpen: true, // open immediately for testing and review
    status: 'open',
    message: 'Registrations are open.',
  })

  const [formData, setFormData] = useState<FormState>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [activeRegistrationId, setActiveRegistrationId] = useState<string | null>(null)

  // Success Confirmation State
  const [confirmedRegistration, setConfirmedRegistration] = useState<{
    registrationId: string
    fullName: string
    email: string
    whatsappNumber: string
    collegeName: string
    department: string
    currentYearSemester: string
    paymentId?: string
  } | null>(null)

  const formSectionRef = useRef<HTMLDivElement>(null)

  // Load public config and window status on mount
  useEffect(() => {
    let isMounted = true
    fetchDesignathonConfig()
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.config) {
          setEventConfig(res.config)
          if (res.config.window) {
            setWindowState(res.config.window)
          }
        }
      })
      .catch((err) => {
        console.warn('[Designathon] Could not load dynamic config:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const scrollToForm = () => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear individual field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
    if (generalError) setGeneralError(null)
  }

  // Frontend client validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2 || formData.fullName.trim().length > 80) {
      errors.fullName = 'Full name must be between 2 and 80 characters.'
    }

    const cleanPhone = formData.whatsappNumber.replace(/[\s\-\(\)\.]/g, '')
    const phoneValid = /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanPhone)
    if (!formData.whatsappNumber.trim()) {
      errors.whatsappNumber = 'WhatsApp number is required.'
    } else if (!phoneValid) {
      errors.whatsappNumber = 'Please enter a valid 10-digit Indian WhatsApp mobile number (starting with 6-9).'
    }

    const cleanEmail = formData.email.trim().toLowerCase()
    const emailValid = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(cleanEmail)
    if (!formData.email.trim()) {
      errors.email = 'Gmail address is required.'
    } else if (!emailValid) {
      errors.email = 'A valid Gmail address (@gmail.com) is required for event updates and design submissions.'
    }

    if (!formData.collegeName.trim() || formData.collegeName.trim().length < 2 || formData.collegeName.trim().length > 150) {
      errors.collegeName = 'College name must be between 2 and 150 characters.'
    }

    if (!formData.department.trim() || formData.department.trim().length < 2 || formData.department.trim().length > 100) {
      errors.department = 'Department must be between 2 and 100 characters.'
    }

    if (!formData.currentYearSemester.trim()) {
      errors.currentYearSemester = 'Please select your current year / semester.'
    }

    if (!formData.refundPolicyAcknowledged) {
      errors.refundPolicyAcknowledged = 'You must acknowledge that the ₹49 fee is non-refundable.'
    }

    if (!formData.termsAcknowledged) {
      errors.termsAcknowledged = 'You must agree to the event terms and privacy notice.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission and Razorpay checkout
  const handleSubmitAndPay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setGeneralError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create or update pending registration
      const regPayload: DesignathonRegistrationPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        whatsappNumber: formData.whatsappNumber.trim(),
        collegeName: formData.collegeName.trim(),
        department: formData.department.trim(),
        currentYearSemester: formData.currentYearSemester.trim(),
        refundPolicyAcknowledged: formData.refundPolicyAcknowledged,
        termsAcknowledged: formData.termsAcknowledged,
      }

      const regResult = await registerForDesignathon(regPayload)

      if (!regResult.success || !regResult.registrationId) {
        if (regResult.errors) {
          setFieldErrors(regResult.errors)
        }
        throw new Error(regResult.message || 'Registration failed.')
      }

      const targetRegId = regResult.registrationId
      setActiveRegistrationId(targetRegId)

      // 2. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.')
      }

      // 3. Initiate Razorpay Order Server-Side (fixed 4,900 paise = ₹49)
      const orderData = await createDesignathonOrder(targetRegId)

      if (!orderData.order_id || !orderData.key_id) {
        throw new Error(orderData.message || 'Failed to initiate payment order.')
      }

      // 4. Configure Razorpay Checkout Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount || 4900,
        currency: orderData.currency || 'INR',
        name: 'KALA',
        description: `Designathon in GGV — ${targetRegId}`,
        image: '/favicon.png',
        order_id: orderData.order_id,
        handler: async (paymentResponse: RazorpaySuccessResponse) => {
          try {
            setIsSubmitting(true)

            // 5. Server-Side Cryptographic Signature Verification
            const verifyRes = await verifyDesignathonPayment({
              registrationId: targetRegId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            })

            if (!verifyRes.success) {
              throw new Error(verifyRes.message || 'Payment verification failed.')
            }

            // Success state transition
            setConfirmedRegistration({
              registrationId: targetRegId,
              fullName: formData.fullName.trim(),
              email: formData.email.trim().toLowerCase(),
              whatsappNumber: formData.whatsappNumber.trim(),
              collegeName: formData.collegeName.trim(),
              department: formData.department.trim(),
              currentYearSemester: formData.currentYearSemester.trim(),
              paymentId: paymentResponse.razorpay_payment_id,
            })

            setIsSubmitting(false)
          } catch (verifyErr: any) {
            console.error('[Designathon] Payment verification error:', verifyErr)
            setGeneralError(
              verifyErr.message ||
                'Payment verification failed. If your bank was debited, please contact support with Registration ID: ' +
                  targetRegId
            )
            setIsSubmitting(false)
          }
        },
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          contact: formData.whatsappNumber.trim(),
        },
        theme: {
          color: '#D94700',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false)
            setGeneralError(
              'Payment was not completed. Your details are saved — you can click "RETRY PAYMENT" below to complete your registration.'
            )
          },
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', (errResp: RazorpayErrorResponse) => {
        console.error('[Razorpay] Payment failed:', errResp)
        setIsSubmitting(false)
        setGeneralError(
          errResp?.error?.description ||
            'Payment failed. Please try again with UPI, Card, or NetBanking.'
        )
      })

      rzp.open()
    } catch (err: any) {
      console.error('[Designathon] Registration process error:', err)
      setGeneralError(err.message || 'Unable to complete registration. Please try again.')
      setIsSubmitting(false)
    }
  }

  const cfg = eventConfig || DESIGNATHON_CLIENT_CONFIG

  return (
    <div className="kala-designathon-page">
      {/* =====================================================================
          1. HERO SECTION WITH EVENT TITLE, SLOGAN, BADGES & CTA
          ===================================================================== */}
      <section className="dsn-hero" aria-label="Event overview">
        <div className="dsn-container">
          <div className="dsn-hero-badge-wrap">
            <span className="dsn-status-pill live">
              <span className="dsn-pulse-dot" aria-hidden="true" />
              <span>OFFICIAL EVENT</span>
            </span>
            <span className="dsn-tag-pill">GGV BILASPUR</span>
            <span className="dsn-tag-pill highlight">₹49 ENTRY</span>
          </div>

          <h1 className="dsn-title">
            DESIGNATHON IN GGV <span className="dsn-by-kala">BY KALA</span>
          </h1>

          <p className="dsn-slogan">SHOW YOUR कला</p>

          <p className="dsn-lead">
            Unleash your creativity, craft original streetwear graphics, and battle with student
            designers across colleges. Compete for custom printed T-shirts and exclusive KALA gear.
          </p>

          {/* Quick Schedule Grid */}
          <div className="dsn-stats-grid" role="region" aria-label="Key event dates">
            <div className="dsn-stat-card">
              <span className="dsn-stat-icon" aria-hidden="true">📅</span>
              <span className="dsn-stat-label">EVENT DATE</span>
              <span className="dsn-stat-val">{cfg.eventDate}</span>
              <span className="dsn-stat-sub">{cfg.eventTime}</span>
            </div>

            <div className="dsn-stat-card">
              <span className="dsn-stat-icon" aria-hidden="true">🏆</span>
              <span className="dsn-stat-label">RESULTS</span>
              <span className="dsn-stat-val">{cfg.resultsAnnouncement}</span>
              <span className="dsn-stat-sub">Judged &amp; Verified</span>
            </div>

            <div className="dsn-stat-card">
              <span className="dsn-stat-icon" aria-hidden="true">📍</span>
              <span className="dsn-stat-label">VENUE</span>
              <span className="dsn-stat-val">{cfg.venue || 'To be announced'}</span>
              <span className="dsn-stat-sub">GGV Campus</span>
            </div>

            <div className="dsn-stat-card">
              <span className="dsn-stat-icon" aria-hidden="true">🎟️</span>
              <span className="dsn-stat-label">REGISTRATION FEE</span>
              <span className="dsn-stat-val">₹49</span>
              <span className="dsn-stat-sub">Individual Entry</span>
            </div>
          </div>

          <div className="dsn-hero-actions">
            <button
              type="button"
              className="kala-btn dsn-hero-cta"
              onClick={scrollToForm}
              aria-label="Scroll to registration form"
            >
              <span>REGISTER NOW • ₹49</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </button>
            <a
              href={`https://wa.me/${cfg.contact.whatsapp}?text=Hi%20KALA,%20I%20have%20a%20question%20about%20Designathon`}
              target="_blank"
              rel="noopener noreferrer"
              className="kala-btn dsn-whatsapp-btn"
              aria-label="Ask questions on WhatsApp (messages only)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span>Questions? WhatsApp Us</span>
            </a>
          </div>

          {/* Registration window notice banner */}
          <div className="dsn-window-notice" role="status">
            <span className="dsn-notice-bullet">ℹ️</span>
            <span>
              <strong>Registration:</strong> Open Now • Closes 23 October 2026 at 6:00 PM IST.
              {windowState.status === 'open' && ' (Live Now — Form Active)'}
              {windowState.status === 'upcoming' && ' (Registrations open soon)'}
              {windowState.status === 'closed' && ' (Registrations have closed)'}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CONFIRMED PRIZES SHOWCASE
          ===================================================================== */}
      <section className="dsn-prizes-section" aria-labelledby="prizes-heading">
        <div className="dsn-container">
          <div className="dsn-section-header">
            <span className="dsn-section-eyebrow">RECOGNITION &amp; REWARDS</span>
            <h2 id="prizes-heading" className="dsn-section-title">
              CONFIRMED PRIZES
            </h2>
            <p className="dsn-section-subtitle">
              Original ideas deserve real drip. Winning designs get printed into tangible streetwear.
            </p>
          </div>

          <div className="dsn-prizes-grid">
            {/* 1st Prize */}
            <div className="dsn-prize-card first">
              <div className="dsn-prize-badge">🥇 1ST PLACE</div>
              <h3 className="dsn-prize-title">Grand Winner</h3>
              <p className="dsn-prize-desc">{cfg.prizes.first}</p>
              <div className="dsn-prize-features">
                <span>✓ Winner's own design custom-printed on luxury 220 GSM tee</span>
                <span>✓ Plus an official exclusive KALA signature T-shirt</span>
              </div>
            </div>

            {/* 2nd Prize */}
            <div className="dsn-prize-card second">
              <div className="dsn-prize-badge">🥈 2ND PLACE</div>
              <h3 className="dsn-prize-title">Runner Up</h3>
              <p className="dsn-prize-desc">{cfg.prizes.second}</p>
              <div className="dsn-prize-features">
                <span>✓ Winner's design printed on KALA apparel</span>
                <span>✓ 30% discount coupon for eligible KALA Store apparel</span>
              </div>
            </div>

            {/* 3rd Prize */}
            <div className="dsn-prize-card third">
              <div className="dsn-prize-badge">🥉 3RD PLACE</div>
              <h3 className="dsn-prize-title">Podium Winner</h3>
              <p className="dsn-prize-desc">{cfg.prizes.third}</p>
              <div className="dsn-prize-features">
                <span>✓ Official KALA apparel prize</span>
                <span>✓ Special jury recognition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. EVENT GUIDELINES & DISCLOSURES
          ===================================================================== */}
      <section className="dsn-rules-section" aria-labelledby="guidelines-heading">
        <div className="dsn-container">
          <div className="dsn-section-header">
            <span className="dsn-section-eyebrow">RULES &amp; SPECIFICATIONS</span>
            <h2 id="guidelines-heading" className="dsn-section-title">
              EVENT FORMAT &amp; GUIDELINES
            </h2>
          </div>

          <div className="dsn-rules-grid">
            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">👤</div>
              <h4>Individual Participation</h4>
              <p>Participation is individual only. Every student submits their own original concept.</p>
            </div>

            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">🎓</div>
              <h4>Open Eligibility</h4>
              <p>Students from any college or department are welcome to participate.</p>
            </div>

            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">⏱️</div>
              <h4>Format Details</h4>
              <p>Event format: <strong>{cfg.eventFormat || 'To be announced'}</strong>. Detailed briefing will be shared prior to event day.</p>
            </div>

            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">⚖️</div>
              <h4>Judging &amp; Evaluation</h4>
              <p><strong>{cfg.judgingCriteria || 'Winners are selected by judges; judging criteria will be announced.'}</strong></p>
            </div>

            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">🎨</div>
              <h4>Design Submission</h4>
              <p><strong>{cfg.submissionInstructions || 'Submissions on event day; exact submission method and deadline are pending.'}</strong> No upload required during registration.</p>
            </div>

            <div className="dsn-rule-item">
              <div className="dsn-rule-icon">💳</div>
              <h4>Non-Refundable Fee</h4>
              <p>The ₹49 registration fee is strictly non-refundable once paid.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. REGISTRATION FORM OR CONFIRMED PASS
          ===================================================================== */}
      <section className="dsn-form-section" ref={formSectionRef} aria-labelledby="register-heading">
        <div className="dsn-container">
          {confirmedRegistration ? (
            /* 4A. SUCCESS STATE: CONFIRMED REGISTRATION PASS */
            <div className="dsn-success-ticket" role="region" aria-label="Registration confirmed ticket">
              <div className="dsn-ticket-header">
                <div className="dsn-ticket-logo">
                  KALA<span className="dsn-accent">.</span> DESIGNATHON
                </div>
                <div className="dsn-ticket-badge">CONFIRMED PASS</div>
              </div>

              <div className="dsn-ticket-body">
                <div className="dsn-ticket-headline">
                  <span className="dsn-check-icon">✓</span>
                  <h3>You're In! Registration Confirmed</h3>
                  <p>A confirmation email has been dispatched to <strong>{confirmedRegistration.email}</strong>.</p>
                </div>

                <div className="dsn-ticket-details-grid">
                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">REGISTRATION ID</span>
                    <span className="dsn-cell-value dsn-highlight-id">{confirmedRegistration.registrationId}</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">PARTICIPANT NAME</span>
                    <span className="dsn-cell-value">{confirmedRegistration.fullName}</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">COLLEGE</span>
                    <span className="dsn-cell-value">{confirmedRegistration.collegeName}</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">DEPARTMENT &amp; YEAR</span>
                    <span className="dsn-cell-value">
                      {confirmedRegistration.department} ({confirmedRegistration.currentYearSemester})
                    </span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">PAYMENT STATUS</span>
                    <span className="dsn-cell-value green">₹49 (Verified via Razorpay)</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">EVENT DATE &amp; TIME</span>
                    <span className="dsn-cell-value">24 October 2026 • 11:00 AM–2:00 PM</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">VENUE</span>
                    <span className="dsn-cell-value">To be announced (GGV Campus)</span>
                  </div>

                  <div className="dsn-ticket-cell">
                    <span className="dsn-cell-label">DESIGN SUBMISSION</span>
                    <span className="dsn-cell-value">On event day (instructions will be shared)</span>
                  </div>
                </div>

                <div className="dsn-ticket-footer-actions">
                  <button
                    type="button"
                    className="kala-btn dsn-print-btn"
                    onClick={() => window.print()}
                  >
                    <span>Print / Save Pass</span>
                  </button>
                  <Link to="/shop" className="kala-btn dsn-shop-btn">
                    <span>Explore KALA Streetwear</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* 4B. ACTIVE REGISTRATION FORM */
            <div className="dsn-form-card">
              <div className="dsn-form-header">
                <h2 id="register-heading" className="dsn-form-title">
                  REGISTER FOR DESIGNATHON
                </h2>
                <p className="dsn-form-subtitle">
                  Individual entry • ₹49 one-time registration fee • Direct payment via Razorpay
                </p>
              </div>

              {generalError && (
                <div className="dsn-error-banner" role="alert">
                  <span className="dsn-alert-icon">⚠️</span>
                  <div className="dsn-alert-text">{generalError}</div>
                </div>
              )}

              <form onSubmit={handleSubmitAndPay} noValidate className="dsn-form">
                <div className="dsn-form-grid">
                  {/* Full Name */}
                  <div className="dsn-input-group">
                    <label htmlFor="fullName" className="dsn-label">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className={`dsn-input ${fieldErrors.fullName ? 'error' : ''}`}
                      placeholder="e.g. Aarav Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      autoComplete="name"
                      disabled={isSubmitting}
                      required
                    />
                    {fieldErrors.fullName && <span className="dsn-field-error">{fieldErrors.fullName}</span>}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="dsn-input-group">
                    <label htmlFor="whatsappNumber" className="dsn-label">
                      WhatsApp Number *
                    </label>
                    <input
                      id="whatsappNumber"
                      name="whatsappNumber"
                      type="tel"
                      className={`dsn-input ${fieldErrors.whatsappNumber ? 'error' : ''}`}
                      placeholder="10-digit mobile number (e.g. 9406030116)"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="dsn-hint">Required for official event communications and updates.</span>
                    {fieldErrors.whatsappNumber && (
                      <span className="dsn-field-error">{fieldErrors.whatsappNumber}</span>
                    )}
                  </div>

                  {/* Gmail Address */}
                  <div className="dsn-input-group">
                    <label htmlFor="email" className="dsn-label">
                      Gmail Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`dsn-input ${fieldErrors.email ? 'error' : ''}`}
                      placeholder="yourname@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="dsn-hint">
                      A valid Gmail (@gmail.com) address is required for Google Workspace submission access.
                    </span>
                    {fieldErrors.email && <span className="dsn-field-error">{fieldErrors.email}</span>}
                  </div>

                  {/* College Name */}
                  <div className="dsn-input-group">
                    <label htmlFor="collegeName" className="dsn-label">
                      College / University Name *
                    </label>
                    <input
                      id="collegeName"
                      name="collegeName"
                      type="text"
                      className={`dsn-input ${fieldErrors.collegeName ? 'error' : ''}`}
                      placeholder="e.g. Guru Ghasidas Vishwavidyalaya"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    {fieldErrors.collegeName && <span className="dsn-field-error">{fieldErrors.collegeName}</span>}
                  </div>

                  {/* Department */}
                  <div className="dsn-input-group">
                    <label htmlFor="department" className="dsn-label">
                      Department / Branch *
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      className={`dsn-input ${fieldErrors.department ? 'error' : ''}`}
                      placeholder="e.g. Computer Science / Design / Commerce"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    {fieldErrors.department && <span className="dsn-field-error">{fieldErrors.department}</span>}
                  </div>

                  {/* Current Year / Semester */}
                  <div className="dsn-input-group">
                    <label htmlFor="currentYearSemester" className="dsn-label">
                      Current Year / Semester *
                    </label>
                    <select
                      id="currentYearSemester"
                      name="currentYearSemester"
                      className={`dsn-input dsn-select ${fieldErrors.currentYearSemester ? 'error' : ''}`}
                      value={formData.currentYearSemester}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    >
                      {SUPPORTED_YEAR_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.currentYearSemester && (
                      <span className="dsn-field-error">{fieldErrors.currentYearSemester}</span>
                    )}
                  </div>
                </div>

                {/* Participation: Fixed badge */}
                <div className="dsn-participation-pill-box">
                  <span className="dsn-pill-label">PARTICIPATION:</span>
                  <span className="dsn-pill-value">Individual Only (Fixed)</span>
                  <span className="dsn-pill-note">• No teams or group entries</span>
                </div>

                {/* Non-refundable Disclosure Box */}
                <div className="dsn-disclosure-box">
                  <div className="dsn-disclosure-row">
                    <span className="dsn-fee-tag">₹49 NON-REFUNDABLE REGISTRATION FEE</span>
                  </div>
                  <p className="dsn-disclosure-text">
                    The ₹49 registration fee confirms your individual entry and seat for the Designathon.
                    As per published event policy, registration fees are strictly <strong>non-refundable</strong>.
                  </p>
                </div>

                {/* Required Checkboxes */}
                <div className="dsn-checkboxes">
                  <label className="dsn-checkbox-label">
                    <input
                      type="checkbox"
                      name="refundPolicyAcknowledged"
                      checked={formData.refundPolicyAcknowledged}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    <span>
                      I understand and acknowledge that the <strong>₹49 registration fee is non-refundable</strong> under any circumstances. *
                    </span>
                  </label>
                  {fieldErrors.refundPolicyAcknowledged && (
                    <span className="dsn-field-error">{fieldErrors.refundPolicyAcknowledged}</span>
                  )}

                  <label className="dsn-checkbox-label">
                    <input
                      type="checkbox"
                      name="termsAcknowledged"
                      checked={formData.termsAcknowledged}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />
                    <span>
                      I agree to the event guidelines, participant code of conduct, and privacy notice. *
                    </span>
                  </label>
                  {fieldErrors.termsAcknowledged && (
                    <span className="dsn-field-error">{fieldErrors.termsAcknowledged}</span>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="dsn-privacy-notice">
                  <span className="dsn-lock-symbol" aria-hidden="true">🔒</span>
                  <span>
                    <strong>Privacy Notice:</strong> Your registration details are collected solely to administer the
                    event, verify eligibility, and communicate official updates. KALA does not publish public participant
                    rosters or share your information with external advertisers.
                  </span>
                </div>

                {/* Submit / Pay CTA Button with double-click prevention */}
                <div className="dsn-submit-wrap">
                  <button
                    type="submit"
                    className="kala-btn dsn-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="dsn-submitting-state">
                        <span className="dsn-spinner" aria-hidden="true" />
                        <span>PROCESSING VIA RAZORPAY...</span>
                      </span>
                    ) : activeRegistrationId && generalError ? (
                      <span>RETRY PAYMENT (₹49) →</span>
                    ) : (
                      <span>PROCEED TO PAYMENT (₹49) →</span>
                    )}
                  </button>

                  <div className="dsn-security-strip">
                    <span>🔒 Secured by <strong>Razorpay</strong></span>
                    <span>• UPI, GPay, PhonePe, Cards, NetBanking</span>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          5. CONTACT & PROMOTIONAL SOCIAL LINKS
          ===================================================================== */}
      <section className="dsn-contact-section" aria-label="Event inquiries and social links">
        <div className="dsn-container">
          <div className="dsn-contact-card">
            <h3 className="dsn-contact-title">HAVE QUESTIONS OR NEED ASSISTANCE?</h3>
            <p className="dsn-contact-desc">
              Reach out directly to the KALA event coordination team.
            </p>

            <div className="dsn-contact-items-grid">
              <a
                href={`https://wa.me/${cfg.contact.whatsapp}?text=Hi%20KALA,%20regarding%20the%20Designathon`}
                target="_blank"
                rel="noopener noreferrer"
                className="dsn-contact-cell"
              >
                <span className="dsn-cell-icon" aria-hidden="true">💬</span>
                <span className="dsn-cell-type">WhatsApp (Messages Only)</span>
                <span className="dsn-cell-link">{cfg.contact.whatsappDisplay}</span>
              </a>

              <a
                href={`mailto:${cfg.contact.email}`}
                className="dsn-contact-cell"
              >
                <span className="dsn-cell-icon" aria-hidden="true">✉️</span>
                <span className="dsn-cell-type">Official Email</span>
                <span className="dsn-cell-link">{cfg.contact.email}</span>
              </a>

              <a
                href={cfg.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="dsn-contact-cell"
              >
                <span className="dsn-cell-icon" aria-hidden="true">📸</span>
                <span className="dsn-cell-type">Instagram Community</span>
                <span className="dsn-cell-link">@kala_originals</span>
              </a>
            </div>

            <p className="dsn-social-disclaimer">
              * Note: Following KALA on social platforms is an optional promotional CTA and is not required to register or win.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Designathon
