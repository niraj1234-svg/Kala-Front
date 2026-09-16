import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/Navbar.css'

export interface NavRoute {
  label: string
  to: string
}

const NAV_ROUTES: NavRoute[] = [
  { label: 'SHOP', to: '/shop' },
  { label: 'CUSTOM APPAREL', to: '/custom-apparel' },
  { label: 'BUSINESS BRANDING', to: '/business-branding' },
  { label: 'ABOUT', to: '/about' },
]

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const { cartCount } = useCart()

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="kala-header" role="banner">
      <div className="kala-navbar">
        {/* 1. BRAND LOGO (LEFT) */}
        <Link
          to="/"
          className="kala-logo"
          aria-label="KALA — Minimal Luxury Fashion"
          onClick={closeMobileMenu}
        >
          <span className="kala-logo-mark" aria-hidden="true">K</span>
          <span className="kala-logo-text">KALA</span>
          <span className="kala-logo-accent" aria-hidden="true" />
        </Link>

        {/* 2. DESKTOP CENTER NAVIGATION */}
        <nav className="kala-nav-desktop" aria-label="Main Navigation">
          <ul className="kala-nav-links">
            {NAV_ROUTES.map((route) => (
              <li key={route.to} className="kala-nav-item">
                <NavLink
                  to={route.to}
                  className={({ isActive }) =>
                    `kala-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. RIGHT SIDE CONTROLS */}
        <div className="kala-nav-actions">
          <div className="kala-nav-icons" role="toolbar" aria-label="Customer actions">
            {/* Search Button */}
            <button
              type="button"
              className="kala-icon-btn"
              aria-label="Search collection"
              title="Search"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist / Heart Icon */}
            <Link
              to="/wishlist"
              className="kala-icon-btn desktop-only"
              aria-label="View wishlist"
              title="Wishlist"
              onClick={closeMobileMenu}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            {/* User Account Icon */}
            <Link
              to="/account"
              className="kala-icon-btn desktop-only"
              aria-label="User account"
              title="Account"
              onClick={closeMobileMenu}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart / Shopping Bag Icon */}
            <Link
              to="/cart"
              className="kala-icon-btn"
              aria-label={`Shopping bag, ${cartCount} items`}
              title="Bag"
              onClick={closeMobileMenu}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="kala-cart-badge" aria-hidden="true">{cartCount}</span>
            </Link>
          </div>

          {/* Desktop "CREATE YOURS" Button */}
          <Link
            to="/custom-apparel"
            className="kala-create-btn"
            onClick={closeMobileMenu}
          >
            <span>CREATE YOURS</span>
            <span className="kala-sparkle-icon" aria-hidden="true">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
              </svg>
            </span>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="kala-hamburger-btn"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="kala-mobile-nav"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
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
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER & BACKDROP */}
      <div
        className={`kala-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <div
        id="kala-mobile-nav"
        className={`kala-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav aria-label="Mobile Navigation">
          <ul className="kala-mobile-links">
            {NAV_ROUTES.map((route) => (
              <li key={`mobile-${route.to}`}>
                <NavLink
                  to={route.to}
                  className={({ isActive }) =>
                    `kala-mobile-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  {({ isActive }) => (
                    <>
                      <span>{route.label}</span>
                      {isActive && <span className="kala-mobile-active-dot" aria-hidden="true" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="kala-mobile-actions">
          <Link
            to="/custom-apparel"
            className="kala-create-btn kala-mobile-create-btn"
            onClick={closeMobileMenu}
          >
            <span>CREATE YOURS</span>
            <span className="kala-sparkle-icon" aria-hidden="true">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
              </svg>
            </span>
          </Link>

          <div className="kala-mobile-icons-row">
            <Link
              to="/wishlist"
              className="kala-icon-btn"
              aria-label="Wishlist"
              title="Wishlist"
              onClick={closeMobileMenu}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
            <Link
              to="/account"
              className="kala-icon-btn"
              aria-label="Account"
              title="Account"
              onClick={closeMobileMenu}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
