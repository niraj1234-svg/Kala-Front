import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/AuthPromptModal.css'

const DISMISSED_SESSION_KEY = 'kala_login_prompt_dismissed'
const TIMER_START_SESSION_KEY = 'kala_auth_prompt_start'
const PROMPT_DELAY_MS = 120 * 1000 // 120 seconds (2 minutes)

export const AuthPromptModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { isAuthenticated, currentUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef<number | null>(null)
  const isTypingCheckRef = useRef<number | null>(null)

  // Safe dismissal handler
  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true')
    } catch {
      // Ignore storage errors in private browsing modes
    }
    setIsOpen(false)
  }, [])

  // Navigation handlers
  const handleCreateAccount = () => {
    handleDismiss()
    navigate('/account?tab=register')
  }

  const handleLogin = () => {
    handleDismiss()
    navigate('/account?tab=login')
  }

  // Check whether conditions allow displaying the modal right now
  const canShowModal = useCallback((): boolean => {
    // 1. Must NOT be authenticated
    if (isAuthenticated || currentUser) return false

    // 2. Must NOT have been dismissed during this browser session
    try {
      if (sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true') {
        return false
      }
    } catch {
      return false
    }

    // 3. Must NOT be on admin pages
    const path = location.pathname.toLowerCase()
    if (path.startsWith('/admin')) return false

    // 4. Must NOT interrupt checkout flow
    if (path.startsWith('/checkout') || path.startsWith('/order-confirmation')) return false

    // 5. Must NOT be on account page already
    if (path.startsWith('/account')) return false

    return true
  }, [isAuthenticated, currentUser, location.pathname])

  // Trigger modal display with active input guard
  const triggerDisplay = useCallback(() => {
    if (!canShowModal()) return

    // Guard: Do NOT interrupt active form typing
    const activeEl = document.activeElement
    const isTyping =
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable)

    if (isTyping) {
      // User is currently filling out a form; defer prompt until idle
      if (isTypingCheckRef.current) {
        window.clearTimeout(isTypingCheckRef.current)
      }
      isTypingCheckRef.current = window.setTimeout(() => {
        triggerDisplay()
      }, 5000)
      return
    }

    setIsOpen(true)
  }, [canShowModal])

  // Persistent session timer setup
  useEffect(() => {
    // If user is authenticated or already dismissed, do nothing
    if (!canShowModal()) {
      setIsOpen(false)
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // Initialize session timer start timestamp if not already set
    let startTime: number
    try {
      const stored = sessionStorage.getItem(TIMER_START_SESSION_KEY)
      if (stored) {
        startTime = parseInt(stored, 10)
        if (isNaN(startTime)) {
          startTime = Date.now()
          sessionStorage.setItem(TIMER_START_SESSION_KEY, startTime.toString())
        }
      } else {
        startTime = Date.now()
        sessionStorage.setItem(TIMER_START_SESSION_KEY, startTime.toString())
      }
    } catch {
      startTime = Date.now()
    }

    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, PROMPT_DELAY_MS - elapsed)

    // Clear any previous timer reference to avoid duplicates in React Strict Mode
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (remaining === 0) {
      triggerDisplay()
    } else {
      timerRef.current = window.setTimeout(() => {
        triggerDisplay()
      }, remaining)
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (isTypingCheckRef.current) {
        window.clearTimeout(isTypingCheckRef.current)
        isTypingCheckRef.current = null
      }
    }
  }, [canShowModal, triggerDisplay])

  // Escape key listener when modal is open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleDismiss])

  if (!isOpen) return null

  return (
    <div
      className="kala-auth-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kala-auth-modal-title"
      aria-describedby="kala-auth-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss()
        }
      }}
    >
      <div className="kala-auth-modal-card">
        {/* Close Button */}
        <button
          type="button"
          className="kala-auth-modal-close"
          onClick={handleDismiss}
          aria-label="Close dialog"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Brand Badge */}
        <span className="kala-auth-modal-badge">KALA</span>

        {/* Heading */}
        <h2 id="kala-auth-modal-title" className="kala-auth-modal-title">
          Join KALA Today
        </h2>

        {/* Subtitle / Value Proposition */}
        <p id="kala-auth-modal-desc" className="kala-auth-modal-desc">
          Create an account to get personalized orders, saved items and more.
        </p>

        {/* Actions Stack */}
        <div className="kala-auth-modal-actions">
          <button
            type="button"
            className="kala-auth-modal-btn-primary"
            onClick={handleCreateAccount}
          >
            CREATE ACCOUNT
          </button>

          <button
            type="button"
            className="kala-auth-modal-btn-secondary"
            onClick={handleLogin}
          >
            LOGIN
          </button>

          <button
            type="button"
            className="kala-auth-modal-later"
            onClick={handleDismiss}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPromptModal
