import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createCustomRequest, type CustomRequestInput } from '../../services/customRequestApi'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'

interface QuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  apparelName: string
  colorName: string
  quantity: number
  sizeBreakdownText: string
  unitPrice: number
  estimatedTotal: number
  requirement: string
  currentArtworkName?: string
  uploadedApparelFileName?: string
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  apparelName,
  colorName,
  quantity,
  sizeBreakdownText,
  unitPrice,
  estimatedTotal,
  requirement,
  currentArtworkName,
  uploadedApparelFileName,
}) => {
  const { currentUser, isAuthenticated } = useAuth()

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState(requirement || '')

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null)

  // Populate from authenticated user
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const name = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ')
      if (name && !fullName) setFullName(name)
      if (currentUser.email && !email) setEmail(currentUser.email)
      if (currentUser.phone && !phone) setPhone(currentUser.phone)
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    setNotes(requirement || '')
  }, [requirement])

  if (!isOpen) return null

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return false
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return false
    }

    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const payload: CustomRequestInput = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        apparelType: apparelName,
        quantity,
        sizeRange: sizeBreakdownText || 'Mixed Sizes',
        printingType: 'Custom Print & Embroidery',
        description: `Custom ${apparelName} (${colorName}) — ${quantity} pcs @ ₹${unitPrice}/pc. Estimated: ₹${estimatedTotal.toLocaleString('en-IN')}`,
        additionalRequirements: notes.trim(),
        fileName: currentArtworkName || undefined,
        apparelFileName: uploadedApparelFileName || undefined,
      }

      const res = await createCustomRequest(payload)

      if (res && res.success) {
        setSubmittedRequestId(res.requestId)
      } else {
        throw new Error(res?.message || 'Failed to submit quote request. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to submit quote request. Please try again or reach out on WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppFollowUp = () => {
    const url = generateWhatsAppInquiryUrl({
      apparelCategory: apparelName,
      color: colorName,
      customization: `Quote Request #${submittedRequestId || 'NEW'} — ${currentArtworkName || 'Custom Design'}`,
      approxQuantity: `${quantity} pcs`,
      requirement: `Hi KALA team, I just requested a quote for ${quantity} pcs ${apparelName} (${colorName}) under ${fullName}. Reference ID: ${submittedRequestId || 'Pending'}. Estimated total: ₹${estimatedTotal.toLocaleString('en-IN')}.`,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="kala-bulk-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="kala-bulk-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          type="button"
          className="kala-bulk-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {!submittedRequestId ? (
          <>
            <div className="kala-bulk-modal-header">
              <span className="kala-bulk-modal-eyebrow">CUSTOM APPAREL QUOTE</span>
              <h3 className="kala-bulk-modal-title">REQUEST YOUR OFFICIAL QUOTE</h3>
              <p className="kala-bulk-modal-desc">
                Receive exact pricing, high-definition digital mockup, and turnaround timeline within 2–4 hours.
              </p>
            </div>

            {/* Order Specification Summary Pill */}
            <div className="kala-bulk-modal-summary">
              <div className="kala-bulk-modal-summary-row">
                <span className="kala-bulk-modal-summary-label">Apparel</span>
                <strong className="kala-bulk-modal-summary-val">{apparelName} ({colorName})</strong>
              </div>
              <div className="kala-bulk-modal-summary-row">
                <span className="kala-bulk-modal-summary-label">Quantity</span>
                <strong className="kala-bulk-modal-summary-val">{quantity} pcs ({sizeBreakdownText || 'Standard'})</strong>
              </div>
              <div className="kala-bulk-modal-summary-row">
                <span className="kala-bulk-modal-summary-label">Design</span>
                <strong className="kala-bulk-modal-summary-val">{currentArtworkName || 'Default KALA Emblem'}</strong>
              </div>
              {uploadedApparelFileName && (
                <div className="kala-bulk-modal-summary-row">
                  <span className="kala-bulk-modal-summary-label">Your Apparel</span>
                  <strong className="kala-bulk-modal-summary-val">{uploadedApparelFileName}</strong>
                </div>
              )}
              <div className="kala-bulk-modal-summary-row highlight">
                <span className="kala-bulk-modal-summary-label">Estimated Investment</span>
                <strong className="kala-bulk-modal-summary-val orange">
                  ₹{estimatedTotal.toLocaleString('en-IN')} <small>({quantity} pcs @ ₹{unitPrice}/pc)</small>
                </strong>
              </div>
            </div>

            {error && (
              <div className="kala-bulk-modal-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="kala-bulk-modal-form">
              <div className="kala-bulk-modal-field">
                <label className="kala-bulk-modal-label" htmlFor="quote-name">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="quote-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="kala-bulk-modal-input"
                />
              </div>

              <div className="kala-bulk-modal-field-grid">
                <div className="kala-bulk-modal-field">
                  <label className="kala-bulk-modal-label" htmlFor="quote-email">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="kala-bulk-modal-input"
                  />
                </div>

                <div className="kala-bulk-modal-field">
                  <label className="kala-bulk-modal-label" htmlFor="quote-phone">
                    Phone / WhatsApp <span className="req">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="kala-bulk-modal-input"
                  />
                </div>
              </div>

              <div className="kala-bulk-modal-field">
                <label className="kala-bulk-modal-label" htmlFor="quote-notes">
                  Additional Notes / Requirements (Optional)
                </label>
                <textarea
                  id="quote-notes"
                  rows={2}
                  placeholder="Delivery deadline, logo placement instructions, fabric preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="kala-bulk-modal-textarea"
                />
              </div>

              <div className="kala-bulk-modal-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="kala-bulk-modal-submit-btn"
                >
                  {isSubmitting ? 'SUBMITTING REQUEST...' : 'CONFIRM & REQUEST QUOTE →'}
                </button>
              </div>

              <p className="kala-bulk-modal-security-note">
                🔒 No payment required now. Our team reviews all designs for quality before production.
              </p>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="kala-bulk-modal-success">
            <div className="kala-bulk-success-icon-wrap">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <span className="kala-bulk-success-tag">REQUEST RECEIVED</span>
            <h3 className="kala-bulk-success-title">QUOTE REQUEST SUBMITTED!</h3>

            <div className="kala-bulk-success-pill">
              <span>REFERENCE ID:</span>
              <strong>{submittedRequestId}</strong>
            </div>

            <p className="kala-bulk-success-msg">
              Thank you, <strong>{fullName}</strong>! Our custom apparel team has received your order specifications for <strong>{quantity} pcs {apparelName}</strong>.
            </p>

            <p className="kala-bulk-success-sub">
              We will contact you via WhatsApp and Phone within <strong>2–4 business hours</strong> with your high-resolution digital mockups, fabric samples, and finalized commercial invoice.
            </p>

            <div className="kala-bulk-success-actions">
              <button
                type="button"
                className="kala-bulk-success-wa-btn"
                onClick={handleWhatsAppFollowUp}
              >
                <span>💬 CHAT ON WHATSAPP NOW</span>
              </button>

              <button
                type="button"
                className="kala-bulk-success-done-btn"
                onClick={onClose}
              >
                CLOSE WORKSPACE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteRequestModal
