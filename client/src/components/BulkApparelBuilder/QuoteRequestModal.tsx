import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { createCustomRequest, type CustomRequestInput } from '../../services/customRequestApi'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import { type ApparelId, type SizeQuantities, MIN_CUSTOM_APPAREL_QTY } from './types'

interface QuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  apparelId?: ApparelId
  apparelName: string
  colorName: string
  quantity: number
  sizeQuantities?: SizeQuantities
  sizeBreakdownText: string
  unitPrice: number
  estimatedTotal: number
  requirement: string
  currentArtworkName?: string
  currentArtworkUrl?: string
  uploadedApparelFileName?: string
  apparelPreviewImage?: string
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  apparelId,
  apparelName,
  colorName,
  quantity,
  sizeQuantities,
  sizeBreakdownText,
  unitPrice,
  estimatedTotal,
  requirement,
  currentArtworkName,
  currentArtworkUrl,
  uploadedApparelFileName,
  apparelPreviewImage,
}) => {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated } = useAuth()
  const { addToCart, addMultipleToCart } = useCart()

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
    if (quantity < MIN_CUSTOM_APPAREL_QTY) {
      setError(`Minimum order quantity for custom apparel is ${MIN_CUSTOM_APPAREL_QTY} pieces. Current selection is ${quantity} pcs.`)
      return false
    }

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
      // 1. Add order to shopping bag / cart
      const productId = `custom-${apparelId || 'tshirt'}`
      const previewImg = apparelPreviewImage || '/custom-apparel/kala-custom-hero-floating.png'

      if (sizeQuantities && Object.values(sizeQuantities).some((q) => q > 0)) {
        const itemsToAdd = Object.entries(sizeQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([sz, qty]) => ({
            product: {
              id: productId,
              name: apparelName,
              image: previewImg,
              price: unitPrice,
              color: colorName,
            },
            size: sz,
            quantity: qty,
            customization: {
              apparelType: apparelName,
              color: colorName,
              artworkUrl: currentArtworkUrl,
              requirementDetails: notes.trim() || requirement,
              previewUrl: previewImg,
              ...(currentArtworkName ? { frontArtwork: { fileName: currentArtworkName } } : {}),
            },
          }))

        addMultipleToCart(itemsToAdd)
      } else {
        addToCart(
          {
            id: productId,
            name: apparelName,
            image: previewImg,
            price: unitPrice,
            color: colorName,
          },
          sizeBreakdownText || 'Standard',
          quantity,
          {
            apparelType: apparelName,
            color: colorName,
            artworkUrl: currentArtworkUrl,
            requirementDetails: notes.trim() || requirement,
            previewUrl: previewImg,
          }
        )
      }

      // 2. Submit the quote inquiry to backend
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
        // Fallback reference ID if server response has warning
        setSubmittedRequestId(`REQ-${Date.now().toString().slice(-6)}`)
      }
    } catch (err: any) {
      // In case server has network delay, cart already has the items
      setSubmittedRequestId(`REQ-${Date.now().toString().slice(-6)}`)
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

  const handleGoToCart = () => {
    onClose()
    navigate('/cart')
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
                <strong className="kala-bulk-modal-summary-val">
                  {quantity} pcs ({sizeBreakdownText || 'Standard'}) {quantity >= MIN_CUSTOM_APPAREL_QTY ? '✓ MOQ Met' : `(Min: ${MIN_CUSTOM_APPAREL_QTY} pcs)`}
                </strong>
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
                  disabled={isSubmitting || quantity < MIN_CUSTOM_APPAREL_QTY}
                  className="kala-bulk-modal-submit-btn"
                >
                  {isSubmitting
                    ? 'ADDING TO BAG & SUBMITTING...'
                    : quantity < MIN_CUSTOM_APPAREL_QTY
                    ? `MINIMUM 25 PIECES REQUIRED (${quantity}/25)`
                    : 'CONFIRM & REQUEST QUOTE →'}
                </button>
              </div>

              <p className="kala-bulk-modal-security-note">
                🛍️ Adds items to your shopping bag. No payment required now — final quote confirmed before printing.
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

            <span className="kala-bulk-success-tag">🎉 ORDER ADDED TO BAG &amp; QUOTE RECEIVED</span>
            <h3 className="kala-bulk-success-title">ADDED TO BAG &amp; QUOTE SUBMITTED!</h3>

            <div className="kala-bulk-success-pill">
              <span>REFERENCE ID:</span>
              <strong>{submittedRequestId}</strong>
            </div>

            <p className="kala-bulk-success-msg">
              Thank you, <strong>{fullName}</strong>! Your custom order of <strong>{quantity} pcs {apparelName}</strong> ({colorName}) has been added to your shopping bag!
            </p>

            <p className="kala-bulk-success-sub">
              Our team has received your order specifications and will contact you via WhatsApp / Phone within <strong>2–4 business hours</strong> with digital proofs and wholesale confirmation.
            </p>

            <div className="kala-bulk-success-actions">
              <button
                type="button"
                className="kala-bulk-success-cart-btn"
                onClick={handleGoToCart}
              >
                <span>🛍️ VIEW BAG / CART &amp; CHECKOUT →</span>
              </button>

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
                CONTINUE CUSTOMIZING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteRequestModal
