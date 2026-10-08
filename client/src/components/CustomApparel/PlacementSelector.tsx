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
      <div className="kala-placement-header-row">
        <label className="kala-custom-step-label">
          <span className="kala-custom-step-badge">3</span>
          <span>Choose Placement</span>
        </label>
        <span className="kala-placement-active-badge">
          {currentPosition} Print
        </span>
      </div>

      <div
        className="kala-placement-choice-grid"
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
              className={`kala-placement-tab-btn ${isActive ? 'active' : ''}`}
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
