import React, { useState, useEffect, useRef } from 'react'
import { TSHIRT_360_FRAMES, preloadTurntableFrames } from '../utils/turntablePreloader'

export interface Garment360ViewerProps {
  frames?: string[]
  fallbackImage?: string
  alt?: string
  className?: string
  sensitivity?: number
}

export const Garment360Viewer: React.FC<Garment360ViewerProps> = ({
  frames = TSHIRT_360_FRAMES,
  fallbackImage = '/mockups/tshirt-black-front.png',
  alt = 'KALA Heavyweight Oversized Tee 360 view',
  className = '',
  sensitivity = 8,
}) => {
  const totalFrames = frames.length > 0 ? frames.length : 1
  const [currentFrame, setCurrentFrame] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<boolean>(false)

  const currentFrameRef = useRef<number>(currentFrame)
  const dragStartXRef = useRef<number | null>(null)
  const frameStartIndexRef = useRef<number>(currentFrame)
  const isDraggingRef = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentFrameRef.current = currentFrame
  }, [currentFrame])

  // Preload frames in background
  useEffect(() => {
    let isCancelled = false
    setIsLoaded(false)
    setLoadError(false)

    preloadTurntableFrames(frames)
      .then((images) => {
        if (!isCancelled) {
          if (images.length > 0) {
            setIsLoaded(true)
          } else {
            setLoadError(true)
          }
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadError(true)
      })

    return () => {
      isCancelled = true
    }
  }, [frames])

  // Unified Pointer Drag Events (Desktop Mouse + Mobile Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return

    setIsDragging(true)
    isDraggingRef.current = true
    dragStartXRef.current = e.clientX
    frameStartIndexRef.current = currentFrameRef.current

    if (containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId)
      } catch {
        // Fallback for environments where pointer capture isn't supported
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return

    const deltaX = e.clientX - dragStartXRef.current
    const frameDelta = Math.round(deltaX / sensitivity)

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

  const rotateStep = (direction: 'left' | 'right') => {
    if (totalFrames <= 1) return
    setCurrentFrame((prev) => {
      const next = direction === 'left' ? prev - 1 : prev + 1
      return (next % totalFrames + totalFrames) % totalFrames
    })
  }

  const resetToFront = () => {
    setCurrentFrame(0)
  }

  const currentImageSrc = frames[currentFrame] || fallbackImage
  const currentAngle = Math.round((currentFrame / totalFrames) * 360)

  return (
    <div className={`kala-360-turntable-wrapper ${className}`}>
      {/* 360 Turntable Header Pill */}
      <div className="kala-360-header-row">
        <div className="kala-360-badge">
          <span className="kala-360-badge-dot" aria-hidden="true" />
          <span>360° INTERACTIVE TURNTABLE</span>
        </div>
        <div className="kala-360-angle-indicator" aria-live="polite">
          <span>{currentAngle}° VIEW</span>
          <span className="kala-360-frame-pill">
            FRAME {currentFrame + 1}/{totalFrames}
          </span>
        </div>
      </div>

      {/* Main Drag Viewport */}
      <div
        ref={containerRef}
        className={`kala-360-viewport ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label={`Interactive 360-degree product turntable. Current view: ${currentAngle} degrees. Drag horizontally or use arrow keys to rotate.`}
        title="Click and drag horizontally to rotate silhouette"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            rotateStep('left')
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            rotateStep('right')
          }
        }}
      >
        {/* Loading shimmer */}
        {!isLoaded && !loadError && (
          <div className="kala-360-loading-shimmer" aria-hidden="true">
            <span className="kala-360-loading-text">Buffering 360° Frames...</span>
          </div>
        )}

        {/* Current Rotated Garment Frame */}
        <img
          src={loadError ? fallbackImage : currentImageSrc}
          alt={`${alt} at ${currentAngle} degrees`}
          className="kala-360-frame-image"
          draggable={false}
        />

        {/* Interactive Drag Hint Overlay */}
        <div className="kala-360-drag-hint" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>DRAG TO ROTATE</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Accessible Stepper Controls */}
      <div className="kala-360-controls-bar">
        <button
          type="button"
          className="kala-360-step-btn"
          onClick={() => rotateStep('left')}
          aria-label="Rotate garment 15 degrees counter-clockwise"
          title="Rotate Left (15°)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Rotate Left</span>
        </button>

        <button
          type="button"
          className="kala-360-reset-btn"
          onClick={resetToFront}
          aria-label="Reset to 0 degrees front view"
          title="Reset to Front"
        >
          Reset Front (0°)
        </button>

        <button
          type="button"
          className="kala-360-step-btn"
          onClick={() => rotateStep('right')}
          aria-label="Rotate garment 15 degrees clockwise"
          title="Rotate Right (15°)"
        >
          <span>Rotate Right</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Garment360Viewer
