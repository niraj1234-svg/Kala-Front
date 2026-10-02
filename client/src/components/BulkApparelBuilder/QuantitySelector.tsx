import React from 'react'
import { type SizeKey, type SizeQuantities } from './types'

export const SIZES: SizeKey[] = ['S', 'M', 'L', 'XL', 'XXL']

export const PRESET_OPTIONS = [
  { label: '10 each', value: 50 },
  { label: '25 each', value: 125 },
  { label: '50 each', value: 250 },
  { label: '100 each', value: 500 },
]

export const PRESET_DISTRIBUTIONS: Record<number, SizeQuantities> = {
  50: { S: 10, M: 10, L: 10, XL: 10, XXL: 10 },
  125: { S: 25, M: 25, L: 25, XL: 25, XXL: 25 },
  250: { S: 50, M: 50, L: 50, XL: 50, XXL: 50 },
  500: { S: 100, M: 100, L: 100, XL: 100, XXL: 100 },
}

interface QuantitySelectorProps {
  sizeQuantities: SizeQuantities
  onUpdateSizeQuantity: (size: SizeKey, qty: number) => void
  onBulkPresetApply: (presetTotal: number) => void
  totalQuantity: number
  unitPrice: number
  estimatedTotal: number
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  sizeQuantities,
  onUpdateSizeQuantity,
  onBulkPresetApply,
  totalQuantity,
  unitPrice,
  estimatedTotal,
}) => {
  const handleInputChange = (size: SizeKey, value: string) => {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 0) {
      onUpdateSizeQuantity(size, 0)
    } else {
      onUpdateSizeQuantity(size, parsed)
    }
  }

  const handleStep = (size: SizeKey, delta: number) => {
    const current = sizeQuantities[size] || 0
    onUpdateSizeQuantity(size, Math.max(0, current + delta))
  }

  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">5</span>
        <h3 className="kala-bulk-step-title">
          APPROXIMATE QUANTITY BY SIZE <span className="kala-bulk-optional-tag">(Optional)</span>
        </h3>
      </div>

      <p className="kala-bulk-step-subdesc">
        Enter required pieces for each size. Total quantity and price are calculated automatically.
      </p>

      {/* Per-Size Quantity Inputs Grid */}
      <div className="kala-bulk-size-grid" role="group" aria-label="Quantity for each size">
        {SIZES.map((sz) => {
          const count = sizeQuantities[sz] || 0
          const subtotal = count * unitPrice
          return (
            <div key={sz} className={`kala-bulk-size-card ${count > 0 ? 'has-qty' : ''}`}>
              <div className="kala-bulk-size-header">
                <div className="kala-bulk-size-title-row">
                  <span className="kala-bulk-size-label">{sz}</span>
                  <span className="kala-bulk-size-rate">₹{unitPrice}</span>
                </div>
                {count > 0 ? (
                  <span className="kala-bulk-size-subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
                ) : (
                  <span className="kala-bulk-size-pcs">0 pcs</span>
                )}
              </div>

              <div className="kala-bulk-size-stepper">
                <button
                  type="button"
                  className="kala-bulk-step-btn minus"
                  onClick={() => handleStep(sz, -1)}
                  disabled={count <= 0}
                  aria-label={`Decrease ${sz} quantity`}
                  title={`Decrease ${sz}`}
                >
                  −
                </button>

                <input
                  type="number"
                  min={0}
                  value={count}
                  onChange={(e) => handleInputChange(sz, e.target.value)}
                  className="kala-bulk-size-input"
                  aria-label={`Quantity for size ${sz}`}
                />

                <button
                  type="button"
                  className="kala-bulk-step-btn plus"
                  onClick={() => handleStep(sz, 1)}
                  aria-label={`Increase ${sz} quantity`}
                  title={`Increase ${sz}`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Distribution Presets */}
      <div className="kala-bulk-presets-row">
        <span className="kala-bulk-sublabel">Quick Presets:</span>
        <div className="kala-bulk-preset-pills" role="radiogroup" aria-label="Quick quantity presets">
          {PRESET_OPTIONS.map((opt) => {
            const isMatch = totalQuantity === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                className={`kala-bulk-qty-pill ${isMatch ? 'active' : ''}`}
                onClick={() => onBulkPresetApply(opt.value)}
                title={`Distribute ${opt.label} across S to XXL`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Live Mathematics Summary Box */}
      <div className="kala-bulk-math-summary-box">
        <div className="kala-bulk-math-left">
          <span className="kala-bulk-math-tag">MATHEMATICAL TOTAL</span>
          <div className="kala-bulk-math-count-row">
            <strong className="kala-bulk-math-total">{totalQuantity} pcs</strong>
            <span className="kala-bulk-math-equation">
              ({sizeQuantities.S}S + {sizeQuantities.M}M + {sizeQuantities.L}L + {sizeQuantities.XL}XL + {sizeQuantities.XXL}XXL)
            </span>
          </div>
        </div>

        <div className="kala-bulk-math-right">
          <span className="kala-bulk-math-price-label">Estimated Price:</span>
          <strong className="kala-bulk-math-price">₹{estimatedTotal.toLocaleString('en-IN')}</strong>
          <span className="kala-bulk-math-rate">(@ ₹{unitPrice}/pc)</span>
        </div>
      </div>
    </div>
  )
}

export default QuantitySelector
