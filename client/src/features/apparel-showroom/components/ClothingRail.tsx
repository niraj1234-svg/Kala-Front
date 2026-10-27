import React, { useState, useEffect, useRef } from 'react'
import type { ShowroomGarment } from '../types/showroom'
import Hanger from './Hanger'

export interface ClothingRailProps {
  garments: ShowroomGarment[]
  selectedGarmentId: string
  selectedVariantByGarment?: Record<string, string>
  onSelectGarment: (garmentId: string) => void
  onOpenInspect?: (garmentId: string) => void
  prefersReducedMotion?: boolean
  className?: string
}

interface GarmentImageCrossfadeProps {
  src: string
  alt: string
  isEager?: boolean
  fallbackName: string
}

/**
 * Image Crossfade Sub-Component
 * 
 * Prevents blank flashes when switching colorways by keeping
 * the previous image visible until the new variant is fully decoded.
 */
const GarmentImageCrossfade: React.FC<GarmentImageCrossfadeProps> = ({
  src,
  alt,
  isEager = false,
  fallbackName,
}) => {
  const [displayedSrc, setDisplayedSrc] = useState<string>(src)
  const [incomingSrc, setIncomingSrc] = useState<string | null>(null)
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    if (src === displayedSrc) {
      setIncomingSrc(null)
      setIsCrossfading(false)
      return
    }

    setIncomingSrc(src)
    setIsCrossfading(true)
    setHasError(false)

    // Preload incoming variant image in background
    let isCancelled = false
    const img = new Image()
    img.src = src

    img.onload = () => {
      if (isCancelled) return
      setDisplayedSrc(src)
      setIsCrossfading(false)
      setIncomingSrc(null)
    }

    img.onerror = () => {
      if (isCancelled) return
      // Graceful fallback: retain previous image and stop fading
      setIsCrossfading(false)
      setIncomingSrc(null)
      setHasError(true)
    }

    return () => {
      isCancelled = true
    }
  }, [src, displayedSrc])

  if (hasError && !displayedSrc) {
    return (
      <div className="kala-showroom-fallback-card" aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
        <span>{fallbackName}</span>
      </div>
    )
  }

  return (
    <div className="kala-showroom-crossfade-stage">
      {/* Current Base Image */}
      <img
        src={displayedSrc}
        alt={alt}
        className={`kala-showroom-garment-img base-layer ${
          isCrossfading ? 'is-fading' : 'is-active'
        }`}
        loading={isEager ? 'eager' : 'lazy'}
      />

      {/* Incoming Crossfade Layer */}
      {incomingSrc && (
        <img
          src={incomingSrc}
          alt={alt}
          className={`kala-showroom-garment-img incoming-layer ${
            isCrossfading ? 'is-incoming' : ''
          }`}
          loading="eager"
        />
      )}
    </div>
  )
}

/**
 * Physical Clothing Rail Component — Stage 4
 * 
 * Includes:
 * - Natural physical pendulum sway when a garment is selected.
 * - Smooth viewport centering on mobile / narrow viewports without page scroll hijacking.
 * - Butter-smooth colorway image crossfade without blank flashes.
 * - Direct inspect trigger when tapping an active garment.
 * - Eager preloading of active garment's color variants.
 * - Strict reduced-motion compliance.
 */
export const ClothingRail: React.FC<ClothingRailProps> = ({
  garments,
  selectedGarmentId,
  selectedVariantByGarment = {},
  onSelectGarment,
  onOpenInspect,
  prefersReducedMotion = false,
  className = '',
}) => {
  const [swayingGarmentId, setSwayingGarmentId] = useState<string | null>(null)
  const prevSelectedIdRef = useRef<string>(selectedGarmentId)
  const swayTimeoutRef = useRef<number | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Trigger brief, realistic physical sway on selection change
  useEffect(() => {
    if (prevSelectedIdRef.current !== selectedGarmentId) {
      prevSelectedIdRef.current = selectedGarmentId

      if (!prefersReducedMotion) {
        // Clear any running timeout
        if (swayTimeoutRef.current !== null) {
          window.clearTimeout(swayTimeoutRef.current)
        }

        setSwayingGarmentId(selectedGarmentId)

        // Sway naturally settles in 650ms
        swayTimeoutRef.current = window.setTimeout(() => {
          setSwayingGarmentId(null)
          swayTimeoutRef.current = null
        }, 650)
      }

      // Smooth horizontal scroll into view if item is clipped or offscreen
      const slotEl = slotRefs.current[selectedGarmentId]
      const viewportEl = viewportRef.current
      if (slotEl && viewportEl) {
        const vRect = viewportEl.getBoundingClientRect()
        const sRect = slotEl.getBoundingClientRect()

        const isClipped =
          sRect.left < vRect.left + 24 || sRect.right > vRect.right - 24

        if (isClipped) {
          slotEl.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'center',
          })
        }
      }
    }

    return () => {
      if (swayTimeoutRef.current !== null) {
        window.clearTimeout(swayTimeoutRef.current)
      }
    }
  }, [selectedGarmentId, prefersReducedMotion])

  // Eagerly preload all colorway assets for the active garment
  useEffect(() => {
    const activeGarment = garments.find((g) => g.id === selectedGarmentId)
    if (!activeGarment || typeof window === 'undefined') return

    activeGarment.colorVariants.forEach((v) => {
      if (v.garmentImage) {
        const pre = new Image()
        pre.src = v.garmentImage
      }
      if (v.alternateImage) {
        const pre = new Image()
        pre.src = v.alternateImage
      }
    })
  }, [selectedGarmentId, garments])

  return (
    <section
      className={`kala-showroom-rail-section ${className}`}
      aria-label="Apparel clothing rail collection"
    >
      {/* 1. ARCHITECTURAL RAIL HARDWARE */}
      <div className="kala-showroom-rail-assembly" aria-hidden="true">
        {/* Left mounting flange */}
        <div className="kala-showroom-bracket bracket-left" />

        {/* Ceiling suspension drop cables */}
        <div className="kala-showroom-suspension-cable cable-left" />
        <div className="kala-showroom-suspension-cable cable-right" />

        {/* Main horizontal dark steel rail bar */}
        <div className="kala-showroom-rail-bar">
          <div className="kala-showroom-rail-highlight" />
        </div>

        {/* Right mounting flange */}
        <div className="kala-showroom-bracket bracket-right" />
      </div>

      {/* 2. HORIZONTAL GARMENTS TRACK */}
      <div
        ref={viewportRef}
        className="kala-showroom-garments-viewport"
        role="region"
        aria-label="Clothing rail carousel"
        tabIndex={0}
      >
        <div className="kala-showroom-garments-track" role="list">
          {garments.map((garment, index) => {
            const isSelected = garment.id === selectedGarmentId
            const isSwaying = garment.id === swayingGarmentId && !prefersReducedMotion
            const activeVariantId = selectedVariantByGarment[garment.id]
            const activeVariant =
              garment.colorVariants.find((v) => v.id === activeVariantId) ||
              garment.colorVariants[0]

            const displayImage =
              activeVariant?.garmentImage || garment.primaryImage

            return (
              <div
                key={garment.id}
                ref={(el) => {
                  slotRefs.current[garment.id] = el
                }}
                className={`kala-showroom-garment-slot ${
                  isSwaying ? 'is-swaying' : ''
                }`}
                role="listitem"
              >
                {/* Interactive Garment Suspension Node */}
                <button
                  type="button"
                  className={`kala-showroom-garment-btn ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => {
                    if (isSelected && onOpenInspect) {
                      onOpenInspect(garment.id)
                    } else {
                      onSelectGarment(garment.id)
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${garment.name}, ${garment.category}, ₹${garment.price.toLocaleString('en-IN')}. ${garment.colorVariants.length} colors available. ${isSelected ? 'Click again to inspect in 360°.' : ''}`}
                  title={isSelected ? `Inspect ${garment.name} in 360°` : `Select ${garment.name}`}
                >
                  {/* HANGER (Positioned right over the rail) */}
                  <div className="kala-showroom-hanger-anchor">
                    <Hanger isActive={isSelected} width={148} height={82} />
                  </div>

                  {/* GARMENT CUTOUT CANVAS */}
                  <div className="kala-showroom-garment-canvas">
                    {/* Soft wall shadow beneath */}
                    <div
                      className={`kala-showroom-wall-shadow ${
                        isSelected ? 'shadow-active' : ''
                      }`}
                      aria-hidden="true"
                    />

                    {/* Smooth Image Crossfade Layer */}
                    <GarmentImageCrossfade
                      src={displayImage}
                      alt={`${garment.name} - ${activeVariant?.name || 'Front View'}`}
                      isEager={index < 2 || isSelected}
                      fallbackName={garment.name}
                    />

                    {/* Active Selected Marker */}
                    {isSelected && (
                      <div
                        className="kala-showroom-selected-marker"
                        aria-hidden="true"
                      >
                        <span className="kala-showroom-marker-dot" />
                        <span className="kala-showroom-marker-label">
                          {onOpenInspect ? (garment.turntableFrames ? 'INSPECT 360°' : 'INSPECT DETAIL') : 'SELECTED'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* GARMENT METADATA CAPTION */}
                  <div className="kala-showroom-garment-meta">
                    <span className="kala-showroom-garment-category">
                      {garment.category}
                    </span>
                    <h3 className="kala-showroom-garment-title">
                      {garment.name}
                    </h3>
                    <div className="kala-showroom-garment-bottom-row">
                      <span className="kala-showroom-garment-price">
                        ₹{garment.price.toLocaleString('en-IN')}
                      </span>
                      <span className="kala-showroom-garment-variants-count">
                        {garment.colorVariants.length} Colors
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ClothingRail
