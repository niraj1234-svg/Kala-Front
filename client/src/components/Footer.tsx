import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import '../styles/Footer.css'

export const Footer: React.FC = () => {
  // Mobile accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: true, // Default open for mobile discovery
    custom: false,
    business: false,
    support: true,
    social: false,
  })

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  return (
    <footer className="kala-footer" role="contentinfo">
      <div className="kala-container kala-footer-container">
        {/* Brand / Logo & Mission */}
        <div className="kala-footer-brand-col">
          <Link to="/" className="kala-footer-logo" aria-label="KALA — Home">
            <img src={logoImg} alt="KALA" className="kala-footer-logo-img" />
            <span className="kala-footer-logo-text">KALA</span>
          </Link>
          <p className="kala-footer-tagline">
            Minimal luxury apparel, authentic Indian streetwear, and custom embroidery crafted for creators, teams, and brands.
          </p>
          <div className="kala-footer-badge">
            <span className="kala-footer-badge-dot" aria-hidden="true" />
            <span>EST. 2026 • CRAFTED IN INDIA</span>
          </div>
        </div>

        {/* 1. SHOP SECTION */}
        <div className={`kala-footer-nav-col ${openSections.shop ? 'is-open' : ''}`}>
          <button
            type="button"
            className="kala-footer-heading-btn"
            onClick={() => toggleSection('shop')}
            aria-expanded={openSections.shop}
          >
            <span className="kala-footer-heading">SHOP</span>
            <span className="kala-footer-toggle-icon" aria-hidden="true">
              {openSections.shop ? '−' : '+'}
            </span>
          </button>
          <ul className="kala-footer-links">
            <li>
              <Link to="/shop" className="kala-footer-link">All Products</Link>
            </li>
            <li>
              <Link to="/product/streetwear-oversized-acid-tee" className="kala-footer-link">Raw Acid-Wash Tee</Link>
            </li>
            <li>
              <Link to="/product/kala-bihari-story-premium-t-shirt" className="kala-footer-link">Bihari Story Tee</Link>
            </li>
            <li>
              <Link to="/shop" className="kala-footer-link">Oversized Hoodies</Link>
            </li>
          </ul>
        </div>

        {/* 2. CUSTOM APPAREL SECTION */}
        <div className={`kala-footer-nav-col ${openSections.custom ? 'is-open' : ''}`}>
          <button
            type="button"
            className="kala-footer-heading-btn"
            onClick={() => toggleSection('custom')}
            aria-expanded={openSections.custom}
          >
            <span className="kala-footer-heading">CUSTOM APPAREL</span>
            <span className="kala-footer-toggle-icon" aria-hidden="true">
              {openSections.custom ? '−' : '+'}
            </span>
          </button>
          <ul className="kala-footer-links">
            <li>
              <Link to="/custom-apparel" className="kala-footer-link">Create Yours</Link>
            </li>
            <li>
              <Link to="/custom-apparel" className="kala-footer-link">Custom T-Shirts</Link>
            </li>
            <li>
              <Link to="/custom-apparel" className="kala-footer-link">Embroidery & Printing</Link>
            </li>
          </ul>
        </div>

        {/* 3. BUSINESS BRANDING SECTION */}
        <div className={`kala-footer-nav-col ${openSections.business ? 'is-open' : ''}`}>
          <button
            type="button"
            className="kala-footer-heading-btn"
            onClick={() => toggleSection('business')}
            aria-expanded={openSections.business}
          >
            <span className="kala-footer-heading">BUSINESS</span>
            <span className="kala-footer-toggle-icon" aria-hidden="true">
              {openSections.business ? '−' : '+'}
            </span>
          </button>
          <ul className="kala-footer-links">
            <li>
              <Link to="/business-branding" className="kala-footer-link">B2B Branding</Link>
            </li>
            <li>
              <Link to="/business-branding" className="kala-footer-link">Request Quote</Link>
            </li>
            <li>
              <Link to="/business-branding" className="kala-footer-link">Bulk Corporate Orders</Link>
            </li>
          </ul>
        </div>

        {/* 4. SUPPORT & CONNECT SECTION */}
        <div className={`kala-footer-nav-col ${openSections.support ? 'is-open' : ''}`}>
          <button
            type="button"
            className="kala-footer-heading-btn"
            onClick={() => toggleSection('support')}
            aria-expanded={openSections.support}
          >
            <span className="kala-footer-heading">SUPPORT</span>
            <span className="kala-footer-toggle-icon" aria-hidden="true">
              {openSections.support ? '−' : '+'}
            </span>
          </button>
          <ul className="kala-footer-links">
            <li>
              <Link to="/about" className="kala-footer-link">About KALA</Link>
            </li>
            <li>
              <a href="/#contact" className="kala-footer-link">Contact Us</a>
            </li>
            <li>
              <Link to="/account" className="kala-footer-link">My Account & Orders</Link>
            </li>
            <li>
              <a href="mailto:KalaOriginals@gmail.com" className="kala-footer-link">
                KalaOriginals@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* 5. SOCIAL */}
        <div className={`kala-footer-nav-col ${openSections.social ? 'is-open' : ''}`}>
          <button
            type="button"
            className="kala-footer-heading-btn"
            onClick={() => toggleSection('social')}
            aria-expanded={openSections.social}
          >
            <span className="kala-footer-heading">SOCIAL</span>
            <span className="kala-footer-toggle-icon" aria-hidden="true">
              {openSections.social ? '−' : '+'}
            </span>
          </button>
          <ul className="kala-footer-links">
            <li>
              <a
                href="https://www.instagram.com/kala_originals/"
                target="_blank"
                rel="noopener noreferrer"
                className="kala-footer-link"
              >
                Instagram (@kala_originals)
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
