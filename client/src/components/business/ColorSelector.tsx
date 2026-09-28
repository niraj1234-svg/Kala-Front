import React from 'react'
import {
  type StandardColorType,
  type PaletteColor,
  POPULAR_COLORS,
} from '../../data/businessProducts'

interface ColorSelectorProps {
  selectedColorType: StandardColorType
  customColor: PaletteColor
  onSelectColorType: (type: StandardColorType) => void
  onSelectCustomColor: (color: PaletteColor) => void
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColorType,
  customColor,
  onSelectColorType,
  onSelectCustomColor,
}) => {
  const handleSelectOther = () => {
    onSelectColorType('Other')
  }

  return (
    <div className="kala-biz-color-section">
      <div className="kala-biz-field-label">
        <span className="kala-biz-step-badge">2</span>
        <span>Select Color</span>
        <span className="kala-biz-selected-hint">
          ({selectedColorType === 'Other' ? customColor.name : selectedColorType})
        </span>
      </div>

      <div className="kala-biz-color-circles-row" role="radiogroup" aria-label="Color Selection">
        {/* 1. White */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColorType === 'White'}
          className={`kala-biz-circle-btn white ${selectedColorType === 'White' ? 'selected' : ''}`}
          onClick={() => onSelectColorType('White')}
          title="White"
          aria-label="Color White"
        >
          <span className="kala-circle-inner white" />
          <span className="kala-circle-check-icon" aria-hidden="true">✓</span>
        </button>

        {/* 2. Black */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColorType === 'Black'}
          className={`kala-biz-circle-btn black ${selectedColorType === 'Black' ? 'selected' : ''}`}
          onClick={() => onSelectColorType('Black')}
          title="Black"
          aria-label="Color Black"
        >
          <span className="kala-circle-inner black" />
          <span className="kala-circle-check-icon" aria-hidden="true">✓</span>
        </button>

        {/* 3. Other with '+' icon */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColorType === 'Other'}
          className={`kala-biz-circle-btn other ${selectedColorType === 'Other' ? 'selected' : ''}`}
          onClick={handleSelectOther}
          title="Other custom colors"
          aria-label="Other colors"
        >
          <span
            className="kala-circle-inner other-gradient"
            style={{
              backgroundColor: selectedColorType === 'Other' ? customColor.hex : undefined,
            }}
          >
            <span className="kala-circle-plus-symbol" aria-hidden="true">
              {selectedColorType === 'Other' ? '✓' : '+'}
            </span>
          </span>
        </button>

        <span className="kala-biz-color-name-text">
          {selectedColorType === 'Other' ? `Custom: ${customColor.name}` : selectedColorType}
        </span>
      </div>

      {/* Small Palette Panel (when 'Other' is active or clicked) */}
      {selectedColorType === 'Other' && (
        <div className="kala-biz-other-palette" aria-label="Choose a custom color">
          <div className="kala-biz-palette-header">
            <span>Available Shades</span>
            <span className="kala-biz-palette-active-name">{customColor.name}</span>
          </div>
          <div className="kala-biz-palette-swatches">
            {POPULAR_COLORS.map((col) => {
              const isColActive = customColor.id === col.id
              return (
                <button
                  key={col.id}
                  type="button"
                  className={`kala-biz-swatch-item ${isColActive ? 'active' : ''}`}
                  style={{ backgroundColor: col.hex }}
                  onClick={() => onSelectCustomColor(col)}
                  title={col.name}
                  aria-label={`Select shade ${col.name}`}
                >
                  {isColActive && <span className="kala-swatch-tick">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorSelector
