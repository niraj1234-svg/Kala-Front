import React from 'react'

interface QuantitySelectorProps {
  quantity: number
  onChangeQuantity: (delta: number) => void
  onSetQuantity: (val: number) => void
}

const PRESET_QUANTITIES = [25, 50, 100, 250, 500]

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChangeQuantity,
  onSetQuantity,
}) => {
  return (
    <div className="kala-bulk-qty-section">
      <div className="kala-bulk-field-header-row">
        <div className="kala-bulk-step-label-wrap">
          <span className="kala-bulk-step-num">5</span>
          <label className="kala-bulk-step-title">Order Quantity</label>
        </div>
        <span className="kala-bulk-total-items-badge">
          Total items: <strong>{quantity}</strong>
        </span>
      </div>

      <div className="kala-bulk-qty-row">
        {/* Main Stepper */}
        <div className="kala-bulk-qty-stepper">
          <button
            type="button"
            className="kala-bulk-qty-btn"
            onClick={() => onChangeQuantity(-1)}
            disabled={quantity <= 10}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min="10"
            max="5000"
            className="kala-bulk-qty-input"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) {
                onSetQuantity(Math.max(10, Math.min(5000, val)))
              }
            }}
            aria-label="Quantity"
          />
          <button
            type="button"
            className="kala-bulk-qty-btn"
            onClick={() => onChangeQuantity(1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Tier Advantage Perk Badge */}
        <div className="kala-bulk-tier-perk-badge">
          <span className="kala-bulk-perk-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <div className="kala-bulk-perk-text">
            <strong>Volume Discount</strong>
            <span>Larger stacks unlock greater per-unit savings</span>
          </div>
        </div>
      </div>

      {/* Fast Preset Quick Pills */}
      <div className="kala-bulk-presets-row" role="group" aria-label="Quick quantity presets">
        <span className="kala-bulk-presets-label">Quick select:</span>
        <div className="kala-bulk-presets-list">
          {PRESET_QUANTITIES.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`kala-bulk-preset-btn ${quantity === preset ? 'active' : ''}`}
              onClick={() => onSetQuantity(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuantitySelector
