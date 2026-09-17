import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import '../styles/Footer.css'

export const Footer: React.FC = () => {
  return (
    <footer className="kala-footer" role="contentinfo">
      <div className="kala-container kala-footer-container">
        {/* Brand Column */}
        <div className="kala-footer-brand-col">
          <Link to="/" className="kala-footer-logo" aria-label="KALA — Home">
            <img src={logoImg} alt="KALA" className="kala-footer-logo-img" />
            <span className="kala-footer-logo-text">KALA</span>
          </Link>
          <p className="kala-footer-tagline">
            Wear your identity. Custom apparel and brand merchandise engineered for teams, businesses, colleges, events, and individuals.
          </p>
          <div className="kala-footer-badge">
            <span className="kala-footer-badge-dot" aria-hidden="true" />
            <span>Pan-India Delivery</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="kala-footer-nav-col">
          <h4 className="kala-footer-heading">EXPLORE</h4>
          <ul className="kala-footer-links">
            <li>
              <Link to="/shop" className="kala-footer-link">SHOP</Link>
            </li>
            <li>
              <Link to="/custom-apparel" className="kala-footer-link">CUSTOM APPAREL</Link>
            </li>
            <li>
              <Link to="/business-branding" className="kala-footer-link">BUSINESS BRANDING</Link>
            </li>
            <li>
              <Link to="/about" className="kala-footer-link">ABOUT</Link>
            </li>
          </ul>
        </div>

        {/* Account Column */}
        <div className="kala-footer-nav-col">
          <h4 className="kala-footer-heading">ACCOUNT</h4>
          <ul className="kala-footer-links">
            <li>
              <Link to="/account" className="kala-footer-link">ACCOUNT</Link>
            </li>
            <li>
              <Link to="/wishlist" className="kala-footer-link">WISHLIST</Link>
            </li>
            <li>
              <Link to="/cart" className="kala-footer-link">CART</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="kala-footer-bottom">
        <div className="kala-container kala-footer-bottom-inner">
          <p className="kala-footer-copy">
            © 2026 KALA. All rights reserved.
          </p>
          <p className="kala-footer-location">
            Crafted for India. Shipping Nationwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
