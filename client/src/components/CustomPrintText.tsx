import React from 'react'

export interface CustomTextSide {
  text: string
  fontSize: number
  position: {
    x: number
    y: number
  }
  rotation?: number
}

export interface CustomPrintState {
  enabled: boolean
  front: CustomTextSide
  back: CustomTextSide
}

export const MIN_TEXT_SIZE = 16
export const MAX_TEXT_SIZE = 54
export const DEFAULT_TEXT_SIZE = 32

export interface CustomPrintTextProps {
  enabled: boolean
  price?: number
  activeSide: 'front' | 'back'
  onSelectSide: (side: 'front' | 'back') => void
  frontText: string
  backText: string
  onChangeFrontText: (val: string) => void
  onChangeBackText: (val: string) => void
  frontFontSize?: number
  backFontSize?: number
  onChangeFrontFontSize?: (val: number) => void
  onChangeBackFontSize?: (val: number) => void
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
          Add your custom text directly onto the T-shirt preview.
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
                title="Reset Front text position to default"
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
            placeholder="Type your front text..."
            className="kala-custom-back-input"
            aria-label="Enter custom front text"
          />
          <div className="kala-custom-back-meta">
            <span className="kala-custom-back-helper">
              Direct manipulation: tap on shirt to drag, resize ↘ or rotate ↻
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
                title="Reset Back text position to default"
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
            placeholder="Type your back text..."
            className="kala-custom-back-input"
            aria-label="Enter custom back text"
          />
          <div className="kala-custom-back-meta">
            <span className="kala-custom-back-helper">
              Direct manipulation: tap on shirt to drag, resize ↘ or rotate ↻
            </span>
            <span className={`kala-custom-back-count ${backText.length >= 30 ? 'limit' : ''}`}>
              {backText.length}/30
            </span>
          </div>
        </div>
      )}

      {/* Editor Tip Badge when text is active */}
      {hasCustomText && (
        <div className="kala-custom-editor-hint">
          <span className="kala-hint-diamond">◆</span>
          <span>
            {isBackView
              ? hasBackText
                ? 'Back text active — Click text on preview to adjust position, size & rotation'
                : 'Enter back text above to preview and edit on the shirt'
              : hasFrontText
                ? 'Front text active — Click text on preview to adjust position, size & rotation'
                : 'Enter front text above to preview and edit on the shirt'}
          </span>
        </div>
      )}

      {/* Price Breakdown */}
      {hasCustomText && (
        <div className="kala-custom-price-breakdown">
          <div className="kala-price-breakdown-row">
            <span>Base price</span>
            <span>₹{basePrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="kala-price-breakdown-row">
            <span>
              Custom print ({[hasFrontText && 'Front', hasBackText && 'Back'].filter(Boolean).join(' + ')})
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
