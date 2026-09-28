import React from 'react'
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

interface OrderSummaryProps {
  categoryConfig: BulkCategoryConfig
  colorType: StandardColor
  customColor: ColorOption
  quantity: number
  sizeBreakdown: SizeBreakdown
  printPosition: PrintPosition
  customization: CustomizationType
  uploadedArtwork: UploadedArtwork | null
  pricing: BulkOrderCalculationResult
  validationError: string | null
  isSubmitting: boolean
  onRequestQuote: () => void
  onReset: () => void
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  categoryConfig,
  colorType,
  customColor,
  quantity,
  sizeBreakdown,
  printPosition,
  customization,
  uploadedArtwork,
  pricing,
  validationError,
  isSubmitting,
  onRequestQuote,
  onReset,
}) => {
  // Format sizes that have quantity > 0
  const formattedSizes = Object.entries(sizeBreakdown)
    .filter(([_, qty]) => qty > 0)
    .map(([size, qty]) => `${size}: ${qty}`)
    .join(' | ') || 'None selected'

  const resolvedColorName =
    colorType === 'Other' ? `${customColor.name} (${customColor.hex})` : colorType

  return (
    <div className="kala-bulk-summary-wrapper">
      {/* Summary Box */}
      <div className="kala-bulk-summary-card">
        <div className="kala-bulk-summary-header">
          <div className="kala-bulk-summary-title-wrap">
            <span className="kala-bulk-summary-badge">LIVE SPECIFICATION</span>
            <h4 className="kala-bulk-summary-title">Order Summary</h4>
          </div>
          <button
            type="button"
            className="kala-bulk-reset-link"
            onClick={onReset}
            title="Reset to default selection"
          >
            Reset
          </button>
        </div>

        <div className="kala-bulk-summary-grid">
          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Product</span>
            <span className="kala-bulk-summary-val font-semibold">{categoryConfig.name}</span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Color</span>
            <span className="kala-bulk-summary-val">
              <span
                className="kala-bulk-summary-color-pip"
                style={{
                  backgroundColor:
                    colorType === 'White'
                      ? '#FFFFFF'
                      : colorType === 'Black'
                      ? '#111111'
                      : customColor.hex,
                }}
              />
              {resolvedColorName}
            </span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Total Quantity</span>
            <span className="kala-bulk-summary-val font-semibold">{quantity} units</span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Sizes</span>
            <span className="kala-bulk-summary-val kala-summary-sizes-val" title={formattedSizes}>
              {formattedSizes}
            </span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Customization</span>
            <span className="kala-bulk-summary-val">{customization}</span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Print Placement</span>
            <span className="kala-bulk-summary-val">{printPosition}</span>
          </div>

          <div className="kala-bulk-summary-row">
            <span className="kala-bulk-summary-lbl">Design Artwork</span>
            <span className="kala-bulk-summary-val">
              {uploadedArtwork ? (
                <span className="kala-summary-art-badge">
                  ✓ {uploadedArtwork.name.slice(0, 18)}
                  {uploadedArtwork.name.length > 18 ? '…' : ''}
                </span>
              ) : (
                <span className="kala-summary-art-none">Awaiting upload</span>
              )}
            </span>
          </div>
        </div>

        {/* Dynamic Estimated Total Banner */}
        <div className="kala-bulk-estimate-card">
          <div className="kala-bulk-estimate-left">
            <span className="kala-bulk-estimate-label">ESTIMATED TOTAL</span>
            <span className="kala-bulk-estimate-sub">
              ₹{pricing.totalPricePerPiece} / piece • {quantity} units
            </span>
          </div>
          <div className="kala-bulk-estimate-right">
            <span className="kala-bulk-estimate-total">
              ₹{pricing.estimatedTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="kala-bulk-summary-error" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {/* Request Bulk Quote CTA Button */}
        <button
          type="button"
          className="kala-bulk-cta-btn"
          onClick={onRequestQuote}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="kala-bulk-spinner" aria-hidden="true" />
              <span>Processing Quote…</span>
            </>
          ) : (
            <>
              <span>REQUEST BULK QUOTE</span>
              <svg
                className="kala-bulk-cta-arrow"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        <p className="kala-bulk-card-microtext">
          Instant estimate includes fabric, printing, and tax. No payment taken today.
        </p>
      </div>
    </div>
  )
}

export default OrderSummary
