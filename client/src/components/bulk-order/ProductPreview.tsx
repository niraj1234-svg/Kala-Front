import React, { useState } from 'react'
import {
  type BulkCategory,
  BULK_CATEGORIES,
  type StandardColor,
  type ColorOption,
  type PrintPosition,
} from '../../data/bulkPricing'
import { type UploadedArtwork } from './DesignUploader'

interface ProductPreviewProps {
  category: BulkCategory
  colorType: StandardColor
  customColor: ColorOption
  printPosition: PrintPosition
  uploadedArtwork: UploadedArtwork | null
  activePricePerPiece: number
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  category,
  colorType,
  customColor,
  printPosition,
  uploadedArtwork,
  activePricePerPiece,
}) => {
  // If user selected "Front + Back", let them toggle between front and back views
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front')

  const currentCategoryConfig =
    BULK_CATEGORIES.find((c) => c.id === category) || BULK_CATEGORIES[0]

  // Decide image based on category, colorType, and viewSide
  let garmentImage = currentCategoryConfig.defaultImage

  if (viewSide === 'back' && currentCategoryConfig.backImage) {
    garmentImage = currentCategoryConfig.backImage
  } else if (colorType === 'White' && currentCategoryConfig.whiteImage) {
    garmentImage = currentCategoryConfig.whiteImage
  } else if (colorType === 'Black' && currentCategoryConfig.blackImage) {
    garmentImage = currentCategoryConfig.blackImage
  }

  // Determine if artwork should be visible on the current viewSide
  const showArtworkOnThisSide =
    uploadedArtwork &&
    (printPosition === 'Front + Back' ||
      (printPosition === 'Front' && viewSide === 'front') ||
      (printPosition === 'Back' && viewSide === 'back'))

  // Calculate position class / style for the artwork inside printable bounds
  const getArtworkTopStyle = () => {
    if (!uploadedArtwork) return '35%'
    switch (uploadedArtwork.position) {
      case 'Chest':
        return '26%'
      case 'Lower':
        return '48%'
      case 'Center':
      default:
        return '35%'
    }
  }

  // Tint styling for "Other" custom colors
  const garmentTintStyle: React.CSSProperties =
    colorType === 'Other'
      ? {
          filter: `drop-shadow(0 0 10px ${customColor.hex}44)`,
        }
      : {}

  return (
    <div className="kala-bulk-preview-wrap">
      {/* Top Title & Starting Price Row */}
      <div className="kala-bulk-left-title-row">
        <div>
          <span className="kala-bulk-garment-badge">CUSTOM PRINTABLE APPAREL</span>
          <h3 className="kala-bulk-product-title">{currentCategoryConfig.name}</h3>
          <p className="kala-bulk-product-subtitle">{currentCategoryConfig.subtitle}</p>
        </div>
        <div className="kala-bulk-live-price-box">
          <span className="kala-bulk-live-price-label">Live Unit Rate</span>
          <span className="kala-bulk-live-price-val">₹{activePricePerPiece}</span>
        </div>
      </div>

      {/* Main Interactive Garment Stage */}
      <div className="kala-bulk-stage-card">
        {/* Front / Back View Switcher Pill */}
        <div className="kala-bulk-view-toggle">
          <button
            type="button"
            className={`kala-bulk-view-pill ${viewSide === 'front' ? 'active' : ''}`}
            onClick={() => setViewSide('front')}
          >
            Front View
          </button>
          <button
            type="button"
            className={`kala-bulk-view-pill ${viewSide === 'back' ? 'active' : ''}`}
            onClick={() => setViewSide('back')}
          >
            Back View
          </button>
        </div>

        {/* Color Hue Tint Overlay for Custom Shades */}
        {colorType === 'Other' && (
          <div
            className="kala-bulk-garment-tint-overlay"
            style={{
              backgroundColor: customColor.hex,
            }}
            aria-hidden="true"
          />
        )}

        {/* Base Garment Image */}
        <div className="kala-bulk-img-wrapper" style={garmentTintStyle}>
          <img
            src={garmentImage}
            alt={`${currentCategoryConfig.name} preview (${viewSide} view)`}
            className="kala-bulk-garment-img"
          />

          {/* Printable Bounds Area */}
          <div
            className={`kala-bulk-printable-area ${uploadedArtwork ? 'has-art' : ''}`}
            aria-label="Garment printable area"
          >
            {showArtworkOnThisSide && uploadedArtwork && (
              <div
                className="kala-bulk-art-overlay"
                style={{
                  top: getArtworkTopStyle(),
                  transform: `translate(-50%, -50%) scale(${uploadedArtwork.scale})`,
                }}
              >
                <img
                  src={uploadedArtwork.dataUrl}
                  alt="Custom printed artwork"
                  className="kala-bulk-art-img"
                />
              </div>
            )}

            {!uploadedArtwork && (
              <div className="kala-bulk-printable-dashed-guide">
                <span>Print Area</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Placement Indicator Badge */}
        <div className="kala-bulk-stage-footer-badge">
          <span className="kala-bulk-stage-dot" />
          <span>
            {colorType === 'Other' ? customColor.name : colorType} •{' '}
            {viewSide === 'front' ? 'Front Facing' : 'Back Facing'} •{' '}
            {uploadedArtwork ? 'Artwork Applied' : 'Awaiting Artwork'}
          </span>
        </div>
      </div>

      {/* Feature Icons Row */}
      <div className="kala-bulk-features-row">
        <div className="kala-bulk-feature-item">
          <svg className="kala-bulk-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
            <line x1="10" y1="22" x2="14" y2="22" />
          </svg>
          <span>Premium Fabrics</span>
        </div>
        <div className="kala-bulk-feature-item">
          <svg className="kala-bulk-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Screen &amp; DTF Print</span>
        </div>
        <div className="kala-bulk-feature-item">
          <svg className="kala-bulk-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span>Pan-India Dispatch</span>
        </div>
        <div className="kala-bulk-feature-item">
          <svg className="kala-bulk-feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Corporate &amp; Events</span>
        </div>
      </div>
    </div>
  )
}

export default ProductPreview
