import React, { useRef, useState, useCallback } from 'react'
import ApparelMockup, {
  type ApparelType,
  type ViewPosition,
  PRINTABLE_AREAS,
} from './ApparelMockup'
import type { UploadedArtwork } from './DesignUploader'
import type { ArtworkTransform } from './DesignControls'

interface ApparelPreviewProps {
  apparelType: ApparelType
  view: ViewPosition
  color: string
  artwork: UploadedArtwork | null
  transform: ArtworkTransform
  onChangeTransform: (newTransform: ArtworkTransform) => void
  showPrintableGuide?: boolean
  className?: string
  previewRef?: React.RefObject<HTMLDivElement | null>
}

export const ApparelPreview: React.FC<ApparelPreviewProps> = ({
  apparelType,
  view,
  color,
  artwork,
  transform,
  onChangeTransform,
  showPrintableGuide = true,
  className = '',
  previewRef: externalPreviewRef,
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = externalPreviewRef || localContainerRef

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null)

  const printBounds = PRINTABLE_AREAS[apparelType][view]

  // Direct Pointer Dragging on the Artwork
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!artwork) return
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: transform.x,
      startY: transform.y,
    }

    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // fallback
    }
  }

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragStartRef.current || !containerRef.current) return
      e.preventDefault()

      const rect = containerRef.current.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const deltaXPixels = e.clientX - dragStartRef.current.clientX
      const deltaYPixels = e.clientY - dragStartRef.current.clientY

      const deltaXPercent = (deltaXPixels / rect.width) * 100
      const deltaYPercent = (deltaYPixels / rect.height) * 100

      const targetX = dragStartRef.current.startX + deltaXPercent
      const targetY = dragStartRef.current.startY + deltaYPercent

      // Strict Printable Area Restrictions (Requirement 7)
      // Clamps center coordinate so artwork cannot be dragged completely outside boundary
      const paddingX = Math.min(8, printBounds.width * 0.2)
      const paddingY = Math.min(8, printBounds.height * 0.2)
      const minX = printBounds.x + paddingX
      const maxX = printBounds.x + printBounds.width - paddingX
      const minY = printBounds.y + paddingY
      const maxY = printBounds.y + printBounds.height - paddingY

      const clampedX = Math.max(minX, Math.min(maxX, targetX))
      const clampedY = Math.max(minY, Math.min(maxY, targetY))

      onChangeTransform({
        ...transform,
        x: +clampedX.toFixed(2),
        y: +clampedY.toFixed(2),
      })
    },
    [isDragging, transform, onChangeTransform, containerRef, printBounds]
  )

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false)
      dragStartRef.current = null
      try {
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
  }

  // Calculate default artwork base size inside stage (e.g. ~140px on 500px stage = 28%)
  const baseSizePercent = 28

  return (
    <div
      ref={containerRef}
      className={`kala-apparel-preview-container ${className}`}
    >
      {/* Upper Badge: View & Guide Indicator */}
      <div className="kala-preview-badge-row">
        <span className="kala-preview-view-pill">
          {view} VIEW
        </span>
        {artwork && (
          <span className="kala-preview-live-indicator">
            <span className="kala-preview-live-dot" />
            Live Preview
          </span>
        )}
      </div>

      {/* Main Vector Mockup Base Layer */}
      <div className="kala-preview-stage-inner">
        <ApparelMockup
          apparelType={apparelType}
          view={view}
          color={color}
          showPrintableArea={showPrintableGuide}
        >
          {/* Overlay Artwork Layer */}
          {artwork && (
            <div
              className={`kala-preview-artwork-box ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${transform.x}%`,
                top: `${transform.y}%`,
                width: `${baseSizePercent * transform.scale}%`,
                transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
                transformOrigin: 'center center',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Click and drag to reposition artwork"
              role="img"
              aria-label={`Uploaded design: ${artwork.name}`}
            >
              {/* Subtle Dashed Box surrounding active artwork */}
              <div className="kala-preview-artwork-frame">
                <img
                  src={artwork.dataUrl}
                  alt={artwork.name}
                  className="kala-preview-artwork-img"
                  draggable={false}
                />
              </div>
            </div>
          )}
        </ApparelMockup>
      </div>

      {/* Subtle Bottom Helper Hint */}
      <div className="kala-preview-hint">
        {artwork
          ? 'Drag artwork to adjust position • Changes update live'
          : 'Upload your artwork on the right to preview on apparel'}
      </div>
    </div>
  )
}

export default ApparelPreview
