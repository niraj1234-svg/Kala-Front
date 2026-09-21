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
            Wear your story. Custom apparel &amp; brand merchandise crafted for India.
          </p>
          <div className="kala-footer-badge">
            <span className="kala-footer-badge-dot" aria-hidden="true" />
            <span>Pan-India Delivery</span>
          </div>
        </div>

        {/* Essential Navigation Column */}
        <div className="kala-footer-nav-col">
          <h4 className="kala-footer-heading">NAVIGATION</h4>
          <ul className="kala-footer-links">
            <li>
              <Link to="/shop" className="kala-footer-link">Shop</Link>
            </li>
            <li>
              <Link to="/custom-apparel" className="kala-footer-link">Custom Apparel</Link>
            </li>
            <li>
              <Link to="/business-branding" className="kala-footer-link">Business Branding</Link>
            </li>
            <li>
              <Link to="/about" className="kala-footer-link">About</Link>
            </li>
            <li>
              <a href="/#contact" className="kala-footer-link">Contact</a>
            </li>
          </ul>
        </div>

        {/* Connect / Social Column */}
        <div className="kala-footer-nav-col">
          <h4 className="kala-footer-heading">CONNECT</h4>
          <ul className="kala-footer-links">
            <li>
              <a
                href="https://www.instagram.com/kala_originals/"
                target="_blank"
                rel="noopener noreferrer"
                className="kala-footer-link"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="mailto:KalaOriginals@gmail.com"
                className="kala-footer-link"
              >
                Email
              </a>
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
