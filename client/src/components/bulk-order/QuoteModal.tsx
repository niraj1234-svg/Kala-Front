import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  createBusinessRequest,
  type BackendBusinessRequest,
} from '../../services/businessRequestApi'
import { saveBusinessRequest } from '../../types/requests'
import {
  type BulkCategoryConfig,
  type StandardColor,
  type ColorOption,
  type SizeBreakdown,
  type PrintPosition,
  type CustomizationType,
  type BulkOrderCalculationResult,
} from '../../data/bulkPricing'
import { type UploadedArtwork } from './DesignUploader'

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  categoryConfig: BulkCategoryConfig
  colorType: StandardColor
  customColor: ColorOption
  quantity: number
  sizeBreakdown: SizeBreakdown
  printPosition: PrintPosition
  customization: CustomizationType
  uploadedArtwork: UploadedArtwork | null
  pricing: BulkOrderCalculationResult
  onSuccessSubmitted?: (quote: BackendBusinessRequest) => void
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  categoryConfig,
  colorType,
  customColor,
  quantity,
  sizeBreakdown,
  printPosition,
  customization,
  uploadedArtwork,
  pricing,
  onSuccessSubmitted,
}) => {
  const { currentUser } = useAuth()

  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [organizationType, setOrganizationType] = useState('Company')
  const [projectNotes, setProjectNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedQuote, setSubmittedQuote] = useState<BackendBusinessRequest | null>(null)

  useEffect(() => {
    if (currentUser) {
      const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ')
      if (fullName) setName(fullName)
      if (currentUser.email) setEmail(currentUser.email)
      if (currentUser.phone) setPhone(currentUser.phone)
    }
  }, [currentUser])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const formattedSizes = Object.entries(sizeBreakdown)
    .filter(([_, qty]) => qty > 0)
    .map(([size, qty]) => `${size}: ${qty}`)
    .join(', ')

  const resolvedColorName =
    colorType === 'Other' ? `${customColor.name} (${customColor.hex})` : colorType

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Contact name is required.'
    if (!organization.trim()) errs.organization = 'Company or organization name is required.'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      errs.email = 'Work email is required.'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!phone.trim()) {
      errs.phone = 'Phone number is required.'
    } else if (!phoneRegex.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number (7–15 digits).'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setIsSubmitting(true)

    // Build comprehensive specifications string for backend storage
    const detailedSpecs = [
      `[BULK ORDER CALCULATOR ESTIMATE]`,
      `Product: ${categoryConfig.name}`,
      `Color: ${resolvedColorName}`,
      `Total Quantity: ${quantity} units`,
      `Size Breakdown: ${formattedSizes || 'Standard mix'}`,
      `Customization: ${customization}`,
      `Print Position: ${printPosition}`,
      `Design Artwork: ${uploadedArtwork ? `${uploadedArtwork.name} (${uploadedArtwork.sizeKb}KB) - ${uploadedArtwork.position} print` : 'None uploaded'}`,
      `Unit Rate: ₹${pricing.totalPricePerPiece}`,
      `Estimated Subtotal: ₹${pricing.estimatedTotal.toLocaleString('en-IN')}`,
      projectNotes.trim() ? `Additional Notes: ${projectNotes.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const response = await createBusinessRequest({
        name: name.trim(),
        organization: organization.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organizationType,
        apparelRequired: categoryConfig.name,
        apparelTypes: [categoryConfig.name],
        quantity: `${quantity} units`,
        estimatedQuantity: `${quantity} units`,
        brandingRequirements: `${customization} (${printPosition})`,
        discussionTopics: ['Bulk Order Calculation', customization, printPosition],
        projectDetails: detailedSpecs,
        details: detailedSpecs,
        preferredMeetingMethod: 'Phone Call',
        preferredMeetingTime: 'Anytime',
      })

      if (response && response.success && response.requestId) {
        setSubmittedQuote(response.request)
        onSuccessSubmitted?.(response.request)

        try {
          saveBusinessRequest({
            id: response.requestId,
            createdAt: response.request.createdAt,
            name: response.request.name,
            organization: response.request.organization,
            email: response.request.email,
            phone: response.request.phone,
            organizationType: response.request.organizationType,
            apparelRequired: response.request.apparelRequired,
            quantity: response.request.quantity,
            requiredBy: 'Bulk Order Estimation',
            brandingRequirements: response.request.brandingRequirements,
            details: detailedSpecs,
            status: 'Quote Requested',
          })
        } catch {
          // Local storage fallback handled gracefully
        }
      } else {
        throw new Error(response?.message || 'Failed to submit bulk quote request.')
      }
    } catch (err: any) {
      console.error('[BulkOrderCalculator] Quote submission error:', err)
      setSubmitError(
        err.message || 'Unable to submit your bulk quote request right now. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="kala-bulk-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="kala-bulk-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="kala-bulk-modal-close"
          onClick={onClose}
          aria-label="Close quote modal"
        >
          ✕
        </button>

        {submittedQuote ? (
          /* SUCCESS STATE */
          <div className="kala-bulk-success-pane">
            <div className="kala-bulk-success-check-circle">✓</div>
            <h3 className="kala-bulk-success-title">Bulk Quote Request Sent!</h3>
            <p className="kala-bulk-success-sub">
              Your inquiry has been received by our commercial manufacturing desk.
            </p>

            <div className="kala-bulk-success-ref-card">
              <div className="kala-bulk-success-ref-row">
                <span>INQUIRY REF:</span>
                <strong>{submittedQuote.requestId}</strong>
              </div>
              <div className="kala-bulk-success-ref-row">
                <span>Estimated Stack:</span>
                <span>
                  {quantity}x {categoryConfig.name} ({resolvedColorName})
                </span>
              </div>
              <div className="kala-bulk-success-ref-row">
                <span>Estimated Value:</span>
                <span className="kala-bulk-success-val-highlight">
                  ₹{pricing.estimatedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="kala-bulk-success-note">
              Our business team will review your artwork and size distribution, and connect with you on WhatsApp / Phone within 2 business hours.
            </p>

            <button
              type="button"
              className="kala-bulk-modal-confirm-btn"
              onClick={onClose}
            >
              Close &amp; Return to Store
            </button>
          </div>
        ) : (
          /* FORM SUBMISSION STATE */
          <div className="kala-bulk-modal-form-pane">
            <div className="kala-bulk-modal-header">
              <span className="kala-bulk-modal-badge">COMMERCIAL QUOTE REQUEST</span>
              <h3 className="kala-bulk-modal-title">Finalize Your Bulk Inquiry</h3>
              <p className="kala-bulk-modal-desc">
                Review your stack estimate and tell us where to send your production invoice &amp; sample timeline.
              </p>
            </div>

            {/* Quick Order Snapshot */}
            <div className="kala-bulk-modal-snapshot">
              <div className="kala-bulk-snapshot-pill">
                <strong>{categoryConfig.name}</strong> • {quantity} pcs
              </div>
              <div className="kala-bulk-snapshot-pill">
                Color: <strong>{resolvedColorName}</strong>
              </div>
              <div className="kala-bulk-snapshot-pill">
                Print: <strong>{printPosition}</strong>
              </div>
              <div className="kala-bulk-snapshot-price">
                Total: <strong>₹{pricing.estimatedTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="kala-bulk-modal-fields-grid">
                <div className="kala-bulk-modal-field">
                  <label htmlFor="quote-contact-name" className="kala-bulk-field-label">
                    Contact Name <span className="req">*</span>
                  </label>
                  <input
                    id="quote-contact-name"
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    className={`kala-bulk-modal-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="kala-form-error">{errors.name}</span>}
                </div>

                <div className="kala-bulk-modal-field">
                  <label htmlFor="quote-org-name" className="kala-bulk-field-label">
                    Company / Organization <span className="req">*</span>
                  </label>
                  <input
                    id="quote-org-name"
                    type="text"
                    placeholder="e.g. Acme Tech Labs"
                    value={organization}
                    onChange={(e) => {
                      setOrganization(e.target.value)
                      if (errors.organization) setErrors((prev) => ({ ...prev, organization: '' }))
                    }}
                    className={`kala-bulk-modal-input ${errors.organization ? 'error' : ''}`}
                  />
                  {errors.organization && (
                    <span className="kala-form-error">{errors.organization}</span>
                  )}
                </div>

                <div className="kala-bulk-modal-field">
                  <label htmlFor="quote-email" className="kala-bulk-field-label">
                    Work Email <span className="req">*</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    placeholder="e.g. vikram@acme.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                    }}
                    className={`kala-bulk-modal-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <span className="kala-form-error">{errors.email}</span>}
                </div>

                <div className="kala-bulk-modal-field">
                  <label htmlFor="quote-phone" className="kala-bulk-field-label">
                    Phone / WhatsApp <span className="req">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                    }}
                    className={`kala-bulk-modal-input ${errors.phone ? 'error' : ''}`}
                  />
                  {errors.phone && <span className="kala-form-error">{errors.phone}</span>}
                </div>

                <div className="kala-bulk-modal-field full-width">
                  <label htmlFor="quote-org-type" className="kala-bulk-field-label">
                    Organization Type
                  </label>
                  <select
                    id="quote-org-type"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="kala-bulk-modal-select"
                  >
                    <option value="Company">Company / Corporate</option>
                    <option value="Startup">Startup</option>
                    <option value="College / University">College / University</option>
                    <option value="Sports Team">Sports Team / Esports</option>
                    <option value="Event / Community">Event / Festival</option>
                    <option value="Creator / Personal Brand">Creator / Personal Brand</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="kala-bulk-modal-field full-width">
                  <label htmlFor="quote-notes" className="kala-bulk-field-label">
                    Delivery Deadlines &amp; Special Requests (Optional)
                  </label>
                  <textarea
                    id="quote-notes"
                    rows={2}
                    placeholder="e.g. Need delivery by 15th October for annual tech summit, need embroidery on right sleeve..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="kala-bulk-modal-textarea"
                  />
                </div>
              </div>

              {submitError && (
                <div className="kala-bulk-summary-error" role="alert" style={{ marginTop: '1rem' }}>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="kala-bulk-modal-actions">
                <button
                  type="button"
                  className="kala-bulk-modal-cancel-btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="kala-bulk-modal-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="kala-bulk-spinner" aria-hidden="true" />
                      <span>Submitting…</span>
                    </>
                  ) : (
                    <span>CONFIRM &amp; SEND QUOTE INQUIRY →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteModal
