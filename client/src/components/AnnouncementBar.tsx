import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import '../styles/AnnouncementBar.css'

interface AnnouncementItem {
  id: string
  badge: string
  text: string
  highlight?: string
  ctaText: string
  link: string
}

// Authoritative default announcement communicating all three core services
const DEFAULT_ANNOUNCEMENT: AnnouncementItem = {
  id: 'kala-all-services',
  badge: 'SERVICES',
  text: 'CUSTOM APPAREL · CAMPUS MERCHANDISE · BRANDING SOLUTIONS',
  ctaText: 'EXPLORE SERVICES →',
  link: '/#services',
}

export const AnnouncementBar: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([DEFAULT_ANNOUNCEMENT])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isFading, setIsFading] = useState<boolean>(false)

  // Dynamically verify genuine live event availability (e.g., active Designathon)
  useEffect(() => {
    let isMounted = true

    fetch(`${API_BASE_URL}/designathon/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.success || !data?.config) return

        // If registration window is genuinely open, include the verified event announcement
        const windowState = data.config.window
        const isLive = windowState?.isOpen === true

        if (isLive) {
          const eventItem: AnnouncementItem = {
            id: 'designathon-live',
            badge: 'LIVE EVENT',
            text: `${data.config.eventName || 'Designathon in GGV by KALA'} • Show Your कला`,
            highlight: `₹${data.config.feeRupees || 49} REGISTRATION`,
            ctaText: 'REGISTER NOW →',
            link: '/designathon',
          }
          setAnnouncements([DEFAULT_ANNOUNCEMENT, eventItem])
        }
      })
      .catch((err) => {
        // Silently fall back to default custom printing announcement without fake messaging
        console.debug('[AnnouncementBar] Event status query bypassed, using default:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Single-item static or subtle cycle when genuine active event exists
  useEffect(() => {
    if (announcements.length <= 1) return

    const timer = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
        setIsFading(false)
      }, 300)
    }, 5000)

    return () => clearInterval(timer)
  }, [announcements.length])

  const current = announcements[currentIndex] || DEFAULT_ANNOUNCEMENT

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
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBar
