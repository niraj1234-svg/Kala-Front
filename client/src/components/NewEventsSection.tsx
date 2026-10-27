import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { KALA_EVENTS, type ProductEvent, type BundleEvent, type UpcomingEvent, type LiveEvent } from '../data/events'
import '../styles/NewEventsSection.css'

export const NewEventsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const totalSlides = KALA_EVENTS.length

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-advance campaign card every 4.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      handleNext()
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused, handleNext])

  const currentEvent = KALA_EVENTS[currentIndex]

  // Resolve fields for current event
  const getEventData = (event: typeof currentEvent) => {
    if (event.type === 'product') {
      const prod = event as ProductEvent
      return {
        badge: prod.badge || 'FEATURED DROP',
        title: prod.title,
        description: prod.description,
        statusTag: `₹${prod.price} • ${prod.status || 'In Stock'}`,
        ctaText: 'VIEW PRODUCT',
        ctaLink: prod.link || `/product/${prod.productId}`,
        imageSrc: prod.frontImage,
        imageAlt: prod.title,
      }
    }
    if (event.type === 'bundle') {
      const bnd = event as BundleEvent
      return {
        badge: bnd.badge || 'MULTI-BUY OFFER',
        title: bnd.title,
        description: bnd.description,
        statusTag: 'Custom Bundles From ₹499',
        ctaText: 'EXPLORE BUNDLES',
        ctaLink: bnd.link || '/bundle?offer=3',
        imageSrc: bnd.stackImages[0] || '/images/Streetwear 01.png',
        imageAlt: bnd.title,
      }
    }
    if (event.type === 'live') {
      const live = event as LiveEvent
      return {
        badge: live.categoryBadge || 'OFFICIAL EVENT',
        title: live.title,
        description: live.description,
        statusTag: `${live.date} • ${live.fee ? `₹${live.fee} Registration` : 'Open'}`,
        ctaText: live.ctaText || 'REGISTER NOW',
        ctaLink: live.link || '/designathon',
        imageSrc: live.image,
        imageAlt: live.title,
      }
    }
    const up = event as UpcomingEvent
    return {
      badge: up.categoryBadge || 'UPCOMING INITIATIVE',
      title: up.title,
      description: up.description,
      statusTag: up.date || 'COMING SOON',
      ctaText: 'EXPLORE KALA',
      ctaLink: '/shop',
      imageSrc: up.image,
      imageAlt: up.title,
    }
  }

  const data = getEventData(currentEvent)

  return (
    <section
      className="kala-compact-events-section"
      aria-labelledby="fresh-drops-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="kala-compact-events-container">
        {/* Section Header */}
        <div className="kala-compact-events-header">
          <div className="kala-compact-events-header-left">
            <span className="kala-compact-kicker">KALA • WHAT’S NEXT</span>
            <h2 id="fresh-drops-heading" className="kala-compact-events-title">
              FRESH DROPS &amp; EVENTS
            </h2>
          </div>
          <p className="kala-compact-events-subtitle">
            New pieces. New ideas. Coming soon.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="kala-compact-tabs-row" role="tablist" aria-label="Campaign tabs">
          {KALA_EVENTS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={currentIndex === idx}
              className={`kala-compact-tab-btn ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <span>{item.type === 'product' ? 'Bihari Story' : item.type === 'bundle' ? 'T-Shirt Stack' : item.type === 'live' ? 'Designathon' : item.id === 'kala-culture-drops' ? 'Culture Drops' : 'Collab Drops'}</span>
            </button>
          ))}
        </div>

        {/* Compact Horizontal Campaign Card */}
        <div className="kala-compact-card-frame">
          <div className="kala-compact-card-grid">
            {/* Visual Image Column */}
            <div className="kala-compact-media-col">
              <img
                src={data.imageSrc}
                alt={data.imageAlt}
                className="kala-compact-card-img"
                loading="lazy"
              />
            </div>

            {/* Content Column */}
            <div className="kala-compact-content-col">
              <div className="kala-compact-badge-row">
                <span className="kala-compact-status-badge">
                  <span className="kala-badge-dot" aria-hidden="true" />
                  {data.badge}
                </span>
                <span className="kala-compact-status-tag">{data.statusTag}</span>
              </div>

              <h3 className="kala-compact-card-title">{data.title}</h3>
              <p className="kala-compact-card-desc">{data.description}</p>

              <div className="kala-compact-card-actions">
                <Link to={data.ctaLink} className="kala-compact-card-cta">
                  <span>{data.ctaText}</span>
                  <svg
                    width="15"
                    height="15"
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

                {/* Minimalist Slide Controls */}
                <div className="kala-compact-nav-controls">
                  <button
                    type="button"
                    className="kala-compact-arrow-btn"
                    onClick={handlePrev}
                    aria-label="Previous campaign"
                    title="Previous"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <span className="kala-compact-counter">
                    {currentIndex + 1} / {totalSlides}
                  </span>

                  <button
                    type="button"
                    className="kala-compact-arrow-btn"
                    onClick={handleNext}
                    aria-label="Next campaign"
                    title="Next"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewEventsSection
