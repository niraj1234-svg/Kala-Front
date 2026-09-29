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
    <div className="kala-custom-selector-group p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
        <span className="text-xs font-bold text-[#111111] uppercase tracking-wide flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#D94700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Adjust Your Artwork
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-bold text-[#6B7280] hover:text-[#D94700] transition-colors"
        >
          Reset Position
        </button>
      </div>

      {/* 1. Size / Zoom Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#374151]">Size / Scale</span>
          <span className="font-mono text-[11px] text-[#6B7280]">{Math.round(transform.scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] hover:bg-white text-base font-bold flex items-center justify-center text-[#111111] transition-colors"
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
            className="flex-1 accent-[#D94700] cursor-pointer"
            aria-label="Artwork Size Slider"
          />
          <button
            type="button"
            className="w-8 h-8 rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] hover:bg-white text-base font-bold flex items-center justify-center text-[#111111] transition-colors"
            onClick={() => handleZoom(0.1)}
            title="Zoom In"
            aria-label="Zoom In Artwork"
          >
            +
          </button>
        </div>
      </div>

      {/* 2. Rotation Controls */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#374151]">Rotation</span>
          <span className="font-mono text-[11px] text-[#6B7280]">{transform.rotation}°</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] hover:bg-white text-xs font-semibold text-[#374151] transition-colors shrink-0"
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
            className="flex-1 accent-[#D94700] cursor-pointer"
            aria-label="Artwork Rotation Slider"
          />
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] hover:bg-white text-xs font-semibold text-[#374151] transition-colors shrink-0"
            onClick={() => handleRotate(15)}
            title="Rotate Right 15°"
          >
            ↷ +15°
          </button>
        </div>
      </div>

      {/* 3. Directional Nudge Pad (Horizontal & Vertical move) */}
      <div className="pt-2 border-t border-[#F3F4F6]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#374151]">Position Nudge</span>
          <span className="text-[10px] text-[#6B7280]">(or drag directly on preview)</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 max-w-[150px] mx-auto">
          <div />
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#D94700] text-center text-xs font-bold text-[#111111] transition-colors"
            onClick={() => handleMove(0, -3)}
            aria-label="Move artwork up"
            title="Move Up"
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#D94700] text-center text-xs font-bold text-[#111111] transition-colors"
            onClick={() => handleMove(-3, 0)}
            aria-label="Move artwork left"
            title="Move Left"
          >
            ←
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#D94700] bg-[#FFF8F5] text-center text-[10px] font-bold text-[#D94700]"
            onClick={onReset}
            title="Center artwork"
          >
            ●
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#D94700] text-center text-xs font-bold text-[#111111] transition-colors"
            onClick={() => handleMove(3, 0)}
            aria-label="Move artwork right"
            title="Move Right"
          >
            →
          </button>
          <div />
          <button
            type="button"
            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white hover:border-[#D94700] text-center text-xs font-bold text-[#111111] transition-colors"
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
      <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex-1 py-2 px-3 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] text-xs font-bold text-[#111111] transition-colors flex items-center justify-center gap-1.5"
          onClick={onReplace}
        >
          <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Replace Artwork</span>
        </button>

        <button
          type="button"
          className="py-2 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 transition-colors flex items-center justify-center gap-1"
          onClick={onDelete}
          title="Delete Artwork"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}

export default DesignControls
