import React from 'react'

interface DesignAdjusterProps {
  size: number
  onSizeChange: (size: number) => void
}

const MIN_SIZE = 40
const MAX_SIZE = 180
const STEP = 5

export const DesignAdjuster: React.FC<DesignAdjusterProps> = ({
  size,
  onSizeChange,
}) => {
  const handleDecrease = () => {
    onSizeChange(Math.max(MIN_SIZE, size - STEP))
  }

  const handleIncrease = () => {
    onSizeChange(Math.min(MAX_SIZE, size + STEP))
  }

  return (
    <div className="kala-bulk-step-block">
      <div className="kala-bulk-step-heading">
        <span className="kala-bulk-step-num">4</span>
        <div className="kala-bulk-step-heading-texts">
          <h3 className="kala-bulk-step-title">DESIGN PREVIEW &amp; ADJUST</h3>
          <p className="kala-bulk-step-desc">
            Drag to move • Use slider to resize • Position it exactly how you want
          </p>
        </div>
      </div>

      <div className="kala-bulk-slider-row">
        <span className="kala-bulk-slider-label">Design Size</span>

        <button
          type="button"
          className="kala-bulk-size-btn"
          onClick={handleDecrease}
          disabled={size <= MIN_SIZE}
          aria-label="Decrease design size"
        >
          −
        </button>

        <input
          type="range"
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={2}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="kala-bulk-range-slider"
          aria-label="Adjust design size"
        />

        <button
          type="button"
          className="kala-bulk-size-btn"
          onClick={handleIncrease}
          disabled={size >= MAX_SIZE}
          aria-label="Increase design size"
        >
          +
        </button>

        <span className="kala-bulk-size-badge">{size} px</span>
      </div>
    </div>
  )
}

export default DesignAdjuster
