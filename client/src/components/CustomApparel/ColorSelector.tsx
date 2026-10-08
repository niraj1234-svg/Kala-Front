import React from 'react'

export interface ColorOption {
  id: string
  name: string
  hex: string
}

export const POPULAR_COLORS: ColorOption[] = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#18181B' },
  { id: 'navy', name: 'Navy Blue', hex: '#14213D' },
  { id: 'grey', name: 'Heather Grey', hex: '#94A3B8' },
  { id: 'forest', name: 'Forest Green', hex: '#1B4332' },
  { id: 'maroon', name: 'Maroon', hex: '#6B1D2F' },
  { id: 'royal', name: 'Royal Blue', hex: '#1D4ED8' },
  { id: 'sand', name: 'Sand Beige', hex: '#D4A373' },
  { id: 'red', name: 'Crimson Red', hex: '#DC2626' },
]

interface ColorSelectorProps {
  selectedColor: string
  colorName: string
  onSelectColor: (hex: string, name: string) => void
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedColor,
  colorName,
  onSelectColor,
}) => {
  const isPresetWhite = selectedColor.toUpperCase() === '#FFFFFF'
  const isPresetBlack = selectedColor.toUpperCase() === '#18181B' || selectedColor.toUpperCase() === '#111111' || selectedColor.toUpperCase() === '#000000'
  const isOther = !isPresetWhite && !isPresetBlack

  return (
    <div className="kala-custom-selector-group">
      <div className="kala-color-header-row">
        <label className="kala-custom-step-label">
          <span className="kala-custom-step-badge">2</span>
          <span>Select Color</span>
        </label>
        <span className="kala-color-active-badge">
          {colorName}
        </span>
      </div>

      {/* Main 3 High-Level Choices: White, Black, Other */}
      <div className="kala-color-choice-grid" role="radiogroup" aria-label="Color choices">
        <button
          type="button"
          role="radio"
          aria-checked={isPresetWhite}
          className={`kala-color-choice-btn ${isPresetWhite ? 'active' : ''}`}
          onClick={() => onSelectColor('#FFFFFF', 'White')}
        >
          <span className="kala-color-swatch-circle" style={{ backgroundColor: '#FFFFFF' }} />
          <span>White</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isPresetBlack}
          className={`kala-color-choice-btn ${isPresetBlack ? 'active' : ''}`}
          onClick={() => onSelectColor('#18181B', 'Black')}
        >
          <span className="kala-color-swatch-circle" style={{ backgroundColor: '#18181B' }} />
          <span>Black</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isOther}
          className={`kala-color-choice-btn ${isOther ? 'active' : ''}`}
          onClick={() => {
            if (!isOther) {
              onSelectColor(POPULAR_COLORS[2].hex, POPULAR_COLORS[2].name)
            }
          }}
        >
          <span
            className="kala-color-swatch-circle"
            style={{
              background: isOther
                ? selectedColor
                : 'conic-gradient(from 180deg, #14213D, #94A3B8, #1B4332, #6B1D2F, #1D4ED8, #D4A373, #DC2626)',
            }}
          />
          <span>Other</span>
        </button>
      </div>

      {/* Expanded Swatches when "Other" is active */}
      {isOther && (
        <div className="kala-color-swatches-panel">
          <div className="kala-color-swatches-title">
            Popular Streetwear Shades
          </div>
          <div className="kala-color-swatches-list">
            {POPULAR_COLORS.slice(2).map((col) => {
              const isColSelected = selectedColor.toUpperCase() === col.hex.toUpperCase()
              return (
                <button
                  key={col.id}
                  type="button"
                  title={col.name}
                  aria-label={col.name}
                  className={`kala-color-swatch-item ${isColSelected ? 'active' : ''}`}
                  style={{ backgroundColor: col.hex }}
                  onClick={() => onSelectColor(col.hex, col.name)}
                />
              )
            })}

            {/* Custom Hex Picker Input */}
            <label
              className="kala-color-custom-btn"
              title="Custom Color Picker"
            >
              <span>+</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => onSelectColor(e.target.value, 'Custom')}
                className="kala-color-custom-input"
                aria-label="Custom color picker"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorSelector
