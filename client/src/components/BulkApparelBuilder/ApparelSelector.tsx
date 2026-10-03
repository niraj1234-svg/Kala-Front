import React from 'react'
import {
  type ApparelId,
  type PoloModelId,
  type TshirtModelId,
  type ApparelColor,
} from './types'
import { APPAREL_LIST, POLO_PRODUCTS, TSHIRT_PRODUCTS } from './mockupAssets'

interface ApparelSelectorProps {
  selectedApparel: ApparelId
  selectedPoloModel: PoloModelId
  selectedTshirtModel: TshirtModelId
  selectedColor: ApparelColor
  onSelectApparel: (id: ApparelId) => void
  onSelectPoloModel: (id: PoloModelId) => void
  onSelectTshirtModel: (id: TshirtModelId) => void
}

export const ApparelSelector: React.FC<ApparelSelectorProps> = ({
  selectedApparel,
  selectedPoloModel,
  selectedTshirtModel,
  selectedColor,
  onSelectApparel,
  onSelectPoloModel,
  onSelectTshirtModel,
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
                  From <strong className="kala-bulk-price-highlight">₹{item.startingPrice}</strong>
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
          <div className="kala-bulk-tshirt-header">
            <div className="kala-bulk-tshirt-header-left">
              <span className="kala-bulk-tshirt-tag">T-SHIRT COLLECTION</span>
              <h4 className="kala-bulk-tshirt-title">CHOOSE T-SHIRT MODEL</h4>
            </div>
            <span className="kala-bulk-tshirt-note">Multiple fabric &amp; fit options</span>
          </div>

          <div className="kala-bulk-tshirt-grid" role="radiogroup" aria-label="Choose T-Shirt Model">
            {TSHIRT_PRODUCTS.map((tshirt) => {
              const isSelected = selectedTshirtModel === tshirt.id
              const tshirtThumb =
                tshirt.mockups[selectedColor]?.front || tshirt.mockups.black.front

              return (
                <div
                  key={tshirt.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`kala-bulk-tshirt-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTshirtModel(tshirt.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectTshirtModel(tshirt.id)
                    }
                  }}
                >
                  {/* Top Thumbnail & GSM Badge */}
                  <div className="kala-bulk-tshirt-thumb-box">
                    <img
                      src={tshirtThumb}
                      alt={tshirt.name}
                      className="kala-bulk-tshirt-thumb-img"
                      loading="lazy"
                    />
                    <span className="kala-bulk-tshirt-gsm-tag">+{tshirt.gsm}</span>
                  </div>

                  {/* Body Content */}
                  <div className="kala-bulk-tshirt-details">
                    <div className="kala-bulk-tshirt-name-row">
                      <h5 className="kala-bulk-tshirt-name">{tshirt.name}</h5>
                      <span className="kala-bulk-tshirt-check-badge" aria-hidden="true">
                        {isSelected && <span className="kala-bulk-tshirt-check-dot" />}
                      </span>
                    </div>

                    <div className="kala-bulk-tshirt-price-row">
                      <span className="kala-bulk-tshirt-from-text">Starting From:</span>
                      <strong className="kala-bulk-tshirt-price-val">₹{tshirt.startingPrice}</strong>
                      <span className="kala-bulk-tshirt-incl-label">(Incl. Print)</span>
                    </div>

                    <p className="kala-bulk-tshirt-desc">{tshirt.description}</p>

                    <div className="kala-bulk-tshirt-specs-list">
                      {tshirt.specifications.map((spec, sIdx) => (
                        <span key={sIdx} className="kala-bulk-tshirt-spec-pill">
                          <span className="kala-bulk-spec-check">✓</span> {spec}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`kala-bulk-tshirt-btn ${isSelected ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTshirtModel(tshirt.id)
                      }}
                    >
                      {isSelected ? '✓ SELECTED' : 'SELECT'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dedicated Polo Product Selection Section (Visible when POLOS is active) */}
      {selectedApparel === 'polo' && (
        <div className="kala-bulk-polo-section" aria-label="Polo Product Options">
          <div className="kala-bulk-polo-header">
            <div className="kala-bulk-polo-header-left">
              <span className="kala-bulk-polo-tag">POLO COLLECTION</span>
              <h4 className="kala-bulk-polo-title">CHOOSE POLO MODEL</h4>
            </div>
            <span className="kala-bulk-polo-note">4 Premium fabric &amp; fit options</span>
          </div>

          <div className="kala-bulk-polo-grid" role="radiogroup" aria-label="Choose Polo Model">
            {POLO_PRODUCTS.map((polo) => {
              const isSelected = selectedPoloModel === polo.id
              const poloThumb =
                polo.mockups[selectedColor]?.front || polo.mockups.black.front

              return (
                <div
                  key={polo.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`kala-bulk-polo-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectPoloModel(polo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectPoloModel(polo.id)
                    }
                  }}
                >
                  {/* Top Thumbnail & GSM Badge */}
                  <div className="kala-bulk-polo-thumb-box">
                    <img
                      src={poloThumb}
                      alt={polo.name}
                      className="kala-bulk-polo-thumb-img"
                      loading="lazy"
                    />
                    <span className="kala-bulk-polo-gsm-tag">+{polo.gsm}</span>
                  </div>

                  {/* Body Content */}
                  <div className="kala-bulk-polo-details">
                    <div className="kala-bulk-polo-name-row">
                      <h5 className="kala-bulk-polo-name">{polo.name}</h5>
                      <span className="kala-bulk-polo-check-badge" aria-hidden="true">
                        {isSelected && <span className="kala-bulk-polo-check-dot" />}
                      </span>
                    </div>

                    <div className="kala-bulk-polo-price-row">
                      <span className="kala-bulk-polo-from-text">Starting From:</span>
                      <strong className="kala-bulk-polo-price-val">₹{polo.startingPrice}</strong>
                      <span className="kala-bulk-polo-incl-label">(Incl. Print)</span>
                    </div>

                    <p className="kala-bulk-polo-desc">{polo.description}</p>

                    <div className="kala-bulk-polo-specs-list">
                      {polo.specifications.map((spec, sIdx) => (
                        <span key={sIdx} className="kala-bulk-polo-spec-pill">
                          <span className="kala-bulk-spec-check">✓</span> {spec}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`kala-bulk-polo-btn ${isSelected ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectPoloModel(polo.id)
                      }}
                    >
                      {isSelected ? '✓ SELECTED' : 'SELECT'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApparelSelector
