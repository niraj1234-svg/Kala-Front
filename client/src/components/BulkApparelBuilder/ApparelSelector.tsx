import React from 'react'
import { type ApparelId } from './types'
import { APPAREL_LIST } from './mockupAssets'

interface ApparelSelectorProps {
  selectedApparel: ApparelId
  onSelectApparel: (id: ApparelId) => void
}

export const ApparelSelector: React.FC<ApparelSelectorProps> = ({
  selectedApparel,
  onSelectApparel,
}) => {
  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">1</span>
        <h3 className="kala-bulk-step-title">SELECT APPAREL</h3>
      </div>

      <div className="kala-bulk-apparel-grid" role="radiogroup" aria-label="Select Apparel Type">
        {APPAREL_LIST.map((item) => {
          const isSelected = selectedApparel === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-bulk-apparel-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectApparel(item.id)}
            >
              <div className="kala-bulk-card-thumb-wrap">
                <img
                  src={item.mockups.black.front}
                  alt={item.name}
                  className="kala-bulk-card-thumb"
                />
              </div>

              <div className="kala-bulk-card-info">
                <span className="kala-bulk-card-name">{item.name}</span>
                <span className="kala-bulk-card-price">
                  STARTING FROM <strong className="kala-bulk-price-highlight">₹{item.startingPrice}</strong> /pc
                </span>
              </div>

              <div className="kala-bulk-radio-circle" aria-hidden="true">
                {isSelected && <span className="kala-bulk-radio-dot" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ApparelSelector
