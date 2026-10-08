import React from 'react'
import type { ApparelType } from './ApparelMockup'

export interface ApparelOption {
  id: ApparelType
  name: string
  subtitle: string
  startingPrice: number
  description: string
  features: string[]
}

export const APPAREL_OPTIONS: ApparelOption[] = [
  {
    id: 'tshirt',
    name: 'T-Shirts',
    subtitle: '100% Combed Ringspun Cotton (220 GSM)',
    startingPrice: 399,
    description: 'Lightweight & comfortable. Classic everyday streetwear fit.',
    features: [
      'Lightweight and comfortable',
      'Custom print available',
      'Suitable for events, campaigns and teams',
    ],
  },
  {
    id: 'hoodie',
    name: 'Hoodies',
    subtitle: 'Heavyweight Boxy Fleece (450 GSM)',
    startingPrice: 899,
    description: 'Premium French Terry feel with drop-shoulder cut.',
    features: [
      'Heavyweight 450 GSM fleece',
      'Custom embroidery & print available',
      'Ideal for winter wear, teams and street style',
    ],
  },
  {
    id: 'jersey',
    name: 'Jerseys',
    subtitle: 'Aerodynamic Esports Mesh (180 GSM)',
    startingPrice: 549,
    description: 'Moisture-wicking athletic polyester for teams & creators.',
    features: [
      'Moisture-wicking athletic mesh',
      'Sublimation & vinyl printing available',
      'Built for esports, teams and active creators',
    ],
  },
]

interface ApparelSelectorProps {
  selectedApparel: ApparelType
  onSelectApparel: (apparel: ApparelType) => void
}

export const ApparelSelector: React.FC<ApparelSelectorProps> = ({
  selectedApparel,
  onSelectApparel,
}) => {
  const selectedOption =
    APPAREL_OPTIONS.find((item) => item.id === selectedApparel) || APPAREL_OPTIONS[0]

  return (
    <div className="kala-custom-selector-group">
      <label className="kala-custom-step-label">
        <span className="kala-custom-step-badge">1</span>
        <span>Choose Apparel</span>
      </label>

      {/* 3 Selectable Apparel Options */}
      <div className="kala-apparel-choice-grid" role="radiogroup" aria-label="Choose Apparel Type">
        {APPAREL_OPTIONS.map((item) => {
          const isSelected = selectedApparel === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-custom-apparel-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectApparel(item.id)}
            >
              <div className="kala-apparel-btn-top">
                <span className="kala-apparel-btn-title">
                  {item.name}
                </span>
                <span
                  className={`kala-apparel-radio ${isSelected ? 'checked' : ''}`}
                  aria-hidden="true"
                >
                  {isSelected && <span className="kala-apparel-radio-inner" />}
                </span>
              </div>
              <div className="kala-apparel-btn-price">
                From ₹{item.startingPrice}
              </div>
              <div className="kala-apparel-btn-subtitle">
                {item.subtitle}
              </div>
            </button>
          )
        })}
      </div>

      {/* Apparel Overview Card */}
      <div
        className="kala-apparel-overview-box"
        aria-live="polite"
      >
        <div className="kala-apparel-overview-header">
          <strong className="kala-apparel-overview-title">
            {selectedOption.name} Overview
          </strong>
          <span className="kala-apparel-overview-price">
            Starting From ₹{selectedOption.startingPrice}/PC
          </span>
        </div>
        <ul className="kala-apparel-overview-list">
          {selectedOption.features.map((feature, idx) => (
            <li key={idx} className="kala-apparel-overview-item">
              <span className="kala-apparel-overview-bullet" aria-hidden="true">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ApparelSelector
