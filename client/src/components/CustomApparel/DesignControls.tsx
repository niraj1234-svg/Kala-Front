import React from 'react'

export interface ArtworkTransform {
  x: number // percentage 0-100 relative to stage
  y: number // percentage 0-100 relative to stage
  scale: number // 0.4 to 2.5 (1.0 = 100%)
  rotation: number // degrees -180 to 180 (or 0 to 360)
}

interface DesignControlsProps {
  transform: ArtworkTransform
  onChangeTransform: (newTransform: ArtworkTransform) => void
  onReset: () => void
  onDelete: () => void
  onReplace: () => void
}

export const DesignControls: React.FC<DesignControlsProps> = ({
  transform,
  onChangeTransform,
  onReset,
  onDelete,
  onReplace,
}) => {
  const handleMove = (dx: number, dy: number) => {
    onChangeTransform({
      ...transform,
      x: Math.max(10, Math.min(90, transform.x + dx)),
      y: Math.max(10, Math.min(90, transform.y + dy)),
    })
  }

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.4, Math.min(2.5, +(transform.scale + delta).toFixed(2)))
    onChangeTransform({
      ...transform,
      scale: newScale,
    })
  }

  const handleRotate = (degreesDelta: number) => {
    let newRotation = (transform.rotation + degreesDelta) % 360
    if (newRotation < -180) newRotation += 360
    if (newRotation > 180) newRotation -= 360
    onChangeTransform({
      ...transform,
      rotation: Math.round(newRotation),
    })
  }

  return (
    <div className="kala-design-controls-card">
      <div className="kala-design-controls-header">
        <span className="kala-design-controls-title">
          <svg className="kala-design-controls-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Adjust Your Artwork
        </span>
        <button
          type="button"
          onClick={onReset}
          className="kala-design-reset-btn"
        >
          Reset Position
        </button>
      </div>

      {/* 1. Size / Zoom Controls */}
      <div className="kala-control-slider-group">
        <div className="kala-control-label-row">
          <span className="kala-control-label">Size / Scale</span>
          <span className="kala-control-val">{Math.round(transform.scale * 100)}%</span>
        </div>
        <div className="kala-control-inputs-row">
          <button
            type="button"
            className="kala-control-step-btn"
            onClick={() => handleZoom(-0.1)}
            title="Zoom Out"
            aria-label="Zoom Out Artwork"
          >
            −
          </button>
          <input
            type="range"
            min="0.4"
            max="2.2"
            step="0.05"
            value={transform.scale}
            onChange={(e) =>
              onChangeTransform({
                ...transform,
                scale: parseFloat(e.target.value),
              })
            }
            className="kala-control-range-input"
            aria-label="Artwork Size Slider"
          />
          <button
            type="button"
            className="kala-control-step-btn"
            onClick={() => handleZoom(0.1)}
            title="Zoom In"
            aria-label="Zoom In Artwork"
          >
            +
          </button>
        </div>
      </div>

      {/* 2. Rotation Controls */}
      <div className="kala-control-slider-group">
        <div className="kala-control-label-row">
          <span className="kala-control-label">Rotation</span>
          <span className="kala-control-val">{transform.rotation}°</span>
        </div>
        <div className="kala-control-inputs-row">
          <button
            type="button"
            className="kala-control-rotate-btn"
            onClick={() => handleRotate(-15)}
            title="Rotate Left 15°"
          >
            ↶ -15°
          </button>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation}
            onChange={(e) =>
              onChangeTransform({
                ...transform,
                rotation: parseInt(e.target.value, 10),
              })
            }
            className="kala-control-range-input"
            aria-label="Artwork Rotation Slider"
          />
          <button
            type="button"
            className="kala-control-rotate-btn"
            onClick={() => handleRotate(15)}
            title="Rotate Right 15°"
          >
            ↷ +15°
          </button>
        </div>
      </div>

      {/* 3. Directional Nudge Pad */}
      <div className="kala-control-nudge-section">
        <div className="kala-control-label-row">
          <span className="kala-control-label">Position Nudge</span>
          <span className="kala-control-hint">(or drag directly on preview)</span>
        </div>
        <div className="kala-nudge-dpad">
          <div />
          <button
            type="button"
            className="kala-nudge-btn"
            onClick={() => handleMove(0, -3)}
            aria-label="Move artwork up"
            title="Move Up"
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            className="kala-nudge-btn"
            onClick={() => handleMove(-3, 0)}
            aria-label="Move artwork left"
            title="Move Left"
          >
            ←
          </button>
          <button
            type="button"
            className="kala-nudge-btn kala-nudge-center"
            onClick={onReset}
            title="Center artwork"
          >
            ●
          </button>
          <button
            type="button"
            className="kala-nudge-btn"
            onClick={() => handleMove(3, 0)}
            aria-label="Move artwork right"
            title="Move Right"
          >
            →
          </button>
          <div />
          <button
            type="button"
            className="kala-nudge-btn"
            onClick={() => handleMove(0, 3)}
            aria-label="Move artwork down"
            title="Move Down"
          >
            ↓
          </button>
          <div />
        </div>
      </div>

      {/* 4. Action Buttons (Replace / Delete) */}
      <div className="kala-control-actions-row">
        <button
          type="button"
          className="kala-control-replace-btn"
          onClick={onReplace}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Replace Artwork</span>
        </button>

        <button
          type="button"
          className="kala-control-delete-btn"
          onClick={onDelete}
          title="Delete Artwork"
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}

export default DesignControls
