import React, { useState } from 'react'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import { type ContactMethodType } from '../../data/businessSlots'
import { type ApparelId, type SizeQuantities } from './types'
import MeetingSchedulerModal from '../business/MeetingSchedulerModal'
import QuoteRequestModal from './QuoteRequestModal'

interface DiscussionOptionsProps {
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

export const DiscussionOptions: React.FC<DiscussionOptionsProps> = ({
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
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [activeMeetingMethod, setActiveMeetingMethod] = useState<ContactMethodType | null>(null)
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const sizeInfo = sizeBreakdownText ? ` (${sizeBreakdownText})` : ''
    const url = generateWhatsAppInquiryUrl({
      apparelCategory: apparelName,
      color: colorName,
      customization: `Custom Bulk Artwork Print${sizeInfo}`,
      approxQuantity: `${quantity} pcs`,
      requirement: requirement || `Bulk ${apparelName} order enquiry with sizes: ${sizeBreakdownText}. Estimated investment: ₹${estimatedTotal.toLocaleString('en-IN')}`,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Calculate pricing breakdown items
  const baseApparelCost = quantity * unitPrice
  const isBulkDiscountApplied = quantity >= 50

  return (
    <div className="kala-bulk-discussion-wrap">
      {/* ====================================================================
          18. RIGHT-SIDE ESTIMATED INVESTMENT SUMMARY CARD
          ==================================================================== */}
      <div className="kala-bulk-estimate-card">
        <div className="kala-bulk-estimate-main">
          <div className="kala-bulk-estimate-left">
            <span className="kala-bulk-estimate-tag">ESTIMATED INVESTMENT</span>
            <div className="kala-bulk-estimate-amount-row">
              <span className="kala-bulk-estimate-amount">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              <span className="kala-bulk-estimate-unit-tag">
                {quantity} pcs (₹{unitPrice}/pc)
              </span>
            </div>
            {sizeBreakdownText && (
              <span className="kala-bulk-estimate-sizes">
                Sizes: <strong>{sizeBreakdownText}</strong>
              </span>
            )}
          </div>

          <div className="kala-bulk-estimate-right">
            <span className="kala-bulk-estimate-pill">⚡ No Advance Payment Needed</span>
            <span className="kala-bulk-estimate-subnote">
              Final quote confirmed via direct consultation
            </span>
          </div>
        </div>

        {/* 19. Collapsible Price Breakdown */}
        <div className="kala-bulk-breakdown-wrapper">
          <button
            type="button"
            className="kala-bulk-breakdown-toggle"
            onClick={() => setIsBreakdownOpen((prev) => !prev)}
            aria-expanded={isBreakdownOpen}
          >
            <span>Price Breakdown</span>
            <span className={`kala-bulk-breakdown-chevron ${isBreakdownOpen ? 'open' : ''}`}>▼</span>
          </button>

          {isBreakdownOpen && (
            <div className="kala-bulk-breakdown-content">
              <div className="kala-bulk-breakdown-row">
                <span>Apparel base cost ({quantity} × ₹{unitPrice})</span>
                <strong>₹{baseApparelCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="kala-bulk-breakdown-row">
                <span>Customization &amp; Print setup</span>
                <strong className="kala-bulk-green-text">Included (Free)</strong>
              </div>
              {isBulkDiscountApplied && (
                <div className="kala-bulk-breakdown-row highlight">
                  <span>Bulk tier pricing</span>
                  <span className="kala-bulk-green-text">Best rates applied ({quantity}+ pcs)</span>
                </div>
              )}
              <div className="kala-bulk-breakdown-divider" />
              <div className="kala-bulk-breakdown-row total">
                <strong>Estimated Total</strong>
                <strong className="kala-bulk-orange-total">₹{estimatedTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </div>

        {/* 20. Bulk Pricing Notice */}
        {isBulkDiscountApplied && (
          <div className="kala-bulk-pricing-banner">
            <span className="kala-bulk-badge-mini">BULK PRICING</span>
            <span>Bulk pricing applied — Best rates for larger orders</span>
          </div>
        )}
      </div>

      {/* ====================================================================
          21. PRIMARY CTA: REQUEST QUOTE →
          ==================================================================== */}
      <div className="kala-bulk-primary-cta-wrap">
        <button
          type="button"
          className="kala-bulk-quote-cta-btn"
          onClick={() => setIsQuoteModalOpen(true)}
          aria-label="Request custom apparel quotation"
        >
          <span>REQUEST QUOTE</span>
          <span className="kala-bulk-cta-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      {/* ====================================================================
          22. 4 DIRECT CONSULTATION & DISCUSSION OPTIONS
          ==================================================================== */}
      <div className="kala-bulk-contact-section">
        <div className="kala-bulk-contact-grid">
          {/* Option 1: WhatsApp */}
          <button
            type="button"
            className="kala-bulk-contact-card whatsapp"
            onClick={handleWhatsAppClick}
            aria-label="Chat on WhatsApp"
          >
            <span className="kala-bulk-contact-icon" aria-hidden="true">💬</span>
            <div className="kala-bulk-contact-info">
              <span className="kala-bulk-contact-label">Chat on WhatsApp</span>
              <span className="kala-bulk-contact-note">Instant chat &amp; fast reply</span>
            </div>
          </button>

          {/* Option 2: Direct Call */}
          <a
            href="tel:+919406030116"
            className="kala-bulk-contact-card call"
            aria-label="Direct call to +91 94060 30116"
          >
            <span className="kala-bulk-contact-icon" aria-hidden="true">📞</span>
            <div className="kala-bulk-contact-info">
              <span className="kala-bulk-contact-label">Direct Call</span>
              <span className="kala-bulk-contact-note">+91 94060 30116</span>
            </div>
          </a>

          {/* Option 3: Google Meet */}
          <button
            type="button"
            className="kala-bulk-contact-card meet"
            onClick={() => setActiveMeetingMethod('Google Meet')}
            aria-label="Book a Google Meet"
          >
            <span className="kala-bulk-contact-icon" aria-hidden="true">📹</span>
            <div className="kala-bulk-contact-info">
              <span className="kala-bulk-contact-label">Book a Google Meet</span>
              <span className="kala-bulk-contact-note">1-on-1 video consultation</span>
            </div>
          </button>

          {/* Option 4: Meet Us in Bilaspur (Offline) */}
          <button
            type="button"
            className="kala-bulk-contact-card inperson"
            onClick={() => setActiveMeetingMethod('In-Person Meeting')}
            aria-label="Meet Us at Bilaspur Offline"
          >
            <span className="kala-bulk-contact-icon" aria-hidden="true">📍</span>
            <div className="kala-bulk-contact-info">
              <span className="kala-bulk-contact-label">Meet Us at Bilaspur</span>
              <span className="kala-bulk-contact-note">Offline meeting at our office</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        apparelId={apparelId}
        apparelName={apparelName}
        colorName={colorName}
        quantity={quantity}
        sizeQuantities={sizeQuantities}
        sizeBreakdownText={sizeBreakdownText}
        unitPrice={unitPrice}
        estimatedTotal={estimatedTotal}
        requirement={requirement}
        currentArtworkName={currentArtworkName}
        currentArtworkUrl={currentArtworkUrl}
        uploadedApparelFileName={uploadedApparelFileName}
        apparelPreviewImage={apparelPreviewImage}
      />

      {/* Meeting / Call / Consultation Scheduler Modal */}
      {activeMeetingMethod && (
        <MeetingSchedulerModal
          isOpen={true}
          method={activeMeetingMethod}
          apparelCategoryName={apparelName}
          colorName={colorName}
          customizationName="Custom Bulk Print"
          approxQuantity={String(quantity)}
          sizeBreakdown={sizeBreakdownText}
          estimatedTotal={estimatedTotal}
          initialRequirement={requirement || ''}
          onClose={() => setActiveMeetingMethod(null)}
        />
      )}
    </div>
  )
}

export default DiscussionOptions
