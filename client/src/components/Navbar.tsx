import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../services/productApi'
import type { Product } from '../data/products'
import logoImg from '../assets/logo.png'
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

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fetch catalog on first search open
  useEffect(() => {
    if (isSearchOpen && catalogProducts.length === 0) {
      setIsLoadingProducts(true)
      fetchProducts()
        .then((items) => {
          if (items && items.length > 0) {
            setCatalogProducts(items)
          }
        })
        .catch((err) => {
          console.warn('[Navbar] Failed to load products for search:', err)
        })
        .finally(() => {
          setIsLoadingProducts(false)
        })
    }
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isSearchOpen, catalogProducts.length])

  // Filter products by case-insensitive query on name, category, description
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return catalogProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(q)
      const catMatch = product.category.toLowerCase().includes(q)
      const descMatch = product.description.toLowerCase().includes(q)
      return nameMatch || catMatch || descMatch
    })
  }, [searchQuery, catalogProducts])

  // Close search or mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false)
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, isMobileMenuOpen])

  // Click outside to close search overlay
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen])

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/shop?search=${encodeURIComponent(q)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSelectProduct = (productId: string) => {
    navigate(`/product/${productId}`)
    setIsSearchOpen(false)
    setSearchQuery('')
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
          <img src={logoImg} alt="KALA" className="kala-logo-img" />
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
              className={`kala-icon-btn ${isSearchOpen ? 'active' : ''}`}
              aria-label={isSearchOpen ? 'Close search' : 'Search collection'}
              aria-expanded={isSearchOpen}
              title="Search"
              onClick={() => setIsSearchOpen((prev) => !prev)}
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
              className="kala-icon-btn"
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
              className="kala-icon-btn"
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

      {/* 5. SEARCH OVERLAY & RESULTS PANEL */}
      {isSearchOpen && (
        <div
          className="kala-search-backdrop"
          aria-hidden="true"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
      <div
        ref={searchContainerRef}
        className={`kala-search-panel ${isSearchOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Search KALA products"
      >
        <div className="kala-container kala-search-container">
          <form className="kala-search-form" onSubmit={handleSearchSubmit} role="search">
            <span className="kala-search-input-icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="search"
              className="kala-search-input"
              placeholder="Search products, styles, categories (e.g. hoodie, gaming, gym, oversized)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="kala-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="kala-search-close-btn"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              ESC ✕
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchQuery.trim() && (
            <div className="kala-search-results-box" role="region" aria-label="Search results">
              {isLoadingProducts && (
                <div className="kala-search-status">Loading catalog...</div>
              )}

              {!isLoadingProducts && searchResults.length > 0 && (
                <>
                  <div className="kala-search-results-meta">
                    <span>
                      Found {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                    </span>
                    <button
                      type="button"
                      className="kala-search-view-all-link"
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      View all in Shop →
                    </button>
                  </div>
                  <ul className="kala-search-results-list" role="listbox">
                    {searchResults.slice(0, 6).map((product) => (
                      <li key={product.id} role="option" aria-selected="false">
                        <button
                          type="button"
                          className="kala-search-result-item"
                          onClick={() => handleSelectProduct(product.id)}
                        >
                          <div className="kala-search-thumb-wrap">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="kala-search-thumb"
                            />
                          </div>
                          <div className="kala-search-item-info">
                            <span className="kala-search-item-cat">{product.category}</span>
                            <span className="kala-search-item-name">{product.name}</span>
                          </div>
                          <div className="kala-search-item-meta">
                            <span className="kala-search-item-price">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`kala-search-item-status ${
                                product.available ? 'in-stock' : 'sold-out'
                              }`}
                            >
                              {product.available ? 'In Stock' : 'Sold Out'}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {!isLoadingProducts && searchResults.length === 0 && (
                <div className="kala-search-empty">
                  <p className="kala-search-empty-text">
                    No products found matching "<strong>{searchQuery}</strong>".
                  </p>
                  <p className="kala-search-empty-hint">
                    Try searching for <em>hoodie</em>, <em>gaming</em>, <em>gym</em>, or <em>oversized</em>.
                  </p>
                  <button
                    type="button"
                    className="kala-btn kala-btn-secondary kala-search-browse-btn"
                    onClick={() => {
                      navigate('/shop')
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                  >
                    Browse All Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
