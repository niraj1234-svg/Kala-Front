import React from 'react'
import {
  type ApparelCategoryData,
  type StandardColorType,
  type PaletteColor,
} from '../../data/businessProducts'

interface ApparelPreviewProps {
  category: ApparelCategoryData
  colorType: StandardColorType
  customColor: PaletteColor
  viewSide: 'front' | 'back'
  onToggleSide: (side: 'front' | 'back') => void
}

export const ApparelPreview: React.FC<ApparelPreviewProps> = ({
  category,
  colorType,
  customColor,
  viewSide,
  onToggleSide,
}) => {
  // Determine appropriate image asset
  const getImageSrc = (): string => {
    if (viewSide === 'back' && category.images.back) {
      return category.images.back
    }

    if (colorType === 'White' && category.images.white) {
      return category.images.white
    }

    if (colorType === 'Black' && category.images.black) {
      return category.images.black
    }

    return category.images.front || category.images.default
  }

  const activeImage = getImageSrc()
  const hasBackImage = Boolean(category.images.back)

  return (
    <div className="kala-biz-preview-card">
      <div className="kala-biz-preview-topbar">
        <span className="kala-biz-preview-badge">
          {category.name}
        </span>
        <span className="kala-biz-preview-price">
          From ₹{category.startingPrice}/pc
        </span>
      </div>

      <div className="kala-biz-preview-image-stage">
        <img
          src={activeImage}
          alt={`${category.name} - ${colorType === 'Other' ? customColor.name : colorType} preview`}
          className="kala-biz-preview-img"
          loading="eager"
          draggable={false}
        />

        {/* Selected Color Pill Indicator */}
        <div className="kala-biz-preview-color-indicator">
          <span
            className="kala-biz-preview-color-dot"
            style={{
              backgroundColor:
                colorType === 'White'
                  ? '#FFFFFF'
                  : colorType === 'Black'
                  ? '#111111'
                  : customColor.hex,
              border: colorType === 'White' ? '1px solid #D1D5DB' : '1px solid rgba(0,0,0,0.1)',
            }}
            aria-hidden="true"
          />
          <span className="kala-biz-preview-color-label">
            {colorType === 'Other' ? customColor.name : colorType}
          </span>
        </div>

        {/* Front / Back Toggle Chip (when back is available) */}
        {hasBackImage && (
          <div className="kala-biz-view-toggle" role="group" aria-label="Toggle front or back view">
            <button
              type="button"
              className={`kala-biz-toggle-btn ${viewSide === 'front' ? 'active' : ''}`}
              onClick={() => onToggleSide('front')}
              aria-label="View front of garment"
            >
              Front
            </button>
            <button
              type="button"
              className={`kala-biz-toggle-btn ${viewSide === 'back' ? 'active' : ''}`}
              onClick={() => onToggleSide('back')}
              aria-label="View back of garment"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApparelPreview
