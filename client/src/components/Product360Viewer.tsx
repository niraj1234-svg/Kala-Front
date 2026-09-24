import React, { useState, useEffect, useRef } from 'react'

export interface Product360ViewerProps {
  images?: string[]
  frames?: string[] // Backwards-compatible alias
  sensitivity?: number
  dragSensitivity?: number // Backwards-compatible alias
  initialFrame?: number
  fallbackImage?: string
  className?: string
  alt?: string
  onFrameChange?: (frameIndex: number, totalFrames: number) => void
}

// Configurable rotation sensitivity: pixels of horizontal drag per frame advance
export const DRAG_SENSITIVITY = 8

// 24 frames representing 0° to 345° in 15° increments
export const DEFAULT_TSHIRT_FRAMES: string[] = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/products/tshirt-360/${num}.png`
})

export const Product360Viewer: React.FC<Product360ViewerProps> = ({
  images,
  frames,
  sensitivity,
  dragSensitivity,
  initialFrame = 0,
  fallbackImage = '/custom-apparel/kala-custom-hero-floating.png',
  className = '',
  alt = 'KALA Custom Studio Oversized Cotton T-Shirt',
  onFrameChange,
}) => {
  const effectiveImages = images || frames || DEFAULT_TSHIRT_FRAMES
  const effectiveSensitivity = sensitivity ?? dragSensitivity ?? DRAG_SENSITIVITY
  const totalFrames = effectiveImages.length > 0 ? effectiveImages.length : 1

  const [currentFrame, setCurrentFrame] = useState(() => {
    return Math.max(0, Math.min(initialFrame, totalFrames - 1))
  })
  const [isDragging, setIsDragging] = useState(false)

  // Use refs for drag tracking to avoid stale state in event listeners
  const currentFrameRef = useRef(currentFrame)
  const dragStartXRef = useRef<number | null>(null)
  const frameStartIndexRef = useRef(currentFrame)
  const isDraggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep ref synchronized
  useEffect(() => {
    currentFrameRef.current = currentFrame
    onFrameChange?.(currentFrame, totalFrames)
  }, [currentFrame, totalFrames, onFrameChange])

  // Preload all product frames in the background
  useEffect(() => {
    if (totalFrames <= 1) return

    const preloadedImages: HTMLImageElement[] = []
    effectiveImages.forEach((src) => {
      const img = new Image()
      img.src = src
      preloadedImages.push(img)
    })

    return () => {
      preloadedImages.forEach((img) => {
        img.src = ''
      })
    }
  }, [effectiveImages, totalFrames])

  // Unified Pointer Events (handles Desktop Mouse + Mobile/Tablet Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button or touch pointer
    if (e.button !== 0 && e.pointerType === 'mouse') return

    setIsDragging(true)
    isDraggingRef.current = true
    dragStartXRef.current = e.clientX
    frameStartIndexRef.current = currentFrameRef.current

    // Capture pointer so drag continues smoothly even if cursor moves outside bounds
    if (containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId)
      } catch {
        // Fallback for environments where setPointerCapture isn't supported
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return

    const deltaX = e.clientX - dragStartXRef.current

    // Dragging LEFT (negative deltaX) rotates the shirt in one direction (advances frames)
    // Dragging RIGHT (positive deltaX) rotates it in the opposite direction (reverses frames)
    const frameDelta = Math.round(deltaX / effectiveSensitivity)

    if (totalFrames > 1) {
      const newFrame =
        ((frameStartIndexRef.current - frameDelta) % totalFrames + totalFrames) %
        totalFrames

      if (newFrame !== currentFrameRef.current) {
        setCurrentFrame(newFrame)
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      setIsDragging(false)
      isDraggingRef.current = false
      dragStartXRef.current = null

      if (containerRef.current) {
        try {
          containerRef.current.releasePointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }
    }
  }

  const currentImageSrc = effectiveImages[currentFrame] || fallbackImage

  // Current angle for accessibility label (0° to 345°)
  const currentAngle = Math.round((currentFrame / Math.max(totalFrames, 1)) * 360)

  return (
    <div
      ref={containerRef}
      className={`kala-360-viewer-container ${isDragging ? 'is-dragging' : ''} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="region"
      aria-label={`Interactive 3D product viewer. Current angle: ${currentAngle} degrees.`}
      title="Click and drag horizontally to rotate product"
      tabIndex={0}
      onKeyDown={(e) => {
        if (totalFrames <= 1) return
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setCurrentFrame((prev) => (prev - 1 + totalFrames) % totalFrames)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          setCurrentFrame((prev) => (prev + 1) % totalFrames)
        }
      }}
    >
      <img
        src={currentImageSrc}
        alt={alt}
        className="kala-hero-floating-shirt-img kala-360-shirt-img"
        loading="eager"
        draggable={false}
      />
    </div>
  )
}

// Export both names for maximum compatibility
export { Product360Viewer as TShirt360Viewer }
export default Product360Viewer
