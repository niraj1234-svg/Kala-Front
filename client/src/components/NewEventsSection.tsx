import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { KALA_EVENTS, type ProductEvent, type BundleEvent, type UpcomingEvent } from '../data/events'
import '../styles/NewEventsSection.css'

export const NewEventsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Track front/back image toggle per product event
  const [productViews, setProductViews] = useState<Record<string, string>>({})

  const totalSlides = KALA_EVENTS.length

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

  // Auto-slide effect: changes slide every 3 seconds (~3s per event)
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
      aria-label="KALA Events and Fresh Drops Carousel"
    >
      <div className="kala-new-events-container">
        {/* ================================================================
            SECTION HEADER
            ================================================================ */}
        <header className="kala-new-events-header">
          <div className="kala-new-events-eyebrow">
            <span className="kala-eyebrow-accent-dot" aria-hidden="true" />
            <span className="kala-eyebrow-text">KALA • EXCLUSIVE DROPS & UPCOMING EVENTS</span>
          </div>
          <h2 id="new-events-heading" className="kala-new-events-title">
            FRESH DROPS & UPCOMING EVENTS
          </h2>
          <p className="kala-new-events-subtitle">
            Limited pieces. Fresh ideas. Something exciting is coming to KALA.
          </p>
        </header>

        {/* ================================================================
            CAROUSEL ROW: [ PREV ARROW ]  [ EVENT CARD VIEWPORT ]  [ NEXT ARROW ]
            Side arrows are vertically centered on the left and right.
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
                {KALA_EVENTS.map((event, idx) => {
                  /* ------------------------------------------------------------
                     CASE 1: PRODUCT DROP EVENT (e.g. Bihari Story Premium T-Shirt)
                     ------------------------------------------------------------ */
                  if (event.type === 'product') {
                    const prod = event as ProductEvent
                    const activeImg = productViews[prod.id] || prod.frontImage

                    return (
                      <div
                        key={prod.id}
                        className="kala-carousel-slide"
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`Slide ${idx + 1} of ${totalSlides}: ${prod.title}`}
                      >
                        <article className="kala-event-card-single kala-card-product">
                          <div className="kala-event-media-stage">
                            <div className="kala-stage-topbar">
                              <span className="kala-stage-badge dark">
                                <span className="kala-badge-dot" aria-hidden="true" />
                                {prod.badge}
                              </span>
                              <span className="kala-stage-price-pill">
                                {prod.currency}{prod.price}
                              </span>
                            </div>

                            <div className="kala-stage-image-wrap">
                              <img
                                src={activeImg}
                                alt={prod.title}
                                className="kala-stage-main-img"
                                loading="eager"
                                draggable={false}
                              />
                            </div>

                            {prod.backImage && (
                              <div className="kala-card-view-toggle" title="Toggle front or back view">
                                <button
                                  type="button"
                                  className={`kala-toggle-chip ${activeImg === prod.frontImage ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setProductViews((prev) => ({ ...prev, [prod.id]: prod.frontImage }))
                                  }}
                                  aria-label="View front of T-shirt"
                                >
                                  Front
                                </button>
                                <button
                                  type="button"
                                  className={`kala-toggle-chip ${activeImg === prod.backImage ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setProductViews((prev) => ({ ...prev, [prod.id]: prod.backImage! }))
                                  }}
                                  aria-label="View back of T-shirt"
                                >
                                  Back
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="kala-event-body">
                            <div className="kala-body-heading-group">
                              <div className="kala-title-row">
                                <h3 className="kala-event-main-title">{prod.title}</h3>
                              </div>
                              <div className="kala-event-price-line">
                                <span className="kala-price-amount">
                                  {prod.currency}{prod.price}
                                </span>
                                <span className="kala-stock-tag">{prod.status}</span>
                              </div>
                            </div>

                            <p className="kala-event-desc">{prod.description}</p>

                            <div className="kala-feature-badges-row" aria-label="Key Features">
                              {prod.features.map((feature, fIdx) => (
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

                            <div className="kala-event-cta-wrap">
                              <Link
                                to={prod.link}
                                className="kala-btn kala-btn-primary kala-event-action-btn"
                                aria-label={`View ${prod.title} product details`}
                              >
                                <span>{prod.ctaText}</span>
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
                    )
                  }

                  /* ------------------------------------------------------------
                     CASE 2: MULTI-BUY BUNDLE EVENT (e.g. Build Your T-Shirt Stack)
                     ------------------------------------------------------------ */
                  if (event.type === 'bundle') {
                    const bundle = event as BundleEvent

                    return (
                      <div
                        key={bundle.id}
                        className="kala-carousel-slide"
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`Slide ${idx + 1} of ${totalSlides}: ${bundle.title}`}
                      >
                        <article className="kala-event-card-single kala-card-bundle">
                          <div className="kala-event-media-stage kala-stage-bundle">
                            <div className="kala-stage-topbar">
                              <span className="kala-stage-badge orange">
                                <span className="kala-badge-pulse" aria-hidden="true" />
                                {bundle.badge}
                              </span>
                              {bundle.subBadge && (
                                <span className="kala-stage-sub-badge">{bundle.subBadge}</span>
                              )}
                            </div>

                            <div className="kala-bundle-stack-visual" aria-hidden="true">
                              <img
                                src={bundle.stackImages[0]}
                                alt=""
                                className="kala-stack-tee tee-left"
                                loading="eager"
                                draggable={false}
                              />
                              <img
                                src={bundle.stackImages[1]}
                                alt=""
                                className="kala-stack-tee tee-center"
                                loading="eager"
                                draggable={false}
                              />
                              <img
                                src={bundle.stackImages[2]}
                                alt=""
                                className="kala-stack-tee tee-right"
                                loading="eager"
                                draggable={false}
                              />
                            </div>
                          </div>

                          <div className="kala-event-body">
                            <div className="kala-body-heading-group">
                              <h3 className="kala-event-main-title">{bundle.title}</h3>
                              <p className="kala-event-sub-label">{bundle.subtitle}</p>
                            </div>

                            <div className="kala-bundle-tiers-group" aria-label="Available Bundle Tiers">
                              {bundle.options.map((option) => (
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

                            <p className="kala-event-desc">{bundle.description}</p>

                            <div className="kala-event-cta-wrap">
                              <Link
                                to={bundle.link}
                                className="kala-btn kala-btn-primary kala-event-action-btn kala-bundle-cta"
                                aria-label="Shop the bundle offer and select your T-shirts"
                              >
                                <span>{bundle.ctaText}</span>
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
                    )
                  }

                  /* ------------------------------------------------------------
                     CASE 3: UPCOMING EVENT (e.g. Creator Royalty, Designer Royalty, Collab)
                     ------------------------------------------------------------ */
                  const upcoming = event as UpcomingEvent

                  return (
                    <div
                      key={upcoming.id}
                      className="kala-carousel-slide"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`Slide ${idx + 1} of ${totalSlides}: ${upcoming.title}`}
                    >
                      <article className="kala-event-card-single kala-card-upcoming">
                        {/* Visual Media Stage (LEFT: dark visual/event area) */}
                        <div className="kala-event-media-stage kala-stage-upcoming">
                          <img
                            src={upcoming.image}
                            alt=""
                            className="kala-upcoming-bg-art"
                            aria-hidden="true"
                            draggable={false}
                          />

                          <div className="kala-upcoming-stage-overlay" />

                          <div className="kala-stage-topbar">
                            <span className="kala-stage-badge lock-badge">
                              <span className="kala-lock-icon" aria-hidden="true">🔒</span>
                              <span>{upcoming.topLeftBadge}</span>
                            </span>
                            <span className={`kala-stage-sub-badge upcoming-badge ${upcoming.badgeModifier || ''}`}>
                              <span className="kala-badge-symbol" aria-hidden="true">{upcoming.topRightIcon}</span>
                              <span>{upcoming.topRightBadge}</span>
                            </span>
                          </div>

                          <div className="kala-upcoming-visual-frame" aria-hidden="true">
                            <img
                              src={upcoming.image}
                              alt=""
                              className="kala-upcoming-showcase-img"
                              draggable={false}
                            />
                            <div className="kala-upcoming-frame-border" />
                          </div>

                          <div className="kala-upcoming-focal-caption">
                            <span className="kala-focal-accent-dot" aria-hidden="true" />
                            <span className="kala-focal-text">{upcoming.focalTag}</span>
                          </div>
                        </div>

                        {/* Content Body (RIGHT: event information panel) */}
                        <div className="kala-event-body kala-upcoming-body">
                          <div className="kala-body-heading-group">
                            <div className="kala-upcoming-concept-pill">
                              {upcoming.categoryBadge}
                            </div>
                            <h3 className="kala-event-main-title kala-upcoming-title">
                              {upcoming.title}
                            </h3>
                          </div>

                          <p className="kala-event-desc kala-upcoming-desc">
                            {upcoming.description}
                          </p>

                          <div className="kala-release-date-box" aria-label={`Date: ${upcoming.date}`}>
                            <div className="kala-release-date-label">DATE:</div>
                            <div className="kala-release-date-value">
                              <strong>{upcoming.date}</strong>
                            </div>
                          </div>

                          <div className="kala-event-cta-wrap">
                            <button
                              type="button"
                              disabled
                              aria-disabled="true"
                              className="kala-btn kala-locked-btn"
                              title="This upcoming event is locked and will be available soon"
                            >
                              <span className="kala-btn-lock-icon" aria-hidden="true">🔒</span>
                              <span>{upcoming.status}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                  )
                })}
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

        {/* Indicator Dots */}
        <div className="kala-carousel-indicators" role="tablist" aria-label="Events carousel navigation">
          {KALA_EVENTS.map((event, idx) => (
            <button
              key={event.id}
              type="button"
              role="tab"
              aria-selected={currentIndex === idx}
              aria-label={`Go to slide ${idx + 1}: ${event.title}`}
              className={`kala-indicator-dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewEventsSection
