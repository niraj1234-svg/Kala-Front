import React, { useRef, useState } from 'react'
import {
  type ApparelId,
  type ApparelColor,
  type ApparelSide,
  type SideCustomization,
  type ApparelCustomizationState,
  type UploadedApparelImage,
} from './types'
import { APPAREL_CONFIGS, APPAREL_LIST } from './mockupAssets'

interface ApparelPreviewProps {
  selectedApparel: ApparelId
  selectedColor: ApparelColor
  selectedSide: ApparelSide
  customizationState: ApparelCustomizationState
  uploadedApparel?: UploadedApparelImage | null
  onSelectApparel: (id: ApparelId) => void
  onSelectColor: (color: ApparelColor) => void
  onSelectSide: (side: ApparelSide) => void
  onUpdatePosition: (x: number, y: number) => void
}

export const ApparelPreview: React.FC<ApparelPreviewProps> = ({
  selectedApparel,
  selectedColor,
  selectedSide,
  customizationState,
  uploadedApparel = null,
  onSelectApparel,
  onSelectColor,
  onSelectSide,
  onUpdatePosition,
}) => {
  const currentConfig = APPAREL_CONFIGS[selectedApparel]
  const currentSideData: SideCustomization = customizationState[selectedApparel][selectedSide]
  const bounds = currentConfig.printableBounds[selectedSide]

  const stageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null)

  // Determine whether customer's uploaded apparel applies to currently viewed side
  const isUploadedApparelActive = Boolean(
    uploadedApparel &&
    (!uploadedApparel.uploadedSide || uploadedApparel.uploadedSide === selectedSide)
  )

  // Current active garment image: uses uploaded customer apparel or standard KALA mockup
  const garmentImgSrc = (isUploadedApparelActive && uploadedApparel)
    ? uploadedApparel.dataUrl
    : currentConfig.mockups[selectedColor][selectedSide]

  // Pointer drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentSideData.x,
      startY: currentSideData.y,
    }
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // fallback
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !stageRef.current) return
    e.preventDefault()

    const rect = stageRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100
    const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100

    const targetX = dragStartRef.current.startX + deltaXPercent
    const targetY = dragStartRef.current.startY + deltaYPercent

    const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, +targetX.toFixed(1)))
    const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, +targetY.toFixed(1)))

    onUpdatePosition(clampedX, clampedY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // fallback
      }
    }
  }

  // Mini variations for the bottom row
  const variations: { label: string; color: ApparelColor; side: ApparelSide }[] = [
    { label: 'Front (Black)', color: 'black', side: 'front' },
    { label: 'Back (Black)', color: 'black', side: 'back' },
    { label: 'Front (White)', color: 'white', side: 'front' },
    { label: 'Back (White)', color: 'white', side: 'back' },
  ]

  return (
    <div className="kala-bulk-left-column">
      {/* 1. Main Garment Preview Stage */}
      <div className="kala-bulk-preview-card" ref={stageRef}>
        {/* Top Floating Badges */}
        <div className="kala-bulk-preview-badges">
          <span className="kala-bulk-badge-dark">
            {isUploadedApparelActive ? `YOUR APPAREL (${currentConfig.name.toUpperCase()})` : currentConfig.name}
          </span>
          <span className="kala-bulk-badge-price">From ₹{currentConfig.startingPrice}/pc</span>
        </div>

        {/* Left / Right Navigation Arrows */}
        <button
          type="button"
          className="kala-bulk-preview-arrow kala-bulk-preview-arrow-left"
          onClick={() => onSelectSide(selectedSide === 'back' ? 'front' : 'back')}
          aria-label="Previous view (Front/Back)"
          title={selectedSide === 'back' ? 'Switch to Front' : 'Switch to Back'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          className="kala-bulk-preview-arrow kala-bulk-preview-arrow-right"
          onClick={() => onSelectSide(selectedSide === 'front' ? 'back' : 'front')}
          aria-label="Next view (Front/Back)"
          title={selectedSide === 'front' ? 'Switch to Back' : 'Switch to Front'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Center Garment Mockup Image */}
        <div className="kala-bulk-garment-stage">
          <img
            src={garmentImgSrc}
            alt={isUploadedApparelActive ? `Customer uploaded apparel: ${uploadedApparel?.fileName}` : `${currentConfig.name} ${selectedColor} ${selectedSide}`}
            className={`kala-bulk-garment-img ${isUploadedApparelActive ? 'custom-uploaded' : ''}`}
            loading="eager"
            draggable={false}
          />

          {/* Draggable Customer Artwork Layer */}
          {currentSideData.artworkUrl && (
            <div
              className={`kala-bulk-artwork-layer ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${currentSideData.x}%`,
                top: `${currentSideData.y}%`,
                width: `${currentSideData.size}px`,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              role="region"
              aria-label="Customer design graphic"
              title="Click and drag to position design"
            >
              <img
                src={currentSideData.artworkUrl}
                alt="Uploaded design"
                className="kala-bulk-artwork-img"
                draggable={false}
              />
              <span className="kala-bulk-drag-indicator">Drag to move</span>
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

      {/* 2. Apparel Category Tabs (T-Shirts | Hoodies | Jerseys) */}
      <div className="kala-bulk-category-tabs" role="tablist" aria-label="Select apparel category">
        {APPAREL_LIST.map((apparel) => {
          const isSelected = selectedApparel === apparel.id
          return (
            <button
              key={apparel.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`kala-bulk-category-tab ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectApparel(apparel.id)}
            >
              <div className="kala-bulk-tab-icon-wrap">
                <img
                  src={apparel.mockups.black.front}
                  alt=""
                  aria-hidden="true"
                  className="kala-bulk-tab-icon"
                />
              </div>
              <span className="kala-bulk-tab-label">{apparel.name}</span>
            </button>
          )
        })}
      </div>

      {/* 3. Variation Thumbnails (Front Black, Back Black, Front White, Back White) */}
      <div className="kala-bulk-thumbnails-grid" aria-label="Apparel color and side options">
        {variations.map((item, idx) => {
          const isCurrent = selectedColor === item.color && selectedSide === item.side
          const thumbMockup = currentConfig.mockups[item.color][item.side]
          const sideData = customizationState[selectedApparel][item.side]

          return (
            <button
              key={idx}
              type="button"
              className={`kala-bulk-thumb-card ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                onSelectColor(item.color)
                onSelectSide(item.side)
              }}
              title={`Switch to ${item.label}`}
            >
              <div className="kala-bulk-thumb-stage">
                <img
                  src={thumbMockup}
                  alt=""
                  aria-hidden="true"
                  className="kala-bulk-thumb-img"
                  loading="lazy"
                />
                {/* Scaled Artwork Preview on Thumbnail */}
                {sideData.artworkUrl && (
                  <div
                    className="kala-bulk-thumb-art"
                    style={{
                      left: `${sideData.x}%`,
                      top: `${sideData.y}%`,
                      width: `${Math.round(sideData.size * 0.28)}px`,
                    }}
                  >
                    <img src={sideData.artworkUrl} alt="" aria-hidden="true" />
                  </div>
                )}
              </div>
              <span className="kala-bulk-thumb-name">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ApparelPreview
