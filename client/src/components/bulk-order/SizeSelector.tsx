import React from 'react'
import {
  AVAILABLE_SIZES,
  type SizeBreakdown,
  type SizeKey,
} from '../../data/bulkPricing'

interface SizeSelectorProps {
  sizeBreakdown: SizeBreakdown
  totalQuantity: number
  onSizeChange: (size: SizeKey, delta: number) => void
  onSetSizeQty: (size: SizeKey, qty: number) => void
  onDistributeEvenly: () => void
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizeBreakdown,
  totalQuantity,
  onSizeChange,
  onSetSizeQty,
  onDistributeEvenly,
}) => {
  return (
    <div className="kala-bulk-size-section">
      <div className="kala-bulk-field-header-row">
        <div className="kala-bulk-step-label-wrap">
          <span className="kala-bulk-step-num">3</span>
          <label className="kala-bulk-step-title">Size Breakdown</label>
        </div>
        <div className="kala-bulk-size-actions">
          <button
            type="button"
            className="kala-bulk-subtle-btn"
            onClick={onDistributeEvenly}
            title="Distribute total quantity evenly across standard sizes"
          >
            Distribute Evenly
          </button>
          <span className="kala-bulk-size-total-badge">
            Sum: <strong>{totalQuantity} pcs</strong>
          </span>
        </div>
      </div>

      {/* Modern Compact Stepper Grid for Sizes */}
      <div className="kala-bulk-size-grid" role="group" aria-label="Size distribution breakdown">
        {AVAILABLE_SIZES.map((size) => {
          const qty = sizeBreakdown[size] || 0
          const hasQty = qty > 0

          return (
            <div
              key={size}
              className={`kala-bulk-size-card ${hasQty ? 'has-qty' : ''}`}
            >
              <span className="kala-bulk-size-pill">{size}</span>
              <div className="kala-bulk-size-stepper">
                <button
                  type="button"
                  className="kala-bulk-size-step-btn"
                  onClick={() => onSizeChange(size, -1)}
                  disabled={qty <= 0}
                  aria-label={`Decrease ${size} size quantity`}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={qty}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10)
                    onSetSizeQty(size, isNaN(parsed) ? 0 : Math.max(0, parsed))
                  }}
                  className="kala-bulk-size-input"
                  aria-label={`Quantity for size ${size}`}
                />
                <button
                  type="button"
                  className="kala-bulk-size-step-btn"
                  onClick={() => onSizeChange(size, 1)}
                  aria-label={`Increase ${size} size quantity`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="kala-bulk-size-hint">
        Distribute your total bulk pieces across garment sizes (XS to XXXL).
      </p>
    </div>
  )
}

export default SizeSelector
