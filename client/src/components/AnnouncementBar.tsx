import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/AnnouncementBar.css'

interface AnnouncementItem {
  id: string
  badge: string
  text: string
  highlight?: string
  ctaText: string
  link: string
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'bihari-drop',
    badge: 'HOT DROP',
    text: 'KALA Bihari Story Premium 220 GSM Streetwear',
    highlight: '₹400 ONLY',
    ctaText: 'BUY NOW',
    link: '/product/kala-bihari-story-premium-t-shirt',
  },
  {
    id: 'free-shipping',
    badge: 'FREE DELIVERY',
    text: 'Pan-India Express Delivery on all orders above ₹699',
    highlight: 'LIMITED TIME',
    ctaText: 'SHOP COLLECTION',
    link: '/shop',
  },
  {
    id: 'bundle-stack',
    badge: 'VALUE DEAL',
    text: 'Build Your T-Shirt Stack: 3 T-Shirts for ₹699',
    highlight: 'SAVE ₹500',
    ctaText: 'BUILD STACK',
    link: '/bundle?offer=3',
  },
  {
    id: 'custom-apparel',
    badge: 'CUSTOM PRINT',
    text: 'Design Your Own Streetwear & Oversized Apparel',
    highlight: 'FROM 1 PIECE',
    ctaText: 'CUSTOMIZE NOW',
    link: '/custom-apparel',
  },
]

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isFading, setIsFading] = useState<boolean>(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
        setIsFading(false)
      }, 300)
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  const current = ANNOUNCEMENTS[currentIndex]

  return (
    <div className="kala-announcement-bar" role="region" aria-label="Special Announcements">
      <div className="kala-announcement-container">
        <div className={`kala-announcement-content ${isFading ? 'fade-out' : 'fade-in'}`}>
          <span className="kala-announcement-badge">
            <span className="kala-announcement-pulse-dot" aria-hidden="true" />
            {current.badge}
          </span>

          <span className="kala-announcement-text">
            {current.text}
            {current.highlight && (
              <strong className="kala-announcement-highlight"> • {current.highlight}</strong>
            )}
          </span>

          <Link to={current.link} className="kala-announcement-cta">
            <span>{current.ctaText}</span>
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBar
