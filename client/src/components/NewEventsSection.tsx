import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { KALA_EVENTS, type ProductEvent } from '../data/events'
import '../styles/NewEventsSection.css'

export const NewEventsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Bihari Story Front / Back toggle state
  const bihariStoryEvent = KALA_EVENTS.find((e) => e.id === 'kala-bihari-story') as ProductEvent | undefined
  const [activeImg, setActiveImg] = useState<string>(
    bihariStoryEvent?.frontImage || ''
  )

  // Swipe & Drag tracking refs
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const isMouseDown = useRef<boolean>(false)

  const timerRef = useRef<any>(null)
  const pauseTimeoutRef = useRef<any>(null)

  const totalSlides = KALA_EVENTS.length

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-slide effect (3 seconds interval)
  useEffect(() => {
    if (isPaused) return

    timerRef.current = setInterval(() => {
      handleNext()
    }, 3000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    }
  }, [isPaused, handleNext, currentIndex])

  // Resume autoplay helper after manual user interaction (pause 1.8s, then resume)
  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    setIsPaused(true)
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 1800)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev()
      restartTimer()
    } else if (e.key === 'ArrowRight') {
      handleNext()
      restartTimer()
    }
  }

  // Mobile Touch handlers (Swipe left/right)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Only swipe if horizontal movement is dominant and > 35px threshold
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrev()
      }
      restartTimer()
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  // Desktop Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX
    isMouseDown.current = true
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return

    const deltaX = e.clientX - mouseStartX.current
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        handleNext()
      } else {
        handlePrev()
      }
      restartTimer()
    }

    isMouseDown.current = false
    mouseStartX.current = null
  }

  const handleMouseLeave = () => {
    isMouseDown.current = false
    mouseStartX.current = null
    setIsPaused(false)
  }

  const currentEvent = KALA_EVENTS[currentIndex]

  return (
    <section
      className="kala-new-events-section"
      aria-labelledby="new-events-heading"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="KALA New Events and Offers Carousel"
    >
      <div className="kala-new-events-container">
        {/* ================================================================
            SECTION HEADER
            ================================================================ */}
        <header className="kala-new-events-header">
          <div className="kala-new-events-eyebrow">
            <span className="kala-eyebrow-accent-dot" aria-hidden="true" />
            <span className="kala-eyebrow-text">KALA • NEW EVENTS</span>
          </div>
          <h2 id="new-events-heading" className="kala-new-events-title">
            NEW EVENTS
          </h2>
          <p className="kala-new-events-subtitle">
            Fresh drops. Limited offers. Built for teams, brands &amp; communities.
          </p>
        </header>

        {/* ================================================================
            CAROUSEL ROW: [ PREV ARROW ]  [ EVENT CARD ]  [ NEXT ARROW ]
            ================================================================ */}
        <div className="kala-new-events-carousel-outer">
          {/* Circular Previous Button (Left Side) */}
          <button
            type="button"
            className="kala-carousel-side-arrow prev"
            onClick={() => {
              handlePrev()
              restartTimer()
            }}
            aria-label="Previous event"
            title="Previous event"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Event Card Content Wrapper (85–92% available width, max 1100px) */}
          <div
            className="kala-carousel-card-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div className="kala-carousel-stage" aria-live="polite">
              {/* ------------------------------------------------------------
                  SLIDE 1: BUNDLE OFFER (BUILD YOUR T-SHIRT STACK)
                  ------------------------------------------------------------ */}
              {currentEvent.type === 'bundle' && (
                <article
                  key={currentEvent.id}
                  className="kala-event-card-single kala-card-bundle"
                  aria-label={`Event ${currentIndex + 1} of ${totalSlides}: ${currentEvent.title}`}
                >
                  {/* Visual Media Stage */}
                  <div className="kala-event-media-stage kala-stage-bundle">
                    <div className="kala-stage-topbar">
                      <span className="kala-stage-badge orange">
                        <span className="kala-badge-pulse" aria-hidden="true" />
                        {currentEvent.badge}
                      </span>
                      {currentEvent.subBadge && (
                        <span className="kala-stage-sub-badge">{currentEvent.subBadge}</span>
                      )}
                    </div>

                    {/* 3-Shirt Stack Visual */}
                    <div className="kala-bundle-stack-visual" aria-hidden="true">
                      <img
                        src={currentEvent.stackImages[0]}
                        alt=""
                        className="kala-stack-tee tee-left"
                        loading="eager"
                        draggable={false}
                      />
                      <img
                        src={currentEvent.stackImages[1]}
                        alt=""
                        className="kala-stack-tee tee-center"
                        loading="eager"
                        draggable={false}
                      />
                      <img
                        src={currentEvent.stackImages[2]}
                        alt=""
                        className="kala-stack-tee tee-right"
                        loading="eager"
                        draggable={false}
                      />
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="kala-event-body">
                    <div className="kala-body-heading-group">
                      <h3 className="kala-event-main-title">{currentEvent.title}</h3>
                      <p className="kala-event-sub-label">{currentEvent.subtitle}</p>
                    </div>

                    {/* 3 Interactive Bundle Offer Rows */}
                    <div className="kala-bundle-tiers-group" aria-label="Available Bundle Tiers">
                      {currentEvent.options.map((option) => (
                        <Link
                          key={option.count}
                          to={option.link}
                          className={`kala-bundle-tier-link ${option.highlight ? 'highlight' : ''}`}
                          aria-label={`Select ${option.count} T-Shirts bundle for ₹${option.price}`}
                        >
                          <div className="kala-tier-left">
                            <span className="kala-tier-qty">{option.count} T-SHIRTS</span>
                            {option.highlight && (
                              <span className="kala-tier-best-tag">{option.highlight}</span>
                            )}
                          </div>
                          <span className="kala-tier-dots" aria-hidden="true" />
                          <span className="kala-tier-price">₹{option.price}</span>
                        </Link>
                      ))}
                    </div>

                    <p className="kala-event-desc">{currentEvent.description}</p>

                    {/* Action CTA Button */}
                    <div className="kala-event-cta-wrap">
                      <Link
                        to={currentEvent.link}
                        className="kala-btn kala-btn-primary kala-event-action-btn kala-bundle-cta"
                        aria-label="Shop the bundle offer and select your T-shirts"
                      >
                        <span>{currentEvent.ctaText}</span>
                        <svg
                          className="kala-arrow-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              )}

              {/* ------------------------------------------------------------
                  SLIDE 2: PRODUCT DROP (KALA BIHARI STORY)
                  ------------------------------------------------------------ */}
              {currentEvent.type === 'product' && (
                <article
                  key={currentEvent.id}
                  className="kala-event-card-single kala-card-product"
                  aria-label={`Event ${currentIndex + 1} of ${totalSlides}: ${currentEvent.title}`}
                >
                  {/* Visual Media Stage */}
                  <div className="kala-event-media-stage">
                    <div className="kala-stage-topbar">
                      <span className="kala-stage-badge dark">
                        <span className="kala-badge-dot" aria-hidden="true" />
                        {currentEvent.badge}
                      </span>
                      <span className="kala-stage-price-pill">
                        {currentEvent.currency}
                        {currentEvent.price}
                      </span>
                    </div>

                    <div className="kala-stage-image-wrap">
                      <img
                        src={activeImg || currentEvent.frontImage}
                        alt={currentEvent.title}
                        className="kala-stage-main-img"
                        loading="eager"
                        draggable={false}
                      />
                    </div>

                    {/* Front / Back Toggle Chip */}
                    {currentEvent.backImage && (
                      <div
                        className="kala-card-view-toggle"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setActiveImg((prev) =>
                            prev === currentEvent.frontImage
                              ? currentEvent.backImage!
                              : currentEvent.frontImage
                          )
                        }}
                        title="Toggle front or back view"
                      >
                        <button
                          type="button"
                          className={`kala-toggle-chip ${(activeImg || currentEvent.frontImage) === currentEvent.frontImage ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setActiveImg(currentEvent.frontImage)
                            restartTimer()
                          }}
                          aria-label="View front of T-shirt"
                        >
                          Front
                        </button>
                        <button
                          type="button"
                          className={`kala-toggle-chip ${activeImg === currentEvent.backImage ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setActiveImg(currentEvent.backImage!)
                            restartTimer()
                          }}
                          aria-label="View back of T-shirt"
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content Body */}
                  <div className="kala-event-body">
                    <div className="kala-body-heading-group">
                      <div className="kala-title-row">
                        <h3 className="kala-event-main-title">{currentEvent.title}</h3>
                      </div>
                      <div className="kala-event-price-line">
                        <span className="kala-price-amount">
                          {currentEvent.currency}
                          {currentEvent.price}
                        </span>
                        <span className="kala-stock-tag">{currentEvent.status}</span>
                      </div>
                    </div>

                    <p className="kala-event-desc">{currentEvent.description}</p>

                    {/* Feature Badges */}
                    <div className="kala-feature-badges-row" aria-label="Key Features">
                      {currentEvent.features.map((feature, fIdx) => (
                        <span key={fIdx} className="kala-feature-badge-item">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>

                    {/* Action CTA Button */}
                    <div className="kala-event-cta-wrap">
                      <Link
                        to={currentEvent.link}
                        className="kala-btn kala-btn-primary kala-event-action-btn"
                        aria-label={`View ${currentEvent.title} product details`}
                      >
                        <span>{currentEvent.ctaText}</span>
                        <svg
                          className="kala-arrow-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              )}

              {/* ------------------------------------------------------------
                  SLIDE 3: UPCOMING LOCKED EVENT (DESIGNATHON IDEA)
                  ------------------------------------------------------------ */}
              {currentEvent.type === 'upcoming' && (
                <article
                  key={currentEvent.id}
                  className="kala-event-card-single kala-card-upcoming"
                  aria-label={`Event ${currentIndex + 1} of ${totalSlides}: Upcoming Event ${currentEvent.title}`}
                >
                  {/* Visual Media Stage with Mystery Blur & Lock Overlay */}
                  <div className="kala-event-media-stage kala-stage-upcoming">
                    {/* Subtle Blurred Background Graphic */}
                    {currentEvent.backgroundGraphic && (
                      <img
                        src={currentEvent.backgroundGraphic}
                        alt=""
                        className="kala-upcoming-bg-art"
                        aria-hidden="true"
                        draggable={false}
                      />
                    )}

                    <div className="kala-upcoming-stage-overlay" />

                    <div className="kala-stage-topbar">
                      <span className="kala-stage-badge lock-badge">
                        <span className="kala-lock-icon" aria-hidden="true">🔒</span>
                        {currentEvent.badge}
                      </span>
                      <span className="kala-stage-sub-badge upcoming-badge">
                        {currentEvent.icon} MYSTERY DROP
                      </span>
                    </div>

                    {/* Center Mystery Gift / Lock Focal Element */}
                    <div className="kala-upcoming-focal" aria-hidden="true">
                      <div className="kala-mystery-gift-icon-wrap">
                        <span className="kala-gift-symbol">{currentEvent.icon}</span>
                      </div>
                      <span className="kala-mystery-caption">CREATOR INITIATIVE</span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="kala-event-body kala-upcoming-body">
                    <div className="kala-body-heading-group">
                      <div className="kala-upcoming-concept-pill">
                        {currentEvent.conceptTag}
                      </div>
                      <h3 className="kala-event-main-title kala-upcoming-title">
                        {currentEvent.title}
                      </h3>
                    </div>

                    <p className="kala-event-desc kala-upcoming-desc">
                      {currentEvent.description}
                    </p>

                    {/* Release Date Box */}
                    <div className="kala-release-date-box" aria-label={`Releasing on ${currentEvent.releaseDate}`}>
                      <div className="kala-release-date-label">RELEASING:</div>
                      <div className="kala-release-date-value">
                        <strong>{currentEvent.releaseDate}</strong>
                        <span className="kala-release-month">({currentEvent.releaseDateLabel})</span>
                      </div>
                    </div>

                    {/* Non-Clickable Locked CTA */}
                    <div className="kala-event-cta-wrap">
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="kala-btn kala-locked-btn"
                        title="This upcoming event is locked and will be available soon"
                      >
                        <span className="kala-btn-lock-icon" aria-hidden="true">🔒</span>
                        <span>LOCKED • RELEASING SOON</span>
                      </button>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* Circular Next Button (Right Side) */}
          <button
            type="button"
            className="kala-carousel-side-arrow next"
            onClick={() => {
              handleNext()
              restartTimer()
            }}
            aria-label="Next event"
            title="Next event"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default NewEventsSection
