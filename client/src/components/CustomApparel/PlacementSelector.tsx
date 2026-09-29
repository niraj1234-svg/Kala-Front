import React from 'react'
import type { ViewPosition } from './ApparelMockup'

interface PlacementSelectorProps {
  currentPosition: ViewPosition
  onSelectPosition: (pos: ViewPosition) => void
}

const PLACEMENT_OPTIONS: { id: ViewPosition; label: string }[] = [
  { id: 'front', label: 'FRONT' },
  { id: 'back', label: 'BACK' },
  { id: 'left', label: 'LEFT' },
  { id: 'right', label: 'RIGHT' },
]

export const PlacementSelector: React.FC<PlacementSelectorProps> = ({
  currentPosition,
  onSelectPosition,
}) => {
  return (
    <div className="kala-custom-selector-group">
      <div className="flex items-center justify-between mb-2">
        <label className="kala-custom-step-label mb-0">
          <span className="kala-custom-step-badge">3</span>
          <span>Choose Placement</span>
        </label>
        <span className="text-[11px] font-mono font-semibold text-[#D94700] uppercase">
          {currentPosition} Print
        </span>
      </div>

      <div
        className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]"
        role="tablist"
        aria-label="Apparel print placements"
      >
        {PLACEMENT_OPTIONS.map((opt) => {
          const isActive = currentPosition === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center tracking-wider ${
                isActive
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-transparent text-[#4B5563] hover:text-[#111111] hover:bg-white/60'
              }`}
              onClick={() => onSelectPosition(opt.id)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PlacementSelector
