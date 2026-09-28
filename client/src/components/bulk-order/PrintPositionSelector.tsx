import React from 'react'
import { type PrintPosition } from '../../data/bulkPricing'

interface PrintPositionSelectorProps {
  printPosition: PrintPosition
  onSelectPrintPosition: (pos: PrintPosition) => void
}

export const PrintPositionSelector: React.FC<PrintPositionSelectorProps> = ({
  printPosition,
  onSelectPrintPosition,
}) => {
  const positions: { id: PrintPosition; label: string; hint: string }[] = [
    { id: 'Front', label: 'Front', hint: 'Chest / Front print' },
    { id: 'Back', label: 'Back', hint: 'Back artwork / branding' },
    { id: 'Front + Back', label: 'Front + Back', hint: 'Double-sided full print' },
  ]

  return (
    <div className="kala-bulk-position-section">
      <div className="kala-bulk-field-header-row">
        <label className="kala-bulk-field-label">Apply Design To</label>
        <span className="kala-bulk-field-sub">
          {printPosition === 'Front + Back' ? '+₹40/pc double print' : 'Standard placement'}
        </span>
      </div>

      <div className="kala-bulk-position-grid" role="radiogroup" aria-label="Print position">
        {positions.map((item) => {
          const isSelected = printPosition === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-bulk-position-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectPrintPosition(item.id)}
            >
              <span className="kala-bulk-radio-dot" aria-hidden="true" />
              <div className="kala-bulk-position-text">
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PrintPositionSelector
