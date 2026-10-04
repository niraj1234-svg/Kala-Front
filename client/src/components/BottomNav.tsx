import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import '../styles/BottomNav.css'

export const BottomNav: React.FC = () => {
  const location = useLocation()
  const pathname = location.pathname
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  // Determine active route state
  const isHomeActive = pathname === '/'
  const isShopActive =
    pathname === '/shop' ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/products/') ||
    pathname === '/bundle'
  const isCreateActive =
    pathname === '/custom-apparel' ||
    pathname === '/customize' ||
    pathname === '/bulk-order'
  const isWishlistActive = pathname === '/wishlist'
  const isCartActive = pathname === '/cart'

  return (
    <nav className="kala-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="kala-bottom-nav-container">
        {/* 1. HOME */}
        <Link
          to="/"
          className={`kala-bottom-nav-item ${isHomeActive ? 'active' : ''}`}
          aria-label="Home"
        >
          <span className="kala-bottom-nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          <span className="kala-bottom-nav-label">HOME</span>
        </Link>

        {/* 2. SHOP */}
        <Link
          to="/shop"
          className={`kala-bottom-nav-item ${isShopActive ? 'active' : ''}`}
          aria-label="Shop"
        >
          <span className="kala-bottom-nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <span className="kala-bottom-nav-label">SHOP</span>
        </Link>

        {/* 3. CREATE (ELEVATED CENTER CTA) */}
        <Link
          to="/custom-apparel"
          className={`kala-bottom-nav-item kala-bottom-nav-create ${isCreateActive ? 'active' : ''}`}
          aria-label="Create Custom Apparel"
        >
          <div className="kala-bottom-create-btn" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="kala-bottom-nav-label kala-bottom-create-label">CREATE</span>
        </Link>

        {/* 4. WISHLIST */}
        <Link
          to="/wishlist"
          className={`kala-bottom-nav-item ${isWishlistActive ? 'active' : ''}`}
          aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
        >
          <span className="kala-bottom-nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={isWishlistActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="kala-bottom-nav-badge" aria-hidden="true">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </span>
          <span className="kala-bottom-nav-label">WISHLIST</span>
        </Link>

        {/* 5. CART */}
        <Link
          to="/cart"
          className={`kala-bottom-nav-item ${isCartActive ? 'active' : ''}`}
          aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
        >
          <span className="kala-bottom-nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="kala-bottom-nav-badge" aria-hidden="true">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          <span className="kala-bottom-nav-label">CART</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNav
