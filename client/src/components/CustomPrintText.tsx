import React from 'react'

export interface CustomTextSide {
  text: string
  fontSize: number
  position: {
    x: number
    y: number
  }
}

export interface CustomPrintState {
  enabled: boolean
  front: CustomTextSide
  back: CustomTextSide
}

export const MIN_TEXT_SIZE = 16
export const MAX_TEXT_SIZE = 72
export const DEFAULT_TEXT_SIZE = 32
export const TEXT_SIZE_STEP = 2

export interface CustomPrintTextProps {
  enabled: boolean
  price?: number
  activeSide: 'front' | 'back'
  onSelectSide: (side: 'front' | 'back') => void
  frontText: string
  backText: string
  onChangeFrontText: (val: string) => void
  onChangeBackText: (val: string) => void
  frontFontSize: number
  backFontSize: number
  onChangeFrontFontSize: (val: number) => void
  onChangeBackFontSize: (val: number) => void
  onResetFrontPosition?: () => void
  onResetBackPosition?: () => void
  basePrice: number
}

export const CustomPrintText: React.FC<CustomPrintTextProps> = ({
  enabled,
  price = 25,
  activeSide,
  onSelectSide,
  frontText,
  backText,
  onChangeFrontText,
  onChangeBackText,
  frontFontSize,
  backFontSize,
  onChangeFrontFontSize,
  onChangeBackFontSize,
  onResetFrontPosition,
  onResetBackPosition,
  basePrice,
}) => {
  // Guard: Render ONLY when enabled is true
  if (!enabled) return null

  const isBackView = activeSide === 'back'
  const hasFrontText = frontText.trim().length > 0
  const hasBackText = backText.trim().length > 0
  const hasCustomText = hasFrontText || hasBackText
  const currentFontSize = isBackView ? backFontSize : frontFontSize
  const displayTotal = basePrice + (hasCustomText ? price : 0)

  return (
    <section className="kala-custom-back-box" aria-labelledby="custom-text-heading">
      {/* Section Header */}
      <div className="kala-custom-back-header">
        <div className="kala-custom-back-title-row">
          <h3 id="custom-text-heading" className="kala-custom-back-title">
            CUSTOM PRINT TEXT
          </h3>
          <span className="kala-custom-back-badge">+₹{price}</span>
        </div>
        <p className="kala-custom-back-desc">
          Add your own text and position it exactly where you want.
        </p>
      </div>

      {/* Side Switch Tabs: FRONT | BACK */}
      <div className="kala-custom-side-tabs" role="tablist" aria-label="Custom text placement">
        <button
          type="button"
          role="tab"
          aria-selected={!isBackView}
          className={`kala-side-tab-btn ${!isBackView ? 'active' : ''}`}
          onClick={() => onSelectSide('front')}
        >
          <span>FRONT</span>
          {hasFrontText && <span className="kala-tab-indicator">✓</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isBackView}
          className={`kala-side-tab-btn ${isBackView ? 'active' : ''}`}
          onClick={() => onSelectSide('back')}
        >
          <span>BACK</span>
          {hasBackText && <span className="kala-tab-indicator">✓</span>}
        </button>
      </div>

      {/* Active Tab Text Input: Front or Back */}
      {!isBackView ? (
        <div className="kala-custom-back-input-group">
          <div className="kala-input-label-row">
            <label htmlFor="front-custom-text" className="kala-input-label">
              Front Custom Text
            </label>
            {frontText && onResetFrontPosition && (
              <button
                type="button"
                className="kala-reset-pos-btn"
                onClick={onResetFrontPosition}
                title="Reset Front text position to center"
              >
                Reset Position
              </button>
            )}
          </div>
          <input
            id="front-custom-text"
            type="text"
            maxLength={30}
            value={frontText}
            onChange={(e) => onChangeFrontText(e.target.value)}
            placeholder="Enter custom front text..."
            className="kala-custom-back-input"
            aria-label="Enter custom front text"
          />
          <div className="kala-custom-back-meta">
            <span className="kala-custom-back-helper">
              Live preview updates while typing • Drag text on shirt to reposition
            </span>
            <span className={`kala-custom-back-count ${frontText.length >= 30 ? 'limit' : ''}`}>
              {frontText.length}/30
            </span>
          </div>
        </div>
      ) : (
        <div className="kala-custom-back-input-group">
          <div className="kala-input-label-row">
            <label htmlFor="back-custom-text" className="kala-input-label">
              Back Custom Text
            </label>
            {backText && onResetBackPosition && (
              <button
                type="button"
                className="kala-reset-pos-btn"
                onClick={onResetBackPosition}
                title="Reset Back text position to center"
              >
                Reset Position
              </button>
            )}
          </div>
          <input
            id="back-custom-text"
            type="text"
            maxLength={30}
            value={backText}
            onChange={(e) => onChangeBackText(e.target.value)}
            placeholder="Enter custom back text..."
            className="kala-custom-back-input"
            aria-label="Enter custom back text"
          />
          <div className="kala-custom-back-meta">
            <span className="kala-custom-back-helper">
              Live preview updates while typing • Drag text on shirt to reposition
            </span>
            <span className={`kala-custom-back-count ${backText.length >= 30 ? 'limit' : ''}`}>
              {backText.length}/30
            </span>
          </div>
        </div>
      )}

      {/* Text Size Control with Slider & Buttons */}
      <div className="kala-text-size-control-group">
        <div className="kala-text-size-header">
          <span className="kala-input-label">TEXT SIZE</span>
          <span className="kala-text-size-value">Text Size: {currentFontSize}px</span>
        </div>
        <div className="kala-text-size-slider-row">
          <button
            type="button"
            className="kala-size-step-btn"
            onClick={() => {
              const newSize = Math.max(MIN_TEXT_SIZE, currentFontSize - TEXT_SIZE_STEP)
              if (isBackView) onChangeBackFontSize(newSize)
              else onChangeFrontFontSize(newSize)
            }}
            aria-label="Decrease text size"
            title="Decrease text size"
          >
            <span className="kala-size-step-symbol">−</span>
            <span className="kala-size-step-a small">A</span>
          </button>
          <input
            type="range"
            min={MIN_TEXT_SIZE}
            max={MAX_TEXT_SIZE}
            step={TEXT_SIZE_STEP}
            value={currentFontSize}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (isBackView) onChangeBackFontSize(val)
              else onChangeFrontFontSize(val)
            }}
            className="kala-text-size-slider"
            aria-label={`Adjust text size for ${isBackView ? 'back' : 'front'}`}
          />
          <button
            type="button"
            className="kala-size-step-btn"
            onClick={() => {
              const newSize = Math.min(MAX_TEXT_SIZE, currentFontSize + TEXT_SIZE_STEP)
              if (isBackView) onChangeBackFontSize(newSize)
              else onChangeFrontFontSize(newSize)
            }}
            aria-label="Increase text size"
            title="Increase text size"
          >
            <span className="kala-size-step-a large">A</span>
            <span className="kala-size-step-symbol">+</span>
          </button>
        </div>
      </div>

      {/* Price Breakdown */}
      {hasCustomText && (
        <div className="kala-custom-price-breakdown">
          <div className="kala-price-breakdown-row">
            <span>Base price</span>
            <span>₹{basePrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="kala-price-breakdown-row">
            <span>
              Custom text ({[hasFrontText && 'Front', hasBackText && 'Back'].filter(Boolean).join(' + ')})
            </span>
            <span className="kala-price-breakdown-add">+₹{price}</span>
          </div>
          <div className="kala-price-breakdown-divider" />
          <div className="kala-price-breakdown-row total">
            <span>Total</span>
            <span>₹{displayTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </section>
  )
}

export default CustomPrintText
