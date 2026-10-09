import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductImage } from '../data/products'
import '../styles/LiveSocialProof.css'

interface SocialProofItem {
  id: string
  buyerName: string
  city: string
  productName: string
  image: string
  timeAgo: string
  link: string
  size?: string
}

const SOCIAL_ITEMS: SocialProofItem[] = [
  {
    id: 'sp-1',
    buyerName: 'Rahul K.',
    city: 'Patna, Bihar',
    productName: 'KALA Bihari Story Premium T-Shirt',
    image: getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
    timeAgo: '2 minutes ago',
    link: '/product/kala-bihari-story-premium-t-shirt',
    size: 'Size L',
  },
  {
    id: 'sp-2',
    buyerName: 'Aditi S.',
    city: 'New Delhi',
    productName: '3 T-Shirts Stack (Limited Multi-Buy)',
    image: getProductImage('Streetwear 01.png') || '/images/Streetwear 01.png',
    timeAgo: '5 minutes ago',
    link: '/bundle?offer=3',
    size: 'Bundle ₹699',
  },
  {
    id: 'sp-3',
    buyerName: 'Amitesh R.',
    city: 'Muzaffarpur, Bihar',
    productName: 'KALA Bihari Story Premium T-Shirt',
    image: getProductImage('kala-bihari-story-front.png') || '/images/kala-bihari-story-front.png',
    timeAgo: '8 minutes ago',
    link: '/product/kala-bihari-story-premium-t-shirt',
    size: 'Size M',
  },
  {
    id: 'sp-4',
    buyerName: 'Karan M.',
    city: 'Bangalore, Karnataka',
    productName: 'Urban Streetwear Oversized Graphic Tee',
    image: getProductImage('Streetwear 05.png') || '/images/Streetwear 05.png',
    timeAgo: '12 minutes ago',
    link: '/shop',
    size: 'Size XL',
  },
  {
    id: 'sp-5',
    buyerName: 'Sneha P.',
    city: 'Ranchi, Jharkhand',
    productName: 'Custom Oversized Streetwear Apparel',
    image: getProductImage('Streetwear 04.png') || '/images/Streetwear 04.png',
    timeAgo: '16 minutes ago',
    link: '/custom-apparel',
    size: 'Custom Print',
  },
]

export const LiveSocialProof: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isDismissed, setIsDismissed] = useState<boolean>(false)

  useEffect(() => {
    if (isDismissed) return

    // Show initial proof after 3.5 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3500)

    // Interval to cycle through notifications: show for 6s, hide for 10s
    const cycleInterval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SOCIAL_ITEMS.length)
        setIsVisible(true)
      }, 9000)
    }, 16000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(cycleInterval)
    }
  }, [isDismissed])

  if (isDismissed) return null

  const current = SOCIAL_ITEMS[currentIndex]

  return (
    <div
      className={`kala-social-proof-toast ${isVisible ? 'visible' : 'hidden'}`}
      role="status"
      aria-live="polite"
    >
      <Link to={current.link} className="kala-social-proof-inner">
        <div className="kala-social-proof-avatar">
          <img
            src={current.image}
            alt={current.productName}
            className="kala-social-proof-img"
            loading="lazy"
          />
          <span className="kala-social-proof-online-badge" title="Live order">
            <span className="kala-social-proof-online-dot" />
          </span>
        </div>

        <div className="kala-social-proof-details">
          <div className="kala-social-proof-header">
            <strong className="kala-social-proof-buyer">{current.buyerName}</strong>
            <span className="kala-social-proof-city">from {current.city}</span>
            <span className="kala-social-proof-verified" title="Verified Customer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          <p className="kala-social-proof-product">
            Purchased <strong>{current.productName}</strong>
          </p>

          <div className="kala-social-proof-meta">
            {current.size && <span className="kala-social-proof-tag">{current.size}</span>}
            <span className="kala-social-proof-time">{current.timeAgo}</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="kala-social-proof-close"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsVisible(false)
          setIsDismissed(true)
        }}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

export default LiveSocialProof
