import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../services/productApi'
import { getProductImage } from '../data/products'
import type { Product } from '../data/products'
import ProductCard from '../components/ProductCard'
import '../styles/Home.css'

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true)
  const [productError, setProductError] = useState<string | null>(null)

  // Fetch products from the MongoDB-backed API with fallback
  useEffect(() => {
    let isMounted = true
    setIsLoadingProducts(true)
    setProductError(null)

    fetchProducts()
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            // Display 6 curated products across categories
            setFeaturedProducts(data.slice(0, 6))
          } else {
            setFeaturedProducts([])
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[Home] Error fetching products:', err)
          setProductError('Unable to load featured products.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProducts(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="kala-home" id="main-content">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="kala-hero-section" aria-label="Introduction">
        <div className="kala-container kala-hero-grid">
          <div className="kala-hero-content">
            <p className="kala-hero-eyebrow">KALA APPAREL</p>
            <h1 className="kala-hero-title">
              WEAR YOUR
              <span className="kala-hero-title-highlight">IDENTITY.</span>
            </h1>
            <p className="kala-hero-subtitle">
              Custom apparel and brand merchandise made for teams, businesses, colleges, events, and individuals.
            </p>
            <div className="kala-hero-actions">
              <Link to="/shop" className="kala-btn kala-hero-btn kala-hero-btn-primary">
                SHOP APPAREL
              </Link>
              <Link to="/custom-apparel" className="kala-btn kala-hero-btn kala-hero-btn-secondary">
                CREATE YOURS
              </Link>
            </div>
            <div className="kala-hero-meta">
              <span className="kala-hero-meta-item">
                <span className="kala-hero-meta-dot" aria-hidden="true" />
                Custom Apparel & Merch
              </span>
              <span className="kala-hero-meta-item">
                <span className="kala-hero-meta-dot" aria-hidden="true" />
                Pan-India Delivery
              </span>
              <span className="kala-hero-meta-item">
                <span className="kala-hero-meta-dot" aria-hidden="true" />
                Quality Checked
              </span>
            </div>
          </div>

          <div className="kala-hero-visual" aria-hidden="true">
            <div className="kala-hero-card-stack">
              <div className="kala-hero-main-card">
                <div className="kala-hero-image-wrap">
                  <img
                    src={getProductImage('Streetwear 01.png')}
                    alt="KALA Raw Acid-Wash Oversized Streetwear Tee"
                    className="kala-hero-image"
                  />
                  <span className="kala-hero-card-badge">2026 COLLECTION</span>
                </div>
                <div className="kala-hero-card-footer">
                  <div>
                    <h3 className="kala-hero-card-name">Raw Acid-Wash Tee</h3>
                    <p className="kala-hero-card-sub">Streetwear • 280 GSM Cotton</p>
                  </div>
                  <span className="kala-hero-card-pill">IN STOCK</span>
                </div>
              </div>
              <div className="kala-hero-floating-badge">
                <span className="kala-floating-badge-num">500+</span>
                <span className="kala-floating-badge-label">Orders Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TWO MAIN KALA PATHS
          ==================================================================== */}
      <section className="kala-paths-section" aria-labelledby="paths-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <p className="kala-label kala-section-badge">WHAT WE DO</p>
            <h2 id="paths-heading" className="kala-section-title">CHOOSE YOUR KALA PATH</h2>
            <p className="kala-section-subtitle">
              Whether you need customized apparel for personal expression or end-to-end brand merchandise for your organization.
            </p>
          </div>

          <div className="kala-paths-grid">
            {/* Custom Apparel Card */}
            <article className="kala-path-card">
              <div>
                <p className="kala-path-eyebrow">PERSONAL & TEAM APPAREL</p>
                <h3 className="kala-path-title">CUSTOM APPAREL</h3>
                <p className="kala-path-tagline">Your idea. Your design. Your apparel.</p>
                <p className="kala-path-desc">
                  Create custom T-shirts, oversized T-shirts, hoodies, jerseys, tracksuits and other apparel tailored to your unique specifications.
                </p>
                <ul className="kala-path-tags" aria-label="Available custom apparel types">
                  <li>T-Shirts</li>
                  <li>Oversized Tees</li>
                  <li>Hoodies</li>
                  <li>Jerseys</li>
                  <li>Tracksuits</li>
                </ul>
              </div>
              <Link to="/custom-apparel" className="kala-btn kala-btn-primary kala-path-btn">
                EXPLORE CUSTOM APPAREL
              </Link>
            </article>

            {/* Business Branding Card */}
            <article className="kala-path-card kala-path-card-accent">
              <div>
                <p className="kala-path-eyebrow">ORGANIZATIONS & MERCH</p>
                <h3 className="kala-path-title">BUSINESS BRANDING</h3>
                <p className="kala-path-tagline">Build a brand people remember.</p>
                <p className="kala-path-desc">
                  KALA provides branded merchandise and printed materials such as packaging, thank-you cards, carry bags, stickers, bottle labels, boxes, uniforms, caps, posters and other brand merchandise.
                </p>
                <ul className="kala-path-tags" aria-label="Available business branding items">
                  <li>Uniforms & Caps</li>
                  <li>Packaging & Boxes</li>
                  <li>Stickers & Labels</li>
                  <li>Carry Bags & Cards</li>
                  <li>Posters & Merch</li>
                </ul>
              </div>
              <Link to="/business-branding" className="kala-btn kala-path-btn">
                EXPLORE BUSINESS BRANDING
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. SHOP / FEATURED PRODUCTS
          ==================================================================== */}
      <section className="kala-featured-section" aria-labelledby="featured-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <p className="kala-label kala-section-badge">CATALOG</p>
            <h2 id="featured-heading" className="kala-section-title">FEATURED APPAREL</h2>
            <p className="kala-section-subtitle">
              Explore our core catalog pieces built for streetwear aesthetics, tactical gaming sessions, and gym training.
            </p>
          </div>

          {/* Loading State */}
          {isLoadingProducts && (
            <div className="kala-featured-loading" role="status">
              <p>Loading featured apparel catalog...</p>
            </div>
          )}

          {/* Error State */}
          {productError && !isLoadingProducts && featuredProducts.length === 0 && (
            <div className="kala-featured-error" role="alert">
              <p>{productError}</p>
              <Link to="/shop" className="kala-btn kala-btn-secondary">
                Go to Shop
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!isLoadingProducts && featuredProducts.length > 0 && (
            <div className="kala-featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="kala-featured-footer">
            <Link to="/shop" className="kala-btn kala-btn-secondary kala-featured-cta">
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CATEGORY SECTION
          ==================================================================== */}
      <section className="kala-categories-section" aria-labelledby="categories-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <p className="kala-label kala-section-badge">COLLECTIONS</p>
            <h2 id="categories-heading" className="kala-section-title">SHOP BY CATEGORY</h2>
            <p className="kala-section-subtitle">
              Browse dedicated apparel lines crafted specifically for your subculture and lifestyle.
            </p>
          </div>

          <div className="kala-categories-grid">
            {/* Category: STREETWEAR */}
            <Link
              to="/shop?category=Streetwear"
              className="kala-category-card"
              aria-label="Browse STREETWEAR apparel collection"
            >
              <div className="kala-category-image-wrap">
                <img
                  src={getProductImage('Streetwear 01.png')}
                  alt="KALA Streetwear collection"
                  className="kala-category-image"
                  loading="lazy"
                />
              </div>
              <div className="kala-category-content">
                <div>
                  <h3 className="kala-category-name">STREETWEAR</h3>
                  <p className="kala-category-desc">
                    Acid-washed oversized tees, boxy heavy French Terry hoodies, and relaxed cargo trousers.
                  </p>
                </div>
                <span className="kala-category-link-text">
                  EXPLORE STREETWEAR
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Category: Gaming */}
            <Link
              to="/shop?category=Gaming"
              className="kala-category-card"
              aria-label="Browse Gaming apparel collection"
            >
              <div className="kala-category-image-wrap">
                <img
                  src={getProductImage('gaming 01.png')}
                  alt="KALA Gaming collection"
                  className="kala-category-image"
                  loading="lazy"
                />
              </div>
              <div className="kala-category-content">
                <div>
                  <h3 className="kala-category-name">Gaming</h3>
                  <p className="kala-category-desc">
                    Moisture-wicking esports tournament jerseys, cyber-aesthetic tees, and tactical warmup jackets.
                  </p>
                </div>
                <span className="kala-category-link-text">
                  EXPLORE GAMING
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Category: GYMWEAR */}
            <Link
              to="/shop?category=Gymwear"
              className="kala-category-card"
              aria-label="Browse GYMWEAR apparel collection"
            >
              <div className="kala-category-image-wrap">
                <img
                  src={getProductImage('Gymwear-05.png')}
                  alt="KALA Gymwear collection"
                  className="kala-category-image"
                  loading="lazy"
                />
              </div>
              <div className="kala-category-content">
                <div>
                  <h3 className="kala-category-name">GYMWEAR</h3>
                  <p className="kala-category-desc">
                    Heavyweight pump covers, 4-way stretch compression gear, dynamic training shorts, and joggers.
                  </p>
                </div>
                <span className="kala-category-link-text">
                  EXPLORE GYMWEAR
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. WHY KALA
          ==================================================================== */}
      <section className="kala-why-section" aria-labelledby="why-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <p className="kala-label kala-section-badge">POSITIONING</p>
            <h2 id="why-heading" className="kala-section-title">MADE FOR YOUR WORLD</h2>
            <p className="kala-section-subtitle">
              Engineered for individuals, collegiate squads, competitive teams, and expanding businesses across India.
            </p>
          </div>

          <div className="kala-why-grid">
            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">Custom Apparel</h3>
              <p className="kala-why-card-desc">
                Custom garments crafted to your cut, fabric, and print preferences with no complex barriers.
              </p>
            </div>

            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">Business & Brand Merchandise</h3>
              <p className="kala-why-card-desc">
                Complete corporate swag, customer packaging, carry bags, and marketing stationery.
              </p>
            </div>

            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">College & Event Apparel</h3>
              <p className="kala-why-card-desc">
                Fest tees, departmental hoodies, and batch commemorative merchandise delivered on schedule.
              </p>
            </div>

            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">Sports Team Apparel</h3>
              <p className="kala-why-card-desc">
                Athletic kits and tournament jerseys engineered for mobility, breathability, and team pride.
              </p>
            </div>

            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">All-India Delivery</h3>
              <p className="kala-why-card-desc">
                Direct shipping to doorsteps and offices across major metros, cities, and regional zones.
              </p>
            </div>

            <div className="kala-why-card">
              <div className="kala-why-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="kala-why-card-title">Quality Checked</h3>
              <p className="kala-why-card-desc">
                Every batch is thoroughly inspected before dispatch so your order arrives ready for wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. HOW KALA WORKS
          ==================================================================== */}
      <section className="kala-steps-section" aria-labelledby="how-heading">
        <div className="kala-container">
          <div className="kala-section-header">
            <p className="kala-label kala-section-badge">PROCESS</p>
            <h2 id="how-heading" className="kala-section-title">HOW KALA WORKS</h2>
            <p className="kala-section-subtitle">
              From your initial concept to finished products delivered to your location.
            </p>
          </div>

          <div className="kala-steps-grid">
            <div className="kala-step-card">
              <span className="kala-step-num">01</span>
              <h3 className="kala-step-title">YOU SHARE YOUR IDEA</h3>
              <p className="kala-step-desc">
                Tell us what you want to create.
              </p>
            </div>

            <div className="kala-step-card">
              <span className="kala-step-num">02</span>
              <h3 className="kala-step-title">WE CREATE &amp; PRINT</h3>
              <p className="kala-step-desc">
                KALA works with printing/manufacturing partners to produce your order.
              </p>
            </div>

            <div className="kala-step-card">
              <span className="kala-step-num">03</span>
              <h3 className="kala-step-title">QUALITY CHECK</h3>
              <p className="kala-step-desc">
                KALA checks the finished order before dispatch.
              </p>
            </div>

            <div className="kala-step-card">
              <span className="kala-step-num">04</span>
              <h3 className="kala-step-title">DELIVERED TO YOU</h3>
              <p className="kala-step-desc">
                Your finished products are delivered across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. KALA NUMBERS / SOCIAL PROOF
          ==================================================================== */}
      <section className="kala-numbers-section" aria-label="KALA Milestones">
        <div className="kala-container">
          <div className="kala-numbers-grid">
            <div className="kala-number-item">
              <span className="kala-number-val">500+</span>
              <span className="kala-number-label">ORDERS</span>
            </div>

            <div className="kala-number-item">
              <span className="kala-number-val">500+</span>
              <span className="kala-number-label">CUSTOMERS</span>
            </div>

            <div className="kala-number-item">
              <span className="kala-number-val">ALL INDIA</span>
              <span className="kala-number-label">DELIVERY</span>
            </div>

            <div className="kala-number-item">
              <span className="kala-number-val">JAN 2026</span>
              <span className="kala-number-label">STARTED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. FINAL CTA
          ==================================================================== */}
      <section className="kala-final-cta-section" aria-labelledby="cta-heading">
        <div className="kala-container">
          <div className="kala-final-cta-inner">
            <p className="kala-label kala-final-cta-badge">GET STARTED</p>
            <h2 id="cta-heading" className="kala-final-cta-title">
              READY TO MAKE SOMETHING YOURS?
            </h2>
            <p className="kala-final-cta-desc">
              From one custom piece to apparel for your entire team, event, college or business — KALA helps bring your idea to life.
            </p>
            <div className="kala-final-cta-actions">
              <Link to="/shop" className="kala-btn kala-hero-btn-primary kala-final-btn">
                SHOP APPAREL
              </Link>
              <Link to="/custom-apparel" className="kala-btn kala-hero-btn-secondary kala-final-btn">
                CREATE YOURS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
