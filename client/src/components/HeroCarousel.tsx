import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../styles/HeroCarousel.css'

interface HeroSlide {
  id: string
  title: string
  image: string
  alt: string
}

/**
 * The 4 official KALA hero posters in the exact requested order:
 * 1. Wear Your Story poster
 * 2. More Than Clothes poster
 * 3. Clothes For A Bigger You poster
 * 4. Wear Your Story / KALA lifestyle poster
 */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'wear-your-story',
    title: 'Wear Your Story',
    image: '/hero/hero-1-wear-your-story.png',
    alt: 'KALA Wear Your Story — Everyday People, Extraordinary Stories',
  },
  {
    id: 'more-than-clothes',
    title: 'More Than Clothes',
    image: '/hero/hero-2-more-than-clothes.png',
    alt: 'KALA More Than Clothes — Same City, Bigger Dreams',
  },
  {
    id: 'clothes-for-a-bigger-you',
    title: 'Clothes For A Bigger You',
    image: '/hero/hero-3-clothes-for-a-bigger-you.png',
    alt: 'KALA Clothes For A Bigger You — Apparel, Identity, You',
  },
  {
    id: 'kala-lifestyle',
    title: 'Wear Your Story / KALA Lifestyle',
    image: '/hero/hero-4-kala-lifestyle.png',
    alt: 'KALA Lifestyle — Wear Your Story, Urban Drift',
  },
]

const AUTOPLAY_INTERVAL = 5000 // 5 seconds
const SWIPE_THRESHOLD = 45 // min px required to trigger slide change

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState<number>(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Gesture handling refs
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const dragDeltaX = useRef<number>(0)

  // Start/restart autoplay timer (always 5 seconds after interaction)
  const startAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setDirection('next')
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    }, AUTOPLAY_INTERVAL)
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

  // Mobile touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
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

    // If swipe is horizontal, prevent browser back/forward or horizontal scroll
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
  }

  // Desktop mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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
  }

  const handleSlideClick = (e: React.MouseEvent) => {
    // If the interaction was a swipe/drag, cancel link navigation
    if (Math.abs(dragDeltaX.current) > 10) {
      e.preventDefault()
    }
  }

  return (
    <section
      className="kala-hero-carousel-section"
      aria-roledescription="carousel"
      aria-label="KALA Hero Posters"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
              <Link
                to="/shop"
                className="kala-hero-slide-link"
                tabIndex={isActive ? 0 : -1}
                onClick={handleSlideClick}
                draggable={false}
                aria-label={`Explore KALA — ${slide.title}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="kala-hero-slide-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  draggable={false}
                />
              </Link>
            </div>
          )
        })}

        {/* Left Arrow Navigation Button */}
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
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right Arrow Navigation Button */}
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
            width="22"
            height="22"
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
        </button>

        {/* 4 Small Pagination Dots */}
        <div className="kala-hero-dots" role="tablist" aria-label="Slide navigation">
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
