import React, { useState } from 'react'
import {
  type StandardColor,
  POPULAR_OTHER_COLORS,
  type ColorOption,
} from '../../data/bulkPricing'

interface ColorSelectorProps {
  selectedColorType: StandardColor
  customColor: ColorOption
  onSelectStandardColor: (type: StandardColor) => void
  onSelectCustomColor: (color: ColorOption) => void
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColorType,
  customColor,
  onSelectStandardColor,
  onSelectCustomColor,
}) => {
  const [hexInput, setHexInput] = useState<string>(customColor.hex)

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (!val.startsWith('#')) {
      val = '#' + val
    }
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onSelectCustomColor({
        id: 'custom',
        name: 'Custom Shade',
        hex: val,
      })
    }
  }

  const handleNativePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    onSelectCustomColor({
      id: 'custom',
      name: 'Custom Shade',
      hex: val,
    })
  }

  const isOtherActive = selectedColorType === 'Other'

  return (
    <div className="kala-bulk-color-section">
      <div className="kala-bulk-field-header-row">
        <div className="kala-bulk-step-label-wrap">
          <span className="kala-bulk-step-num">2</span>
          <label className="kala-bulk-step-title">Select Color</label>
        </div>
        <div className="kala-bulk-active-color-name">
          {selectedColorType === 'White' && 'Classic White (#FFFFFF)'}
          {selectedColorType === 'Black' && 'Pitch Black (#111111)'}
          {selectedColorType === 'Other' && `${customColor.name} (${customColor.hex})`}
        </div>
      </div>

      {/* 3 Main Color Swatches: White, Black, Other */}
      <div className="kala-bulk-swatch-row" role="radiogroup" aria-label="Garment base color">
        {/* 1. White */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColorType === 'White'}
          className={`kala-bulk-swatch-btn ${selectedColorType === 'White' ? 'selected' : ''}`}
          onClick={() => onSelectStandardColor('White')}
          title="White"
        >
          <span className="kala-bulk-swatch-circle swatch-white" />
          <span className="kala-bulk-swatch-label">White</span>
        </button>

        {/* 2. Black */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColorType === 'Black'}
          className={`kala-bulk-swatch-btn ${selectedColorType === 'Black' ? 'selected' : ''}`}
          onClick={() => onSelectStandardColor('Black')}
          title="Black"
        >
          <span className="kala-bulk-swatch-circle swatch-black" />
          <span className="kala-bulk-swatch-label">Black</span>
        </button>

        {/* 3. Other */}
        <button
          type="button"
          role="radio"
          aria-checked={isOtherActive}
          className={`kala-bulk-swatch-btn ${isOtherActive ? 'selected' : ''}`}
          onClick={() => onSelectStandardColor('Other')}
          title="Choose other custom colors"
        >
          <span
            className="kala-bulk-swatch-circle swatch-other"
            style={isOtherActive ? { backgroundColor: customColor.hex } : undefined}
          >
            <svg
              className="kala-bulk-swatch-other-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </span>
          <span className="kala-bulk-swatch-label">Other</span>
        </button>
      </div>

      {/* Expanded "Other" Color Panel */}
      {isOtherActive && (
        <div className="kala-bulk-other-panel" aria-label="Custom color selector">
          <div className="kala-bulk-other-title-row">
            <span className="kala-bulk-other-title">POPULAR PALETTE</span>
            <span className="kala-bulk-other-badge">+₹15/pc custom dye</span>
          </div>

          <div className="kala-bulk-palette-grid">
            {POPULAR_OTHER_COLORS.map((col) => {
              const isMatch = customColor.hex.toLowerCase() === col.hex.toLowerCase()
              return (
                <button
                  key={col.id}
                  type="button"
                  className={`kala-bulk-palette-circle ${isMatch ? 'active' : ''}`}
                  style={{ backgroundColor: col.hex }}
                  onClick={() => {
                    onSelectCustomColor(col)
                    setHexInput(col.hex)
                  }}
                  title={`${col.name} (${col.hex})`}
                  aria-label={col.name}
                >
                  {isMatch && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom Color Input Row */}
          <div className="kala-bulk-custom-picker-row">
            <label htmlFor="native-color-picker" className="kala-bulk-color-picker-trigger" style={{ backgroundColor: customColor.hex }}>
              <input
                id="native-color-picker"
                type="color"
                value={customColor.hex}
                onChange={handleNativePicker}
                className="kala-bulk-native-color-input"
                aria-label="Pick custom garment color"
              />
              <span className="kala-bulk-picker-icon" aria-hidden="true">
                🎨
              </span>
            </label>
            <div className="kala-bulk-hex-wrap">
              <span className="kala-bulk-hex-label">HEX:</span>
              <input
                type="text"
                maxLength={7}
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#14213D"
                className="kala-bulk-hex-input"
                aria-label="Custom hex color code"
              />
            </div>
            <div className="kala-bulk-selected-tag">
              <span>{customColor.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorSelector
