import React, { useState } from 'react'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import MeetingSchedulerModal from '../business/MeetingSchedulerModal'
import QuoteRequestModal from './QuoteRequestModal'

interface DiscussionOptionsProps {
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

export const DiscussionOptions: React.FC<DiscussionOptionsProps> = ({
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
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
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
          22. SECONDARY CONTACT OPTIONS (WhatsApp & Call)
          ==================================================================== */}
      <div className="kala-bulk-contact-actions-row">
        <button
          type="button"
          className="kala-bulk-contact-btn whatsapp"
          onClick={handleWhatsAppClick}
          aria-label="Contact on WhatsApp"
        >
          <span className="kala-bulk-contact-icon" aria-hidden="true">💬</span>
          <span>Contact on WhatsApp</span>
        </button>

        <button
          type="button"
          className="kala-bulk-contact-btn call"
          onClick={() => setIsCallModalOpen(true)}
          aria-label="Request a Call"
        >
          <span className="kala-bulk-contact-icon" aria-hidden="true">📞</span>
          <span>Request a Call</span>
        </button>
      </div>

      {/* ====================================================================
          23. COMPACT HELP CARD
          ==================================================================== */}
      <div className="kala-bulk-help-card">
        <div className="kala-bulk-help-content">
          <strong className="kala-bulk-help-title">Need Help?</strong>
          <p className="kala-bulk-help-text">Talk to our team for custom requirements or immediate questions.</p>
        </div>
        <button
          type="button"
          className="kala-bulk-help-action-btn"
          onClick={() => setIsCallModalOpen(true)}
        >
          Request a Call
        </button>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        apparelName={apparelName}
        colorName={colorName}
        quantity={quantity}
        sizeBreakdownText={sizeBreakdownText}
        unitPrice={unitPrice}
        estimatedTotal={estimatedTotal}
        requirement={requirement}
        currentArtworkName={currentArtworkName}
        uploadedApparelFileName={uploadedApparelFileName}
      />

      {/* Meeting / Call Scheduler Modal */}
      {isCallModalOpen && (
        <MeetingSchedulerModal
          isOpen={true}
          method="Call"
          apparelCategoryName={apparelName}
          colorName={colorName}
          customizationName="Custom Bulk Print"
          approxQuantity={String(quantity)}
          sizeBreakdown={sizeBreakdownText}
          estimatedTotal={estimatedTotal}
          initialRequirement={requirement || ''}
          onClose={() => setIsCallModalOpen(false)}
        />
      )}
    </div>
  )
}

export default DiscussionOptions
