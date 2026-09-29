import React from 'react'
import { type ApparelColor } from './types'

interface ColorSelectorProps {
  apparelName: string
  selectedColor: ApparelColor
  onSelectColor: (color: ApparelColor) => void
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  apparelName,
  selectedColor,
  onSelectColor,
}) => {
  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">2</span>
        <h3 className="kala-bulk-step-title">
          SELECT COLOR <span className="kala-bulk-step-subtitle">({apparelName})</span>
        </h3>
      </div>

      <div className="kala-bulk-color-row" role="radiogroup" aria-label="Select apparel color">
        {/* Black Swatch */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColor === 'black'}
          className={`kala-bulk-color-btn ${selectedColor === 'black' ? 'selected' : ''}`}
          onClick={() => onSelectColor('black')}
        >
          <span className="kala-bulk-swatch-circle black">
            {selectedColor === 'black' && <span className="kala-bulk-swatch-check">✓</span>}
          </span>
          <span className="kala-bulk-color-name">Black</span>
        </button>

        {/* White Swatch */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedColor === 'white'}
          className={`kala-bulk-color-btn ${selectedColor === 'white' ? 'selected' : ''}`}
          onClick={() => onSelectColor('white')}
        >
          <span className="kala-bulk-swatch-circle white">
            {selectedColor === 'white' && <span className="kala-bulk-swatch-check dark">✓</span>}
          </span>
          <span className="kala-bulk-color-name">White</span>
        </button>
      </div>
    </div>
  )
}

export default ColorSelector
