import React, { useState } from 'react'
import { generateWhatsAppInquiryUrl } from '../../services/businessInquiryApi'
import { type ApparelId, type SizeQuantities, MIN_CUSTOM_APPAREL_QTY } from './types'
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
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)

  const isUnderMoq = quantity < MIN_CUSTOM_APPAREL_QTY
  const piecesNeeded = MIN_CUSTOM_APPAREL_QTY - quantity

  const handleWhatsAppClick = () => {
    const sizeInfo = sizeBreakdownText ? ` (${sizeBreakdownText})` : ''
    const url = generateWhatsAppInquiryUrl({
      apparelCategory: apparelName,
      color: colorName,
      customization: `Custom Bulk Artwork Print${sizeInfo}`,
      approxQuantity: `${quantity} pcs (MOQ 25 pcs)`,
      requirement: requirement || `Custom ${apparelName} order enquiry (MOQ: 25 pcs) with sizes: ${sizeBreakdownText}. Estimated: ₹${estimatedTotal.toLocaleString('en-IN')}`,
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
            {isUnderMoq ? (
              <span className="kala-bulk-estimate-moq-pill under">
                ⚠️ Min Order: 25 pcs (Add {piecesNeeded} more)
              </span>
            ) : (
              <span className="kala-bulk-estimate-moq-pill valid">
                ✓ Min 25 pcs MOQ Satisfied
              </span>
            )}
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
          className={`kala-bulk-quote-cta-btn ${isUnderMoq ? 'disabled' : ''}`}
          onClick={() => {
            if (isUnderMoq) return
            setIsQuoteModalOpen(true)
          }}
          disabled={isUnderMoq}
          aria-label={
            isUnderMoq
              ? `Minimum 25 pieces required (Currently ${quantity} pcs)`
              : 'Request custom apparel quotation'
          }
          title={
            isUnderMoq
              ? `Minimum order quantity is 25 pieces. Please add ${piecesNeeded} more piece(s).`
              : 'Request official quote'
          }
        >
          <span>{isUnderMoq ? `MINIMUM 25 PIECES REQUIRED (${quantity}/25)` : 'REQUEST QUOTE'}</span>
          <span className="kala-bulk-cta-arrow" aria-hidden="true">→</span>
        </button>

        {isUnderMoq && (
          <p className="kala-bulk-cta-moq-note">
            ⚠️ Custom apparel production requires a minimum order of <strong>25 pieces</strong>. Add <strong>{piecesNeeded} more pcs</strong> above to request a quote.
          </p>
        )}
      </div>

      {/* ====================================================================
          22. SUBTLE SECONDARY ASSISTANCE OPTION
          ==================================================================== */}
      <div className="kala-bulk-subtle-help-row">
        <span className="kala-bulk-subtle-help-text">
          Need assistance with bulk sizing, fabric samples, or custom artwork?
        </span>
        <button
          type="button"
          className="kala-bulk-subtle-help-link"
          onClick={handleWhatsAppClick}
        >
          <span>Chat with KALA Team on WhatsApp</span>
          <span aria-hidden="true">→</span>
        </button>
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
    </div>
  )
}

export default DiscussionOptions
