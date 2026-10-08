import React, { useRef, useState } from 'react'
import {
  type ApparelId,
  type ApparelColor,
  type ApparelSide,
  type SideCustomization,
  type ApparelCustomizationState,
  type UploadedApparelImage,
  type PoloProductOption,
  type TshirtProductOption,
} from './types'
import { APPAREL_CONFIGS } from './mockupAssets'

interface ApparelPreviewProps {
  selectedApparel: ApparelId
  currentPoloConfig?: PoloProductOption
  currentTshirtConfig?: TshirtProductOption
  selectedColor: ApparelColor
  selectedSide: ApparelSide
  customizationState: ApparelCustomizationState
  uploadedApparel?: UploadedApparelImage | null
  customPriceLabel?: string
  onSelectApparel?: (id: ApparelId) => void
  onSelectColor: (color: ApparelColor) => void
  onSelectSide: (side: ApparelSide) => void
  onUpdatePosition: (x: number, y: number) => void
  onUpdateSize: (size: number) => void
  onUpdateRotation: (rotation: number) => void
}

export const ApparelPreview: React.FC<ApparelPreviewProps> = ({
  selectedApparel,
  currentPoloConfig,
  currentTshirtConfig,
  selectedColor,
  selectedSide,
  customizationState,
  uploadedApparel = null,
  customPriceLabel,
  onSelectColor,
  onSelectSide,
  onUpdatePosition,
  onUpdateSize,
  onUpdateRotation,
}) => {
  const currentConfig = APPAREL_CONFIGS[selectedApparel]
  const currentSideData: SideCustomization = customizationState[selectedApparel][selectedSide]
  const bounds = currentConfig.printableBounds[selectedSide]
  const rotation = currentSideData.rotation || 0

  const activeName =
    selectedApparel === 'polo' && currentPoloConfig
      ? currentPoloConfig.name
      : selectedApparel === 'tshirt' && currentTshirtConfig
      ? currentTshirtConfig.name
      : currentConfig.name

  const activePrice =
    selectedApparel === 'polo' && currentPoloConfig
      ? currentPoloConfig.startingPrice
      : selectedApparel === 'tshirt' && currentTshirtConfig
      ? currentTshirtConfig.startingPrice
      : currentConfig.startingPrice

  const activeMockups =
    selectedApparel === 'polo' && currentPoloConfig
      ? currentPoloConfig.mockups
      : selectedApparel === 'tshirt' && currentTshirtConfig
      ? currentTshirtConfig.mockups
      : currentConfig.mockups

  const stageRef = useRef<HTMLDivElement>(null)
  const artworkLayerRef = useRef<HTMLDivElement>(null)
  const [isSelected, setIsSelected] = useState<boolean>(true)
  const [activeDrag, setActiveDrag] = useState<'none' | 'move' | 'resize' | 'rotate'>('none')
  const [liveBadge, setLiveBadge] = useState<string | null>(null)

  const dragMetaRef = useRef<{
    type: 'move' | 'resize' | 'rotate'
    startX: number
    startY: number
    clientX: number
    clientY: number
    centerX: number
    centerY: number
    startSize: number
    startDist: number
    startPointerAngle: number
    startRotation: number
  } | null>(null)

  // Determine whether customer's uploaded apparel applies to currently viewed side
  const isUploadedApparelActive = Boolean(
    uploadedApparel &&
    (!uploadedApparel.uploadedSide || uploadedApparel.uploadedSide === selectedSide)
  )

  // Current active garment image: uses uploaded customer apparel or standard KALA mockup
  const garmentImgSrc = (isUploadedApparelActive && uploadedApparel)
    ? uploadedApparel.dataUrl
    : activeMockups[selectedColor][selectedSide]

  // Pointer drag to move artwork
  const handleMoveStart = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest(
        '.kala-bulk-rotate-handle, .kala-bulk-resize-handle, .kala-bulk-logo-floating-toolbar'
      )
    ) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setIsSelected(true)
    setActiveDrag('move')
    setLiveBadge('Drag to move')

    const meta = {
      type: 'move' as const,
      startX: currentSideData.x,
      startY: currentSideData.y,
      clientX: e.clientX,
      clientY: e.clientY,
      centerX: 0,
      centerY: 0,
      startSize: currentSideData.size,
      startDist: 0,
      startPointerAngle: 0,
      startRotation: currentSideData.rotation || 0,
    }
    dragMetaRef.current = meta

    const handlePointerMove = (moveEvt: PointerEvent) => {
      moveEvt.preventDefault()
      if (!stageRef.current || !dragMetaRef.current) return
      const stageRect = stageRef.current.getBoundingClientRect()
      if (stageRect.width === 0 || stageRect.height === 0) return

      const deltaXPercent = ((moveEvt.clientX - meta.clientX) / stageRect.width) * 100
      const deltaYPercent = ((moveEvt.clientY - meta.clientY) / stageRect.height) * 100

      const targetX = meta.startX + deltaXPercent
      const targetY = meta.startY + deltaYPercent

      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, +targetX.toFixed(1)))
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, +targetY.toFixed(1)))

      onUpdatePosition(clampedX, clampedY)
      setLiveBadge(`Position: ${Math.round(clampedX)}%, ${Math.round(clampedY)}%`)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      setActiveDrag('none')
      setLiveBadge(null)
      dragMetaRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  // Pointer drag to resize artwork
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSelected(true)
    setActiveDrag('resize')

    const layerEl = artworkLayerRef.current
    if (!layerEl) return
    const rect = layerEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startDist = Math.hypot(e.clientX - centerX, e.clientY - centerY)

    const meta = {
      type: 'resize' as const,
      startX: 0,
      startY: 0,
      clientX: e.clientX,
      clientY: e.clientY,
      centerX,
      centerY,
      startSize: currentSideData.size,
      startDist: Math.max(10, startDist),
      startPointerAngle: 0,
      startRotation: currentSideData.rotation || 0,
    }
    dragMetaRef.current = meta
    setLiveBadge(`Size: ${currentSideData.size}px`)

    const handlePointerMove = (moveEvt: PointerEvent) => {
      moveEvt.preventDefault()
      if (!dragMetaRef.current) return
      const currentDist = Math.hypot(moveEvt.clientX - meta.centerX, moveEvt.clientY - meta.centerY)
      const scale = currentDist / meta.startDist
      const rawSize = Math.round(meta.startSize * scale)
      const clampedSize = Math.max(30, Math.min(220, rawSize))
      onUpdateSize(clampedSize)
      setLiveBadge(`Size: ${clampedSize}px`)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      setActiveDrag('none')
      setLiveBadge(null)
      dragMetaRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  // Pointer drag to rotate artwork
  const handleRotateStart = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSelected(true)
    setActiveDrag('rotate')

    const layerEl = artworkLayerRef.current
    if (!layerEl) return
    const rect = layerEl.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX)
    const startPointerAngle = (startAngleRad * 180) / Math.PI

    const meta = {
      type: 'rotate' as const,
      startX: 0,
      startY: 0,
      clientX: e.clientX,
      clientY: e.clientY,
      centerX,
      centerY,
      startSize: currentSideData.size,
      startDist: 0,
      startPointerAngle,
      startRotation: currentSideData.rotation || 0,
    }
    dragMetaRef.current = meta
    setLiveBadge(`Rotation: ${currentSideData.rotation || 0}°`)

    const handlePointerMove = (moveEvt: PointerEvent) => {
      moveEvt.preventDefault()
      if (!dragMetaRef.current) return
      const angleRad = Math.atan2(moveEvt.clientY - meta.centerY, moveEvt.clientX - meta.centerX)
      const currentPointerAngle = (angleRad * 180) / Math.PI
      const deltaAngle = currentPointerAngle - meta.startPointerAngle
      let newRot = Math.round((meta.startRotation + deltaAngle) % 360)
      if (newRot < 0) newRot += 360

      // Snap to cardinal angles if close
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360]
      for (const sa of snapAngles) {
        if (Math.abs(newRot - sa) <= 3) {
          newRot = sa === 360 ? 0 : sa
          break
        }
      }

      onUpdateRotation(newRot)
      setLiveBadge(`Rotation: ${newRot}°`)
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      setActiveDrag('none')
      setLiveBadge(null)
      dragMetaRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  // Mini variations for the bottom row
  const variations: { label: string; color: ApparelColor; side: ApparelSide }[] = [
    { label: 'Front (Black)', color: 'black', side: 'front' },
    { label: 'Back (Black)', color: 'black', side: 'back' },
    { label: 'Front (White)', color: 'white', side: 'front' },
    { label: 'Back (White)', color: 'white', side: 'back' },
  ]

  const currentVarIdx = variations.findIndex(
    (v) => v.color === selectedColor && v.side === selectedSide
  )
  const safeVarIdx = currentVarIdx >= 0 ? currentVarIdx : 0

  const handlePrevVariation = () => {
    const prevIdx = (safeVarIdx - 1 + variations.length) % variations.length
    onSelectColor(variations[prevIdx].color)
    onSelectSide(variations[prevIdx].side)
  }

  const handleNextVariation = () => {
    const nextIdx = (safeVarIdx + 1) % variations.length
    onSelectColor(variations[nextIdx].color)
    onSelectSide(variations[nextIdx].side)
  }

  return (
    <div className="kala-bulk-left-column">
      {/* 1. Main Garment Preview Stage */}
      <div className="kala-bulk-preview-card" ref={stageRef}>
        {/* Top Floating Badges */}
        <div className="kala-bulk-preview-badges">
          <span className="kala-bulk-badge-dark">
            {isUploadedApparelActive ? `YOUR APPAREL (${activeName.toUpperCase()})` : activeName}
          </span>
          <span className="kala-bulk-badge-price">
            {customPriceLabel || `From ₹${activePrice}/pc`}
          </span>
        </div>

        {/* Left / Right Navigation Arrows */}
        <button
          type="button"
          className="kala-bulk-preview-arrow kala-bulk-preview-arrow-left"
          onClick={handlePrevVariation}
          aria-label="Previous view (Front Black / Back Black / Front White / Back White)"
          title="Previous view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          className="kala-bulk-preview-arrow kala-bulk-preview-arrow-right"
          onClick={handleNextVariation}
          aria-label="Next view (Front Black / Back Black / Front White / Back White)"
          title="Next view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Center Garment Mockup Image */}
        <div
          className="kala-bulk-garment-stage"
          onClick={() => setIsSelected(false)}
        >
          <img
            src={garmentImgSrc}
            alt={isUploadedApparelActive ? `Customer uploaded apparel: ${uploadedApparel?.fileName}` : `${activeName} ${selectedColor} ${selectedSide}`}
            className={`kala-bulk-garment-img ${isUploadedApparelActive ? 'custom-uploaded' : ''}`}
            loading="eager"
            draggable={false}
          />

          {/* Draggable & Transformable Customer Artwork Layer */}
          {currentSideData.artworkUrl && (
            <div
              ref={artworkLayerRef}
              className={`kala-bulk-artwork-layer ${activeDrag !== 'none' ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${currentSideData.x}%`,
                top: `${currentSideData.y}%`,
                width: `${currentSideData.size}px`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
              onPointerDown={handleMoveStart}
              onClick={(e) => {
                e.stopPropagation()
                setIsSelected(true)
              }}
              role="region"
              aria-label="Customer design graphic"
              title="Click to select. Drag to move, resize or rotate."
            >
              <img
                src={currentSideData.artworkUrl}
                alt="Uploaded design"
                className="kala-bulk-artwork-img"
                draggable={false}
              />

              {/* Transformation Handles (Active when selected) */}
              {isSelected && (
                <>
                  {/* Top Stem & Rotation Handle */}
                  <div className="kala-bulk-rotate-stem" aria-hidden="true" />
                  <button
                    type="button"
                    className={`kala-bulk-rotate-handle ${activeDrag === 'rotate' ? 'active' : ''}`}
                    onPointerDown={handleRotateStart}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Rotate logo"
                    title="Drag to rotate logo"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6" />
                      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </button>

                  {/* 4 Corner Resize Handles */}
                  <div
                    className="kala-bulk-resize-handle handle-tl"
                    onPointerDown={(e) => handleResizeStart(e)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize logo"
                    aria-label="Resize logo top-left"
                  />
                  <div
                    className="kala-bulk-resize-handle handle-tr"
                    onPointerDown={(e) => handleResizeStart(e)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize logo"
                    aria-label="Resize logo top-right"
                  />
                  <div
                    className="kala-bulk-resize-handle handle-bl"
                    onPointerDown={(e) => handleResizeStart(e)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize logo"
                    aria-label="Resize logo bottom-left"
                  />
                  <div
                    className="kala-bulk-resize-handle handle-br"
                    onPointerDown={(e) => handleResizeStart(e)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize logo"
                    aria-label="Resize logo bottom-right"
                  />

                  {/* Floating Action Bar (Counter-rotated to always stay level) */}
                  <div
                    className="kala-bulk-logo-floating-toolbar"
                    style={{
                      transform: `translateX(-50%) rotate(-${rotation}deg)`,
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Size controls */}
                    <div className="kala-bulk-toolbar-group">
                      <span className="kala-bulk-toolbar-label">Size</span>
                      <button
                        type="button"
                        className="kala-bulk-toolbar-btn"
                        onClick={() => onUpdateSize(Math.max(30, currentSideData.size - 5))}
                        title="Decrease size (-5px)"
                        aria-label="Decrease size"
                      >
                        −
                      </button>
                      <span className="kala-bulk-toolbar-value">{currentSideData.size}px</span>
                      <button
                        type="button"
                        className="kala-bulk-toolbar-btn"
                        onClick={() => onUpdateSize(Math.min(220, currentSideData.size + 5))}
                        title="Increase size (+5px)"
                        aria-label="Increase size"
                      >
                        +
                      </button>
                    </div>

                    <span className="kala-bulk-toolbar-divider" />

                    {/* Rotate controls */}
                    <div className="kala-bulk-toolbar-group">
                      <span className="kala-bulk-toolbar-label">Rotate</span>
                      <button
                        type="button"
                        className="kala-bulk-toolbar-btn"
                        onClick={() => {
                          let r = (rotation - 15) % 360
                          if (r < 0) r += 360
                          onUpdateRotation(r)
                        }}
                        title="Rotate 15° counter-clockwise"
                        aria-label="Rotate 15 degrees counter-clockwise"
                      >
                        ↺
                      </button>
                      <span className="kala-bulk-toolbar-value">{rotation}°</span>
                      <button
                        type="button"
                        className="kala-bulk-toolbar-btn"
                        onClick={() => {
                          const r = (rotation + 15) % 360
                          onUpdateRotation(r)
                        }}
                        title="Rotate 15° clockwise"
                        aria-label="Rotate 15 degrees clockwise"
                      >
                        ↻
                      </button>
                      {rotation !== 0 && (
                        <button
                          type="button"
                          className="kala-bulk-toolbar-btn-reset"
                          onClick={() => onUpdateRotation(0)}
                          title="Reset rotation to 0°"
                        >
                          0°
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Feedback Tooltip during drag */}
                  {liveBadge && (
                    <div
                      className="kala-bulk-art-badge"
                      style={{
                        transform: `translateX(-50%) rotate(-${rotation}deg)`,
                      }}
                    >
                      {liveBadge}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Front / Back Pill Switcher */}
        <div className="kala-bulk-side-toggle" role="tablist" aria-label="Toggle front or back view">
          <button
            type="button"
            role="tab"
            aria-selected={selectedSide === 'front'}
            className={`kala-bulk-side-btn ${selectedSide === 'front' ? 'active' : ''}`}
            onClick={() => onSelectSide('front')}
          >
            Front
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedSide === 'back'}
            className={`kala-bulk-side-btn ${selectedSide === 'back' ? 'active' : ''}`}
            onClick={() => onSelectSide('back')}
          >
            Back
          </button>
        </div>
      </div>

    </div>
  )
}

export default ApparelPreview

