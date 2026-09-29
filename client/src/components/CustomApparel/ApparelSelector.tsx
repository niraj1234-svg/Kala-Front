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
    startingPrice: 175,
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
    startingPrice: 680,
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
    startingPrice: 350,
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
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3" role="radiogroup" aria-label="Choose Apparel Type">
        {APPAREL_OPTIONS.map((item) => {
          const isSelected = selectedApparel === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`kala-custom-apparel-btn p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#D94700] bg-[#FFF8F5] shadow-sm ring-1 ring-[#D94700]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
              }`}
              onClick={() => onSelectApparel(item.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-bold text-[#111111] uppercase tracking-wide">
                  {item.name}
                </span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#D94700] bg-[#D94700]' : 'border-[#CBD5E1]'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#D94700] font-mono">
                From ₹{item.startingPrice}
              </div>
              <div className="text-[10px] text-[#6B7280] hidden sm:block mt-1 line-clamp-1">
                {item.subtitle}
              </div>
            </button>
          )
        })}
      </div>

      {/* Apparel Overview Card (Requirement 1: Black Heading, High-contrast Bullets, Orange Accents) */}
      <div
        className="kala-apparel-overview-box mt-3 p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]"
        aria-live="polite"
      >
        <div className="flex items-center justify-between mb-2">
          <strong className="text-xs sm:text-sm font-extrabold text-[#111111] tracking-tight">
            {selectedOption.name} Overview
          </strong>
          <span className="text-xs font-extrabold text-[#D94700] font-mono tracking-wide">
            Starting From ₹{selectedOption.startingPrice}/PC
          </span>
        </div>
        <ul className="space-y-1 text-xs text-[#1F2937]">
          {selectedOption.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-[#D94700] font-bold text-sm leading-none" aria-hidden="true">•</span>
              <span className="text-[#1F2937] font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ApparelSelector
