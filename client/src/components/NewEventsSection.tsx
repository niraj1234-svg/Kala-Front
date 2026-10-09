import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KALA_EVENTS, type ProductEvent, type BundleEvent, type UpcomingEvent } from '../data/events'
import { useCart } from '../context/CartContext'
import { flyToCart } from '../utils/cartAnimation'
import '../styles/NewEventsSection.css'

export const NewEventsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Track front/back image toggle per product event
  const [productViews, setProductViews] = useState<Record<string, string>>({})
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null)

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({ 'kala-bihari-story': 'M' })

  const { addToCart } = useCart()
  const navigate = useNavigate()
  const totalSlides = KALA_EVENTS.length

  // Quick purchase handler (directly directs to checkout with selected size)
  const handleBuyNow = (e: React.MouseEvent, prod: ProductEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const chosenSize = selectedSizes[prod.id] || 'M'
    addToCart(
      {
        id: prod.productId,
        name: `${prod.title} (${chosenSize})`,
        image: prod.frontImage,
        price: prod.price,
      },
      chosenSize,
      1
    )
    navigate('/checkout')
  }

  // Quick add to cart handler (triggers animation & feedback without leaving)
  const handleQuickAdd = (e: React.MouseEvent, prod: ProductEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const chosenSize = selectedSizes[prod.id] || 'M'
    addToCart(
      {
        id: prod.productId,
        name: `${prod.title} (${chosenSize})`,
        image: prod.frontImage,
        price: prod.price,
      },
      chosenSize,
      1
    )
    setQuickAddedId(prod.id)
    setTimeout(() => {
      setQuickAddedId(null)
    }, 2200)

    const cardEl = (e.currentTarget as HTMLElement).closest('.kala-event-card-single')
    const imgEl = cardEl?.querySelector<HTMLImageElement>('.kala-stage-main-img')
    flyToCart({
      sourceElement: imgEl || null,
      imageSrc: prod.frontImage,
      productName: prod.title,
    })
  }

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
            <span className="kala-eyebrow-text">KALA • WHAT’S NEXT</span>
          </div>
          <h2 id="new-events-heading" className="kala-new-events-title">
            FRESH DROPS &amp; EVENTS
          </h2>
          <p className="kala-new-events-subtitle">
            New pieces. New ideas. Coming soon.
          </p>
        </header>

        {/* ================================================================
            QUICK DROP SELECTOR TABS (Direct 1-Click Access Above The Fold)
            ================================================================ */}
        <div className="kala-new-events-tabs" role="tablist" aria-label="Drop categories">
          {KALA_EVENTS.map((event, idx) => {
            let icon = '🔥'
            let label = 'Featured Drop'
            let tag = '₹400'
            if (event.type === 'bundle') {
              icon = '⚡'
              label = 'T-Shirt Stack'
              tag = 'From ₹499'
            } else if (event.id === 'kala-culture-drops') {
              icon = '🇮🇳'
              label = 'Culture Drops'
              tag = 'Pan-India'
            } else if (event.id === 'kala-campus-ideathon') {
              icon = '🏆'
              label = 'Ideathon'
              tag = 'Campus Battle'
            }

            return (
              <button
                key={event.id}
                type="button"
                role="tab"
                aria-selected={currentIndex === idx}
                className={`kala-events-tab-pill ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to ${label} slide`}
              >
                <span className="kala-tab-icon" aria-hidden="true">{icon}</span>
                <span className="kala-tab-label">{label}</span>
                <span className="kala-tab-tag">{tag}</span>
              </button>
            )
          })}
        </div>

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
                              <div className="kala-stage-topbar-actions">
                                <span className="kala-stage-price-pill">
                                  {prod.currency}{prod.price}
                                </span>
                                <button
                                  type="button"
                                  className={`kala-stage-quick-add-btn ${quickAddedId === prod.id ? 'is-added' : ''}`}
                                  onClick={(e) => handleQuickAdd(e, prod)}
                                  title={quickAddedId === prod.id ? 'Added to Cart!' : 'Quick Add to Cart'}
                                  aria-label={`Quick add ${prod.title} to cart`}
                                >
                                  {quickAddedId === prod.id ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                      <line x1="3" y1="6" x2="21" y2="6"/>
                                      <path d="M16 10a4 4 0 0 1-8 0"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
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
                                <span className="kala-price-original">₹799</span>
                                <span className="kala-price-save-pill">50% OFF • SAVE ₹399</span>
                                <span className="kala-stock-tag">{prod.status}</span>
                              </div>
                            </div>

                            {/* Real-Time Live Urgency & Scarcity Tracker */}
                            <div className="kala-urgency-counter-strip" aria-label="Drop popularity">
                              <span className="kala-urgency-icon" aria-hidden="true">🔥</span>
                              <span className="kala-urgency-text">
                                <strong>19 shoppers</strong> viewing now • <strong>Only 6 left</strong> in Size {selectedSizes[prod.id] || 'M'}
                              </span>
                              <div className="kala-urgency-bar-track">
                                <div className="kala-urgency-bar-fill" style={{ width: '84%' }} />
                              </div>
                            </div>

                            {/* Interactive Size Selector Strip */}
                            <div className="kala-event-size-selector" aria-label="Choose your size">
                              <span className="kala-size-selector-label">SIZE:</span>
                              <div className="kala-size-chips-row">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    className={`kala-size-chip ${(selectedSizes[prod.id] || 'M') === sz ? 'active' : ''}`}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSelectedSizes((prev) => ({ ...prev, [prod.id]: sz }))
                                    }}
                                    aria-label={`Select size ${sz}`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <p className="kala-event-desc">{prod.description}</p>

                            <div className="kala-event-cta-wrap kala-dual-cta">
                              <Link
                                to={prod.link}
                                className="kala-btn kala-event-action-btn kala-btn-view"
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
                              <button
                                type="button"
                                onClick={(e) => handleBuyNow(e, prod)}
                                className="kala-btn kala-event-action-btn kala-btn-buy"
                                aria-label={`Buy ${prod.title} now in size ${selectedSizes[prod.id] || 'M'} for ${prod.currency}${prod.price}`}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                <span>BUY NOW ({selectedSizes[prod.id] || 'M'}) • {prod.currency}{prod.price}</span>
                              </button>
                            </div>

                            {/* Trust Assurance Micro-Badges Row */}
                            <div className="kala-event-trust-assurance">
                              <span className="kala-assurance-item">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                <span>100% Secure</span>
                              </span>
                              <span className="kala-assurance-dot" aria-hidden="true">•</span>
                              <span className="kala-assurance-item">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>Dispatches in 24h</span>
                              </span>
                              <span className="kala-assurance-dot" aria-hidden="true">•</span>
                              <span className="kala-assurance-item">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>7-Day Exchange</span>
                              </span>
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

                          <div className="kala-event-cta-wrap kala-dual-cta">
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
                            <Link
                              to="/shop"
                              className="kala-btn kala-event-action-btn kala-btn-explore"
                              aria-label="Explore all available products in KALA shop"
                            >
                              <span>EXPLORE SHOP</span>
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
