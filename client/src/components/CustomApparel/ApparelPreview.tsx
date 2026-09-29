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
      className={`kala-apparel-preview-container relative w-full select-none bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-3 sm:p-6 overflow-hidden flex items-center justify-center ${className}`}
      style={{
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02), 0 8px 24px -6px rgba(0,0,0,0.04)',
      }}
    >
      {/* Upper Badge: View & Guide Indicator */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-white/90 text-[#111111] border border-[#E5E7EB] shadow-sm backdrop-blur-sm">
          {view} VIEW
        </span>
        {artwork && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-[#D94700] bg-[#FFF5F0] border border-[#FFE0D1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D94700] animate-pulse" />
            Live Preview
          </span>
        )}
      </div>

      {/* Main Vector Mockup Base Layer */}
      <div className="w-full max-w-[480px] aspect-square relative">
        <ApparelMockup
          apparelType={apparelType}
          view={view}
          color={color}
          showPrintableArea={showPrintableGuide}
        >
          {/* Overlay Artwork Layer */}
          {artwork && (
            <div
              className={`absolute cursor-move touch-none pointer-events-auto transition-shadow ${
                isDragging ? 'opacity-95' : 'opacity-100'
              }`}
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
              <div
                className={`w-full h-full relative ${
                  isDragging
                    ? 'ring-2 ring-[#D94700] ring-offset-2 ring-offset-transparent'
                    : 'hover:ring-1 hover:ring-[#D94700]/70'
                }`}
              >
                <img
                  src={artwork.dataUrl}
                  alt={artwork.name}
                  className="w-full h-auto block select-none pointer-events-none drop-shadow-sm"
                  draggable={false}
                />
              </div>
            </div>
          )}
        </ApparelMockup>
      </div>

      {/* Subtle Bottom Helper Hint */}
      <div className="absolute bottom-2 sm:bottom-3 text-center text-[10px] text-[#9CA3AF] pointer-events-none font-mono">
        {artwork
          ? 'Drag artwork to adjust position • Changes update live'
          : 'Upload your artwork on the right to preview on apparel'}
      </div>
    </div>
  )
}

export default ApparelPreview
