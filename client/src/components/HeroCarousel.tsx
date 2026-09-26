import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../styles/HeroCarousel.css'

interface CalloutSticker {
  text: string
  sub?: string
  badgeType?: string
}

interface HeroSlide {
  id: string
  title: string
  subhead: string
  headingMain: string
  headingAccent: string
  accentClass: string
  description: string
  ctaText: string
  ctaLink: string
  image: string
  alt: string
  calloutSticker?: CalloutSticker
  extraTag?: string
  badges: string[]
}

/**
 * 4-Slide Premium KALA Hero Carousel
 * 1. HERO 1: BIHAR STORY — Rooted in Bihar
 * 2. HERO 2: GYMWEAR — Built by Discipline / Hits Different
 * 3. HERO 3: CUSTOM APPAREL — Wear Create Express
 * 4. HERO 4: EVERYDAY STREETWEAR — More Than a T-Shirt
 */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'bihar-story',
    title: 'Rooted in Bihar',
    subhead: 'SAME PLACES. BIGGER STORIES.',
    headingMain: 'ROOTED IN',
    headingAccent: 'BIHAR',
    accentClass: 'bihar',
    description: "More than a T-Shirt. It's a feeling, a place, a story.",
    ctaText: 'SHOP THIS T-SHIRT',
    ctaLink: '/product/kala-bihari-story-premium-t-shirt',
    image: '/hero/hero-1-bihar.jpg',
    alt: 'KALA Rooted in Bihar — KALA Bihari Story Premium T-Shirt campaign',
    calloutSticker: {
      text: 'Add Your Own Text on Back',
      sub: '+₹25',
      badgeType: 'bihar',
    },
    extraTag: 'BIHAR FOREVER',
    badges: ['PREMIUM COTTON', '220 GSM FABRIC', 'DURABLE QUALITY', 'PAN INDIA DELIVERY'],
  },
  {
    id: 'gymwear',
    title: 'Gymwear That Hits Different',
    subhead: 'BUILT BY DISCIPLINE. WORN EVERYDAY.',
    headingMain: 'GYMWEAR THAT',
    headingAccent: 'HITS DIFFERENT',
    accentClass: 'gym',
    description: 'Premium Gym T-Shirts for Your Stronger Version.',
    ctaText: 'SHOP GYMWEAR',
    ctaLink: '/shop?category=Gymwear',
    image: '/hero/hero-2-gymwear.jpg',
    alt: 'KALA Gymwear That Hits Different — Premium Gym T-Shirts campaign',
    calloutSticker: {
      text: 'DISCIPLINE BUILDS FREEDOM',
      sub: 'SAME PEOPLE. NEW STORIES.',
      badgeType: 'gym',
    },
    extraTag: 'HEAVYWEIGHT FIT',
    badges: ['PREMIUM COTTON', '220 GSM FABRIC', 'DURABLE QUALITY', 'PAN INDIA DELIVERY'],
  },
  {
    id: 'custom-apparel',
    title: 'Wear Create Express',
    subhead: 'MORE THAN JUST T-SHIRTS.',
    headingMain: 'WEAR CREATE',
    headingAccent: 'EXPRESS',
    accentClass: 'create',
    description: 'T-shirts, Hoodies, Gymwear, Jerseys, Carry Bags, Posters and More.',
    ctaText: 'CREATE YOURS',
    ctaLink: '/custom-apparel',
    image: '/hero/hero-3-custom.jpg',
    alt: 'KALA Wear Create Express — Custom Apparel and Streetwear studio',
    calloutSticker: {
      text: 'CUSTOM APPAREL STUDIO',
      sub: 'BRING YOUR IDEAS TO LIFE',
      badgeType: 'custom',
    },
    extraTag: 'MADE YOUR WAY',
    badges: ['PREMIUM COTTON', '220 GSM FABRIC', 'DURABLE QUALITY', 'PAN INDIA DELIVERY'],
  },
  {
    id: 'everyday-streetwear',
    title: 'More Than a T-Shirt',
    subhead: 'SAME PEOPLE. NEW STORIES.',
    headingMain: 'MORE THAN A',
    headingAccent: 'T-SHIRT',
    accentClass: 'story',
    description: 'Everyday fits for people who carry stories.',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop',
    image: '/hero/hero-4-everyday.jpg',
    alt: 'KALA Everyday Streetwear — More Than a T-Shirt campaign',
    calloutSticker: {
      text: 'PEOPLE • PLACES • PASSION',
      sub: 'URBAN DRIFT',
      badgeType: 'everyday',
    },
    extraTag: 'IDENTITY IN EVERY THREAD',
    badges: ['PREMIUM COTTON', '220 GSM FABRIC', 'DURABLE QUALITY', 'PAN INDIA DELIVERY'],
  },
]

const AUTOPLAY_INTERVAL = 5500 // 5.5s autoplay interval (5–6s range)
const SWIPE_THRESHOLD = 45 // min px swipe distance

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState<number>(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Gesture handling refs
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const dragDeltaX = useRef<number>(0)

  // Autoplay management
  const startAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setDirection('next')
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    }, AUTOPLAY_INTERVAL)
  }, [])

  const pauseAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Manual navigation handlers
  const goToNext = useCallback(() => {
    setDirection('next')
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    startAutoplay()
  }, [startAutoplay])

  const goToPrev = useCallback(() => {
    setDirection('prev')
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
    startAutoplay()
  }, [startAutoplay])

  const goToSlide = useCallback(
    (index: number) => {
      if (index === current) return
      setDirection(index > current ? 'next' : 'prev')
      setCurrent(index)
      startAutoplay()
    },
    [current, startAutoplay]
  )

  // Autoplay lifecycle
  useEffect(() => {
    startAutoplay()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [startAutoplay])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  // Hover pause/resume
  const handleMouseEnter = () => {
    pauseAutoplay()
  }

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false
      if (dragDeltaX.current < -SWIPE_THRESHOLD) {
        goToNext()
      } else if (dragDeltaX.current > SWIPE_THRESHOLD) {
        goToPrev()
      }
      dragDeltaX.current = 0
    }
    startAutoplay()
  }

  // Mobile touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    pauseAutoplay()
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    dragDeltaX.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX.current
    const deltaY = currentY - touchStartY.current

    dragDeltaX.current = deltaX

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (e.cancelable) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = () => {
    if (dragDeltaX.current < -SWIPE_THRESHOLD) {
      goToNext()
    } else if (dragDeltaX.current > SWIPE_THRESHOLD) {
      goToPrev()
    }
    dragDeltaX.current = 0
    startAutoplay()
  }

  // Desktop mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoplay()
    isDragging.current = true
    touchStartX.current = e.clientX
    dragDeltaX.current = 0
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    dragDeltaX.current = e.clientX - touchStartX.current
  }

  const handleMouseUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (dragDeltaX.current < -SWIPE_THRESHOLD) {
      goToNext()
    } else if (dragDeltaX.current > SWIPE_THRESHOLD) {
      goToPrev()
    }
    dragDeltaX.current = 0
    startAutoplay()
  }

  return (
    <section
      className="kala-hero-carousel-section"
      aria-roledescription="carousel"
      aria-label="KALA Hero Collection"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="kala-hero-carousel-viewport">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={slide.id}
              className={`kala-hero-slide ${isActive ? 'active' : ''} ${
                direction === 'next' ? 'slide-dir-next' : 'slide-dir-prev'
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${HERO_SLIDES.length}: ${slide.title}`}
              aria-hidden={!isActive}
            >
              {/* High-Resolution Background Imagery */}
              <div className="kala-hero-bg-wrap">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="kala-hero-slide-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  draggable={false}
                />
                <div className="kala-hero-vignette-overlay" aria-hidden="true" />
              </div>

              {/* Editorial HTML/CSS Content Overlay (Crisp 4K typography & accessible buttons) */}
              <div className="kala-hero-content-container">
                <div className="kala-hero-content-inner">
                  {/* Top Eyebrow / Subhead */}
                  <div className="kala-hero-eyebrow-row">
                    <span className="kala-hero-brand-tag">KALA APPAREL</span>
                    <span className="kala-hero-eyebrow-divider" aria-hidden="true">•</span>
                    <span className="kala-hero-subhead">{slide.subhead}</span>
                  </div>

                  {/* Main Display Heading */}
                  <h1 className="kala-hero-display-heading">
                    <span className="kala-hero-heading-main">{slide.headingMain}</span>
                    <span className={`kala-hero-heading-accent ${slide.accentClass}`}>
                      {slide.headingAccent}
                    </span>
                  </h1>

                  {/* Supporting Description */}
                  <p className="kala-hero-description">{slide.description}</p>

                  {/* Action Row: CTA Button + Handwritten Callout Sticker */}
                  <div className="kala-hero-action-row">
                    <Link
                      to={slide.ctaLink}
                      className="kala-hero-cta-btn"
                      tabIndex={isActive ? 0 : -1}
                      aria-label={`${slide.ctaText} — ${slide.title}`}
                    >
                      <span className="kala-hero-cta-text">{slide.ctaText}</span>
                      <span className="kala-hero-cta-arrow" aria-hidden="true">→</span>
                    </Link>

                    {slide.calloutSticker && (
                      <div className={`kala-hero-callout-sticker ${slide.calloutSticker.badgeType || ''}`}>
                        <span className="kala-hero-sticker-text">{slide.calloutSticker.text}</span>
                        {slide.calloutSticker.sub && (
                          <strong className="kala-hero-sticker-sub">{slide.calloutSticker.sub}</strong>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feature Spec Strip & Extra Tag */}
                  <div className="kala-hero-feature-row">
                    <div className="kala-hero-feature-badges">
                      {slide.badges.map((badge, bIdx) => (
                        <span key={bIdx} className="kala-hero-feature-pill">
                          <svg
                            className="kala-hero-pill-check"
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>

                    {slide.extraTag && (
                      <span className="kala-hero-extra-tag">{slide.extraTag}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Minimalist Left Navigation Arrow */}
        <button
          type="button"
          className="kala-hero-nav-btn kala-hero-nav-prev"
          aria-label="Previous slide"
          onClick={(e) => {
            e.stopPropagation()
            goToPrev()
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Minimalist Right Navigation Arrow */}
        <button
          type="button"
          className="kala-hero-nav-btn kala-hero-nav-next"
          aria-label="Next slide"
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 4 Subtle Pagination Dots */}
        <div className="kala-hero-dots" role="tablist" aria-label="Hero carousel navigation">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === current
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                className={`kala-hero-dot ${isActive ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-selected={isActive}
                onClick={(e) => {
                  e.stopPropagation()
                  goToSlide(index)
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
