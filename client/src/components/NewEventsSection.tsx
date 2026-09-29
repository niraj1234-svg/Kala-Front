import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { KALA_EVENTS, type ProductEvent, type BundleEvent, type UpcomingEvent } from '../data/events'
import '../styles/NewEventsSection.css'

export const NewEventsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Find events strictly by ID to guarantee sequence and type safety
  const featuredProductEvent = KALA_EVENTS.find((e) => e.id === 'kala-bihari-story') as ProductEvent | undefined
  const bundleEvent = KALA_EVENTS.find((e) => e.id === 'tshirt-stack-bundle') as BundleEvent | undefined
  const upcomingEvent = KALA_EVENTS.find((e) => e.id === 'designathon-idea') as UpcomingEvent | undefined

  // Bihari Story Front / Back toggle state
  const [bihariStoryImage, setBihariStoryImage] = useState<string>(
    featuredProductEvent?.frontImage || ''
  )

  // Update front image if event data changes
  useEffect(() => {
    if (featuredProductEvent?.frontImage && !bihariStoryImage) {
      setBihariStoryImage(featuredProductEvent.frontImage)
    }
  }, [featuredProductEvent, bihariStoryImage])

  // Total slides is strictly 3
  const totalSlides = 3

  // Swipe & Drag tracking refs
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const mouseStartX = useRef<number | null>(null)
  const isMouseDown = useRef<boolean>(false)

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-slide effect: automatically changes slide every 3 seconds
  // When currentIndex changes (manually or auto), the 3-second timer resets automatically!
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      handleNext()
    }, 3000)

    return () => {
      clearInterval(timer)
    }
  }, [isPaused, handleNext, currentIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  // Mobile Touch handlers (Swipe left/right)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Only swipe if horizontal movement is dominant and > 35px threshold
      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNext()
        } else {
          handlePrev()
        }
      }
    }

    touchStartX.current = null
    touchStartY.current = null
    setIsPaused(false)
  }

  // Desktop Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    mouseStartX.current = e.clientX
    isMouseDown.current = true
    setIsPaused(true)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMouseDown.current && mouseStartX.current !== null) {
      const deltaX = e.clientX - mouseStartX.current
      if (Math.abs(deltaX) > 45) {
        if (deltaX < 0) {
          handleNext()
        } else {
          handlePrev()
        }
      }
    }

    isMouseDown.current = false
    mouseStartX.current = null
    setIsPaused(false)
  }

  const handleMouseLeave = () => {
    isMouseDown.current = false
    mouseStartX.current = null
    setIsPaused(false)
  }

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
            <span className="kala-eyebrow-text">KALA • EXCLUSIVE RELEASES</span>
          </div>
          <h2 id="new-events-heading" className="kala-new-events-title">
            FRESH DROPS
          </h2>
          <p className="kala-new-events-subtitle">
            Limited pieces. Fresh ideas. Made to stand out.
          </p>
        </header>

        {/* ================================================================
            CAROUSEL ROW: [ PREV ARROW ]  [ EVENT CARD VIEWPORT ]  [ NEXT ARROW ]
            Arrows are vertically centered on the left and right sides.
            ================================================================ */}
        <div className="kala-new-events-carousel-outer">
          {/* Circular Previous Button (Left Side) */}
          <button
            type="button"
            className="kala-carousel-side-arrow prev"
            onClick={handlePrev}
            aria-label="Previous event slide"
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

          {/* Event Card Content Wrapper with Smooth Horizontal Track */}
          <div
            className="kala-carousel-card-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <div className="kala-carousel-viewport" aria-live="polite">
              <div
                className="kala-carousel-track"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {/* ------------------------------------------------------------
                    SLIDE 1: FEATURED DROP — KALA Bihari Story Premium T-Shirt
                    ------------------------------------------------------------ */}
                {featuredProductEvent && (
                  <div
                    className="kala-carousel-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label="Slide 1 of 3: Featured Drop — KALA Bihari Story Premium T-Shirt"
                  >
                    <article className="kala-event-card-single kala-card-product">
                      {/* Visual Media Stage */}
                      <div className="kala-event-media-stage">
                        <div className="kala-stage-topbar">
                          <span className="kala-stage-badge dark">
                            <span className="kala-badge-dot" aria-hidden="true" />
                            FEATURED DROP
                          </span>
                          <span className="kala-stage-price-pill">
                            {featuredProductEvent.currency}{featuredProductEvent.price}
                          </span>
                        </div>

                        <div className="kala-stage-image-wrap">
                          <img
                            src={bihariStoryImage || featuredProductEvent.frontImage}
                            alt={featuredProductEvent.title}
                            className="kala-stage-main-img"
                            loading="eager"
                            draggable={false}
                          />
                        </div>

                        {/* Front / Back Toggle Chip */}
                        {featuredProductEvent.backImage && (
                          <div
                            className="kala-card-view-toggle"
                            title="Toggle front or back view"
                          >
                            <button
                              type="button"
                              className={`kala-toggle-chip ${(bihariStoryImage || featuredProductEvent.frontImage) === featuredProductEvent.frontImage ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setBihariStoryImage(featuredProductEvent.frontImage)
                              }}
                              aria-label="View front of T-shirt"
                            >
                              Front
                            </button>
                            <button
                              type="button"
                              className={`kala-toggle-chip ${bihariStoryImage === featuredProductEvent.backImage ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setBihariStoryImage(featuredProductEvent.backImage!)
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
                            <h3 className="kala-event-main-title">{featuredProductEvent.title}</h3>
                          </div>
                          <div className="kala-event-price-line">
                            <span className="kala-price-amount">
                              {featuredProductEvent.currency}{featuredProductEvent.price}
                            </span>
                            <span className="kala-stock-tag">{featuredProductEvent.status}</span>
                          </div>
                        </div>

                        <p className="kala-event-desc">{featuredProductEvent.description}</p>

                        {/* Feature Badges: 220 GSM, Premium Comfort, Durable Fabric, Comfortable Fit */}
                        <div className="kala-feature-badges-row" aria-label="Key Features">
                          {featuredProductEvent.features.map((feature, fIdx) => (
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
                            to={featuredProductEvent.link}
                            className="kala-btn kala-btn-primary kala-event-action-btn"
                            aria-label={`View ${featuredProductEvent.title} product details`}
                          >
                            <span>{featuredProductEvent.ctaText}</span>
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
                  </div>
                )}

                {/* ------------------------------------------------------------
                    SLIDE 2: MULTI-BUY OFFER — Build Your T-Shirt Stack
                    ------------------------------------------------------------ */}
                {bundleEvent && (
                  <div
                    className="kala-carousel-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label="Slide 2 of 3: Multi-Buy Offer — Build Your T-Shirt Stack"
                  >
                    <article className="kala-event-card-single kala-card-bundle">
                      {/* Visual Media Stage */}
                      <div className="kala-event-media-stage kala-stage-bundle">
                        <div className="kala-stage-topbar">
                          <span className="kala-stage-badge orange">
                            <span className="kala-badge-pulse" aria-hidden="true" />
                            {bundleEvent.badge}
                          </span>
                          {bundleEvent.subBadge && (
                            <span className="kala-stage-sub-badge">{bundleEvent.subBadge}</span>
                          )}
                        </div>

                        {/* 3-Shirt Stack Visual */}
                        <div className="kala-bundle-stack-visual" aria-hidden="true">
                          <img
                            src={bundleEvent.stackImages[0]}
                            alt=""
                            className="kala-stack-tee tee-left"
                            loading="eager"
                            draggable={false}
                          />
                          <img
                            src={bundleEvent.stackImages[1]}
                            alt=""
                            className="kala-stack-tee tee-center"
                            loading="eager"
                            draggable={false}
                          />
                          <img
                            src={bundleEvent.stackImages[2]}
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
                          <h3 className="kala-event-main-title">{bundleEvent.title}</h3>
                          <p className="kala-event-sub-label">{bundleEvent.subtitle}</p>
                        </div>

                        {/* 3 Interactive Bundle Offer Rows:
                            - 2 T-SHIRTS — ₹499
                            - 3 T-SHIRTS — ₹699
                            - 5 T-SHIRTS — ₹999 — BEST VALUE
                        */}
                        <div className="kala-bundle-tiers-group" aria-label="Available Bundle Tiers">
                          {bundleEvent.options.map((option) => (
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
                              <svg
                                className="kala-tier-arrow"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </Link>
                          ))}
                        </div>

                        <p className="kala-event-desc">{bundleEvent.description}</p>

                        {/* Action CTA Button */}
                        <div className="kala-event-cta-wrap">
                          <Link
                            to={bundleEvent.link}
                            className="kala-btn kala-btn-primary kala-event-action-btn kala-bundle-cta"
                            aria-label="Shop the bundle offer and select your T-shirts"
                          >
                            <span>{bundleEvent.ctaText}</span>
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
                  </div>
                )}

                {/* ------------------------------------------------------------
                    SLIDE 3: UPCOMING EVENT — Designathon Idea
                    ------------------------------------------------------------ */}
                {upcomingEvent && (
                  <div
                    className="kala-carousel-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label="Slide 3 of 3: Upcoming Event — Designathon Idea"
                  >
                    <article className="kala-event-card-single kala-card-upcoming">
                      {/* Visual Media Stage with Mystery Blur & Lock Overlay */}
                      <div className="kala-event-media-stage kala-stage-upcoming">
                        {/* Subtle Blurred Background Graphic */}
                        {upcomingEvent.backgroundGraphic && (
                          <img
                            src={upcomingEvent.backgroundGraphic}
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
                            UPCOMING EVENT
                          </span>
                          <span className="kala-stage-sub-badge upcoming-badge">
                            {upcomingEvent.icon} MYSTERY DROP
                          </span>
                        </div>

                        {/* Center Mystery Gift / Lock Focal Element */}
                        <div className="kala-upcoming-focal" aria-hidden="true">
                          <div className="kala-mystery-gift-icon-wrap">
                            <span className="kala-gift-symbol">{upcomingEvent.icon}</span>
                          </div>
                          <span className="kala-mystery-caption">CREATOR INITIATIVE</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="kala-event-body kala-upcoming-body">
                        <div className="kala-body-heading-group">
                          <div className="kala-upcoming-concept-pill">
                            {upcomingEvent.conceptTag}
                          </div>
                          <h3 className="kala-event-main-title kala-upcoming-title">
                            {upcomingEvent.title}
                          </h3>
                        </div>

                        <p className="kala-event-desc kala-upcoming-desc">
                          {upcomingEvent.description}
                        </p>

                        {/* Release Date Box */}
                        <div className="kala-release-date-box" aria-label={`Releasing on ${upcomingEvent.releaseDate}`}>
                          <div className="kala-release-date-label">RELEASING:</div>
                          <div className="kala-release-date-value">
                            <strong>{upcomingEvent.releaseDate}</strong>
                            <span className="kala-release-month">({upcomingEvent.releaseDateLabel})</span>
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Circular Next Button (Right Side) */}
          <button
            type="button"
            className="kala-carousel-side-arrow next"
            onClick={handleNext}
            aria-label="Next event slide"
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

        {/* ================================================================
            INDICATOR DOTS (Slide 1, 2, 3)
            Placed centered beneath the carousel row to show active slide
            ================================================================ */}
        <div className="kala-carousel-indicators" role="tablist" aria-label="Event slides navigation">
          <button
            type="button"
            role="tab"
            aria-selected={currentIndex === 0}
            aria-label="Go to slide 1: Featured Drop"
            className={`kala-indicator-dot ${currentIndex === 0 ? 'active' : ''}`}
            onClick={() => goToSlide(0)}
          />
          <button
            type="button"
            role="tab"
            aria-selected={currentIndex === 1}
            aria-label="Go to slide 2: Multi-Buy Offer"
            className={`kala-indicator-dot ${currentIndex === 1 ? 'active' : ''}`}
            onClick={() => goToSlide(1)}
          />
          <button
            type="button"
            role="tab"
            aria-selected={currentIndex === 2}
            aria-label="Go to slide 3: Upcoming Event"
            className={`kala-indicator-dot ${currentIndex === 2 ? 'active' : ''}`}
            onClick={() => goToSlide(2)}
          />
        </div>
      </div>
    </section>
  )
}

export default NewEventsSection
