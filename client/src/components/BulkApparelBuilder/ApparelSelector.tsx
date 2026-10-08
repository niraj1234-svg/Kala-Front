import React from 'react'
import {
  type ApparelId,
  type PoloModelId,
  type TshirtModelId,
  type ApparelColor,
} from './types'
import { APPAREL_LIST, POLO_PRODUCTS, TSHIRT_PRODUCTS } from './mockupAssets'

const PERSONAL_PRICES: Record<ApparelId, number> = {
  tshirt: 399,
  polo: 499,
  jersey: 549,
  hoodie: 899,
}

interface ApparelSelectorProps {
  selectedApparel: ApparelId
  selectedPoloModel: PoloModelId
  selectedTshirtModel: TshirtModelId
  selectedColor: ApparelColor
  onSelectApparel: (id: ApparelId) => void
  onSelectPoloModel: (id: PoloModelId) => void
  onSelectTshirtModel: (id: TshirtModelId) => void
  orderMode?: 'bulk' | 'personal'
}

export const ApparelSelector: React.FC<ApparelSelectorProps> = ({
  selectedApparel,
  selectedPoloModel,
  selectedTshirtModel,
  selectedColor,
  onSelectApparel,
  onSelectPoloModel,
  onSelectTshirtModel,
  orderMode = 'bulk',
}) => {
  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">1</span>
        <h3 className="kala-bulk-step-title">SELECT APPAREL</h3>
      </div>

      {/* Primary Apparel Selector (T-Shirts | Hoodies | Jerseys | Polos) */}
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
                  {orderMode === 'personal' ? 'Only ' : 'From '}
                  <strong className="kala-bulk-price-highlight">
                    ₹{orderMode === 'personal' ? (PERSONAL_PRICES[item.id] || item.startingPrice) : item.startingPrice}
                  </strong>
                </span>
              </div>

              <div className="kala-bulk-radio-circle" aria-hidden="true">
                {isSelected && <span className="kala-bulk-radio-dot" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Dedicated T-Shirt Product Selection Section (Visible when T-SHIRTS is active) */}
      {selectedApparel === 'tshirt' && (
        <div className="kala-bulk-tshirt-section" aria-label="T-Shirt Product Options">
          <div className="kala-bulk-model-section-header">
            <span className="kala-bulk-model-tag">T-SHIRT FABRIC &amp; FIT</span>
            <span className="kala-bulk-model-note">Select your preferred fabric weight &amp; style</span>
          </div>

          <div className="kala-bulk-compact-models-grid" role="radiogroup" aria-label="Choose T-Shirt Model">
            {TSHIRT_PRODUCTS.map((tshirt) => {
              const isSelected = selectedTshirtModel === tshirt.id
              const tshirtThumb =
                tshirt.mockups[selectedColor]?.front || tshirt.mockups.black.front
              const displayPrice =
                orderMode === 'personal'
                  ? `₹${tshirt.personalPrice || tshirt.startingPrice}`
                  : `From ₹${tshirt.startingPrice}/pc`

              return (
                <button
                  key={tshirt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`kala-bulk-compact-model-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTshirtModel(tshirt.id)}
                >
                  <div className="kala-bulk-compact-thumb-wrap">
                    <img
                      src={tshirtThumb}
                      alt={tshirt.name}
                      className="kala-bulk-compact-thumb-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="kala-bulk-compact-model-details">
                    <div className="kala-bulk-compact-name-row">
                      <strong className="kala-bulk-compact-name">{tshirt.name}</strong>
                      <span className="kala-bulk-compact-gsm">{tshirt.gsm}</span>
                    </div>

                    <div className="kala-bulk-compact-meta-row">
                      <span className="kala-bulk-compact-price">{displayPrice}</span>
                      {tshirt.specifications?.[0] && (
                        <span className="kala-bulk-compact-feature">{tshirt.specifications[0]}</span>
                      )}
                    </div>
                  </div>

                  <div className="kala-bulk-compact-radio" aria-hidden="true">
                    {isSelected && <span className="kala-bulk-compact-radio-dot" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Dedicated Polo Product Selection Section (Visible when POLOS is active) */}
      {selectedApparel === 'polo' && (
        <div className="kala-bulk-polo-section" aria-label="Polo Product Options">
          <div className="kala-bulk-model-section-header">
            <span className="kala-bulk-model-tag">POLO FABRIC &amp; FIT</span>
            <span className="kala-bulk-model-note">4 Premium fabric &amp; collar options</span>
          </div>

          <div className="kala-bulk-compact-models-grid" role="radiogroup" aria-label="Choose Polo Model">
            {POLO_PRODUCTS.map((polo) => {
              const isSelected = selectedPoloModel === polo.id
              const poloThumb =
                polo.mockups[selectedColor]?.front || polo.mockups.black.front
              const displayPrice =
                orderMode === 'personal'
                  ? `₹${polo.personalPrice || polo.startingPrice}`
                  : `From ₹${polo.startingPrice}/pc`

              return (
                <button
                  key={polo.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`kala-bulk-compact-model-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectPoloModel(polo.id)}
                >
                  <div className="kala-bulk-compact-thumb-wrap">
                    <img
                      src={poloThumb}
                      alt={polo.name}
                      className="kala-bulk-compact-thumb-img"
                      loading="lazy"
                    />
                  </div>

                  <div className="kala-bulk-compact-model-details">
                    <div className="kala-bulk-compact-name-row">
                      <strong className="kala-bulk-compact-name">{polo.name}</strong>
                      <span className="kala-bulk-compact-gsm">{polo.gsm}</span>
                    </div>

                    <div className="kala-bulk-compact-meta-row">
                      <span className="kala-bulk-compact-price">{displayPrice}</span>
                      {polo.specifications?.[0] && (
                        <span className="kala-bulk-compact-feature">{polo.specifications[0]}</span>
                      )}
                    </div>
                  </div>

                  <div className="kala-bulk-compact-radio" aria-hidden="true">
                    {isSelected && <span className="kala-bulk-compact-radio-dot" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApparelSelector
