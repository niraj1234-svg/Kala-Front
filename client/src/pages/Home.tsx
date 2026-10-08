import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../services/productApi'
import type { Product } from '../data/products'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import NewEventsSection from '../components/NewEventsSection'
import ProductRatingBadge from '../components/ProductRatingBadge'
import { flyToCart } from '../utils/cartAnimation'
import '../styles/Home.css'

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  // Fetch products from MongoDB API with fallback
  useEffect(() => {
    let isMounted = true
    setIsLoadingProducts(true)
    setProductError(null)

    fetchProducts()
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            // Display curated products across categories matching reference design
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

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      },
      'M',
      1
    )
    setAddedProductId(product.id)
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current))
    }, 1800)

    // Trigger premium flying-product animation to Navbar cart icon
    const card = (e.currentTarget as HTMLElement).closest('.kala-clean-product-card')
    const img = card?.querySelector<HTMLImageElement>('.kala-clean-product-img')
    flyToCart({
      sourceElement: img || null,
      imageSrc: product.image,
      productName: product.name,
    })
  }

  const handleWishlistClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(productId)
  }

  return (
    <main className="kala-home" id="main-content">
      {/* ====================================================================
          1. NEW EVENTS & FEATURED OFFERS SECTION
          ==================================================================== */}
      <NewEventsSection />

      {/* ====================================================================
          2. TWO VISUAL CARDS: CUSTOM APPAREL & BUSINESS BRANDING
          ==================================================================== */}
      <section className="kala-split-cards-section" aria-label="Explore KALA Services">
        <div className="kala-split-cards-grid">
          {/* Card 1: Custom Apparel */}
          <Link
            to="/custom-apparel"
            className="kala-split-card kala-split-card-light"
            aria-label="Custom Apparel — Design custom apparel your way"
          >
            <div className="kala-split-card-visual">
              <img
                src="/home/custom-apparel.jpg"
                alt="Custom KALA Apparel model"
                className="kala-split-card-img"
                loading="lazy"
              />
            </div>
            <div className="kala-split-card-content">
              <h2 className="kala-split-card-title">
                CUSTOM<br />
                APPAREL
              </h2>
              <p className="kala-split-card-desc">
                Design custom apparel your way.
              </p>
              <div className="kala-split-card-action">
                <span className="kala-split-card-btn">
                  <span>EXPLORE</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Business Branding */}
          <Link
            to="/business-branding"
            className="kala-split-card kala-split-card-dark"
            aria-label="Business Branding — Custom branding made for your business"
          >
            <div className="kala-split-card-visual">
              <img
                src="/home/business-branding.jpg"
                alt="Business Branding packaging and apparel merchandise"
                className="kala-split-card-img"
                loading="lazy"
              />
            </div>
            <div className="kala-split-card-content">
              <h2 className="kala-split-card-title">
                BUSINESS<br />
                BRANDING
              </h2>
              <p className="kala-split-card-desc">
                Custom branding made for your business.
              </p>
              <div className="kala-split-card-action">
                <span className="kala-split-card-btn">
                  <span>EXPLORE</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>


      {/* ====================================================================
          4. FEATURED PRODUCTS (Clean Visual Row)
          ==================================================================== */}
      <section className="kala-featured-section" aria-labelledby="featured-heading">
        <div className="kala-featured-container">
          <div className="kala-featured-header-row">
            <h2 id="featured-heading" className="kala-featured-heading">FEATURED PRODUCTS</h2>
            <div className="kala-featured-divider" aria-hidden="true" />
            <Link to="/shop" className="kala-featured-view-all">
              <span>VIEW ALL</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {isLoadingProducts && (
            <div className="kala-featured-loading" role="status">
              <p>Loading collection...</p>
            </div>
          )}

          {productError && !isLoadingProducts && featuredProducts.length === 0 && (
            <div className="kala-featured-error" role="alert">
              <p>{productError}</p>
              <Link to="/shop" className="kala-featured-error-btn">Go to Shop</Link>
            </div>
          )}

          {!isLoadingProducts && featuredProducts.length > 0 && (
            <div className="kala-featured-grid">
              {featuredProducts.map((product) => {
                const wishlisted = isInWishlist(product.id)
                const isRecentlyAdded = addedProductId === product.id

                return (
                  <article key={product.id} className="kala-clean-product-card">
                    <Link to={`/product/${product.id}`} className="kala-clean-product-link" aria-label={`View ${product.name}`}>
                      <div className="kala-clean-product-media">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="kala-clean-product-img"
                          loading="lazy"
                        />
                        <ProductRatingBadge productId={product.id} productName={product.name} />
                        <button
                          type="button"
                          className={`kala-clean-wishlist-btn ${wishlisted ? 'active' : ''}`}
                          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                          onClick={(e) => handleWishlistClick(e, product.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={wishlisted ? 'var(--kala-orange)' : 'none'}
                            stroke={wishlisted ? 'var(--kala-orange)' : 'currentColor'}
                            strokeWidth="1.9"
                            aria-hidden="true"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>

                      <div className="kala-clean-product-details">
                        <div className="kala-clean-product-text">
                          <h3 className="kala-clean-product-name">{product.name}</h3>
                          <span className="kala-clean-product-price">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>

                        <button
                          type="button"
                          className={`kala-clean-cart-btn ${isRecentlyAdded ? 'added' : ''}`}
                          aria-label={`Add ${product.name} to cart`}
                          title="Add to cart"
                          onClick={(e) => handleQuickAdd(e, product)}
                        >
                          {isRecentlyAdded ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="9" cy="21" r="1" />
                              <circle cx="20" cy="21" r="1" />
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          4. DIGITAL & TECH SERVICES (Web Dev, App Dev, WhatsApp Bot)
          ==================================================================== */}
      <section className="kala-home-services-section" aria-labelledby="home-services-heading">
        <div className="kala-home-services-container">
          <div className="kala-home-services-header">
            <div>
              <span className="kala-home-services-eyebrow">TECH &amp; DIGITAL SOLUTIONS</span>
              <h2 id="home-services-heading" className="kala-home-services-title">
                SERVICES WE PROVIDE
              </h2>
            </div>
            <Link to="/services" className="kala-home-services-view-all">
              <span>EXPLORE ALL SERVICES</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          <div className="kala-home-services-grid">
            {/* Card 1: Web Development */}
            <Link to="/services#web-dev" className="kala-home-service-card">
              <div className="kala-home-service-top">
                <div className="kala-home-service-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className="kala-home-service-tag">FULL-STACK</span>
              </div>
              <h3 className="kala-home-service-name">Web Development</h3>
              <p className="kala-home-service-desc">
                High-performance websites, Next.js / React web applications, custom e-commerce stores &amp; dashboards.
              </p>
              <div className="kala-home-service-footer">
                <span>EXPLORE &amp; INQUIRE</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

            {/* Card 2: App Development */}
            <Link to="/services#app-dev" className="kala-home-service-card">
              <div className="kala-home-service-top">
                <div className="kala-home-service-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <span className="kala-home-service-tag">IOS &amp; ANDROID</span>
              </div>
              <h3 className="kala-home-service-name">App Development</h3>
              <p className="kala-home-service-desc">
                Native and cross-platform mobile apps built with Flutter and React Native for fluid, intuitive UX.
              </p>
              <div className="kala-home-service-footer">
                <span>EXPLORE &amp; INQUIRE</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>

            {/* Card 3: WhatsApp Auto Reply Bot */}
            <Link to="/services#whatsapp-bot" className="kala-home-service-card">
              <div className="kala-home-service-top">
                <div className="kala-home-service-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <span className="kala-home-service-tag">AI AUTOMATION</span>
              </div>
              <h3 className="kala-home-service-name">WhatsApp Auto Reply Bot</h3>
              <p className="kala-home-service-desc">
                24/7 automated inquiry responses, interactive sales flows, lead qualification &amp; WhatsApp Cloud API automation.
              </p>
              <div className="kala-home-service-footer">
                <span>EXPLORE &amp; INQUIRE</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. SERVICE / TRUST SECTION (Modern 3D Trust Card Banner)
          ==================================================================== */}
      <section className="kala-trust-bar-section" aria-label="Trust & Guarantees">
        <div className="kala-trust-bar-container">
          <div className="kala-trust-card-banner">
            {/* Background Ambient Fluid Wave Curves */}
            <svg className="kala-trust-card-bg-waves" preserveAspectRatio="none" viewBox="0 0 1200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="kala-trust-wave-l1" x1="0%" y1="100%" x2="35%" y2="0%">
                  <stop offset="0%" stopColor="#FF7A30" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#FFA67A" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="kala-trust-wave-l2" x1="0%" y1="100%" x2="25%" y2="10%">
                  <stop offset="0%" stopColor="#FFA070" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="kala-trust-wave-r1" x1="100%" y1="100%" x2="65%" y2="0%">
                  <stop offset="0%" stopColor="#FF7A30" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#FFA67A" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="kala-trust-wave-r2" x1="100%" y1="100%" x2="75%" y2="10%">
                  <stop offset="0%" stopColor="#FFA070" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M-20 180 C60 150 140 100 60 40 C20 10 -20 20 -40 180 Z" fill="url(#kala-trust-wave-l1)" />
              <path d="M-10 180 C80 170 170 140 110 70 C70 20 0 40 -30 180 Z" fill="url(#kala-trust-wave-l2)" />
              <path d="M1220 180 C1140 150 1060 100 1140 40 C1180 10 1220 20 1240 180 Z" fill="url(#kala-trust-wave-r1)" />
              <path d="M1210 180 C1120 170 1030 140 1090 70 C1130 20 1200 40 1230 180 Z" fill="url(#kala-trust-wave-r2)" />
            </svg>

            {/* Left Decorative Dot Grid */}
            <div className="kala-trust-dots kala-trust-dots-left" aria-hidden="true">
              <span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span />
            </div>

            {/* Trust Items Grid */}
            <div className="kala-trust-features-row">
              {/* Feature 1: Pan-India Delivery */}
              <div className="kala-trust-feature-item">
                <div className="kala-trust-badge-wrap">
                  <div className="kala-trust-badge-tile" aria-hidden="true">
                    <svg className="kala-trust-tile-icon" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Speed motion lines */}
                      <path d="M3 9H12M5 14H10M2 19H8" stroke="#FF5E1E" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Main cargo truck body */}
                      <rect x="12" y="5" width="16" height="16" rx="2.5" fill="#FF5E1E" />
                      {/* Truck driver cab */}
                      <path d="M28 10H33.5C34.35 10 35.1 10.55 35.38 11.35L37.1 16.5C37.3 17.1 37.4 17.65 37.4 18.2V20C37.4 20.55 36.95 21 36.4 21H28V10Z" fill="#FF5E1E" />
                      {/* Cab window */}
                      <path d="M29.5 12H33L34.5 16.5H29.5V12Z" fill="#FFFFFF" fillOpacity="0.9" />
                      {/* Wheels with rim details */}
                      <circle cx="17.5" cy="22.5" r="3.5" fill="#FF5E1E" />
                      <circle cx="17.5" cy="22.5" r="1.5" fill="#FFFFFF" />
                      <circle cx="32.5" cy="22.5" r="3.5" fill="#FF5E1E" />
                      <circle cx="32.5" cy="22.5" r="1.5" fill="#FFFFFF" />
                    </svg>
                  </div>
                </div>
                <div className="kala-trust-info">
                  <h3 className="kala-trust-title">PAN–INDIA DELIVERY</h3>
                  <p className="kala-trust-desc">Fast &amp; reliable delivery to 26000+ pin codes across India.</p>
                </div>
              </div>

              {/* Vertical Divider 1 */}
              <div className="kala-trust-col-divider" aria-hidden="true" />

              {/* Feature 2: Secure Payments */}
              <div className="kala-trust-feature-item">
                <div className="kala-trust-badge-wrap has-sparkle">
                  {/* Subtle celebratory sunburst rays */}
                  <span className="kala-trust-sparkle-rays" aria-hidden="true">
                    <span className="kala-ray ray-left" />
                    <span className="kala-ray ray-center" />
                    <span className="kala-ray ray-right" />
                  </span>
                  <div className="kala-trust-badge-tile" aria-hidden="true">
                    <svg className="kala-trust-tile-icon" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 2L3.5 7.8V16.5C3.5 24.8 9.1 32.5 16 34.5C22.9 32.5 28.5 24.8 28.5 16.5V7.8L16 2Z" fill="#FF5E1E" />
                      <path d="M11 17.5L14.5 21L21.5 13.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="kala-trust-info">
                  <h3 className="kala-trust-title">SECURE PAYMENTS</h3>
                  <p className="kala-trust-desc">100% secure transactions with trusted payment partners.</p>
                </div>
              </div>

              {/* Vertical Divider 2 */}
              <div className="kala-trust-col-divider" aria-hidden="true" />

              {/* Feature 3: Premium Quality */}
              <div className="kala-trust-feature-item">
                <div className="kala-trust-badge-wrap has-sparkle">
                  {/* Subtle celebratory sunburst rays */}
                  <span className="kala-trust-sparkle-rays" aria-hidden="true">
                    <span className="kala-ray ray-left" />
                    <span className="kala-ray ray-center" />
                    <span className="kala-ray ray-right" />
                  </span>
                  <div className="kala-trust-badge-tile" aria-hidden="true">
                    <svg className="kala-trust-tile-icon" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 2.5L21.2 11.8L31.3 13.1L23.9 20L25.8 30L17 25.1L8.2 30L10.1 20L2.7 13.1L12.8 11.8L17 2.5Z" fill="#FF5E1E" stroke="#FF5E1E" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="kala-trust-info">
                  <h3 className="kala-trust-title">PREMIUM QUALITY</h3>
                  <p className="kala-trust-desc">High-quality fabric, long-lasting prints and customer-approved.</p>
                </div>
              </div>
            </div>

            {/* Right Decorative Dot Grid */}
            <div className="kala-trust-dots kala-trust-dots-right" aria-hidden="true">
              <span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span />
              <span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. CONTACT KALA SECTION (Direct Clickable Channels)
          ==================================================================== */}
      <section className="kala-contact-section" id="contact" aria-labelledby="contact-heading">
        <div className="kala-contact-container">
          <div className="kala-contact-header">
            <h2 id="contact-heading" className="kala-contact-heading">CONTACT KALA</h2>
            <div className="kala-contact-divider" aria-hidden="true" />
          </div>

          <div className="kala-contact-grid">
            {/* Option 1: WhatsApp */}
            <a
              href="https://wa.me/919406030116?text=Hi%20KALA,%20I'd%20like%20to%20inquire%20about%20your%20products%20and%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="kala-contact-card"
              aria-label="Chat with KALA on WhatsApp: 9406030116"
            >
              <div className="kala-contact-card-top">
                <span className="kala-contact-icon-wrap" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.984.582 3.832 1.586 5.402L2 22l4.754-1.57A9.972 9.972 0 0012.031 22C17.547 22 22.031 17.516 22.031 12c0-5.516-4.484-10-10-10zm0 18.281c-1.742 0-3.375-.5-4.781-1.371l-.344-.215-2.828.934.95-2.754-.234-.375a8.23 8.23 0 01-1.344-4.496c0-4.57 3.711-8.281 8.281-8.281 4.57 0 8.281 3.711 8.281 8.281 0 4.57-3.711 8.281-8.281 8.281zm4.539-6.203c-.25-.125-1.477-.73-1.707-.812-.23-.086-.398-.125-.566.125-.168.25-.656.812-.805.98-.148.168-.297.188-.547.063-.25-.125-1.055-.39-2.012-1.242-.746-.664-1.25-1.484-1.398-1.734-.148-.25-.016-.387.109-.512.113-.113.25-.297.375-.445.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.426-.566-.434l-.484-.008c-.168 0-.441.063-.672.316-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.777 2.715 4.309 3.805.602.262 1.07.418 1.437.535.605.191 1.156.164 1.59.1.484-.07 1.477-.605 1.684-1.191.207-.586.207-1.086.145-1.191-.063-.106-.23-.168-.48-.293z" />
                  </svg>
                </span>
                <span className="kala-contact-channel">WhatsApp</span>
              </div>
              <span className="kala-contact-value">9406030116</span>
              <span className="kala-contact-action">
                <span>CHAT</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </a>

            {/* Option 2: Phone */}
            <a
              href="tel:9406030116"
              className="kala-contact-card"
              aria-label="Call KALA: 9406030116"
            >
              <div className="kala-contact-card-top">
                <span className="kala-contact-icon-wrap" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="kala-contact-channel">Phone</span>
              </div>
              <span className="kala-contact-value">9406030116</span>
              <span className="kala-contact-action">
                <span>CALL</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </a>

            {/* Option 3: Instagram */}
            <a
              href="https://www.instagram.com/kala_originals/"
              target="_blank"
              rel="noopener noreferrer"
              className="kala-contact-card"
              aria-label="Follow KALA on Instagram: @kala_originals"
            >
              <div className="kala-contact-card-top">
                <span className="kala-contact-icon-wrap" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                <span className="kala-contact-channel">Instagram</span>
              </div>
              <span className="kala-contact-value">@kala_originals</span>
              <span className="kala-contact-action">
                <span>FOLLOW</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </a>

            {/* Option 4: Email */}
            <a
              href="mailto:KalaOriginals@gmail.com"
              className="kala-contact-card"
              aria-label="Email KALA: KalaOriginals@gmail.com"
            >
              <div className="kala-contact-card-top">
                <span className="kala-contact-icon-wrap" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="kala-contact-channel">Email</span>
              </div>
              <span className="kala-contact-value">KalaOriginals@gmail.com</span>
              <span className="kala-contact-action">
                <span>EMAIL</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. FLOATING WHATSAPP BUTTON (Direct Support)
          ==================================================================== */}
      <a
        href="https://wa.me/919406030116?text=Hi%20KALA,%20I'd%20like%20to%20know%20more%20about%20your%20custom%20apparel%20and%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="kala-floating-whatsapp"
        aria-label="Contact KALA on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12c0 1.984.582 3.832 1.586 5.402L2 22l4.754-1.57A9.972 9.972 0 0012.031 22C17.547 22 22.031 17.516 22.031 12c0-5.516-4.484-10-10-10zm0 18.281c-1.742 0-3.375-.5-4.781-1.371l-.344-.215-2.828.934.95-2.754-.234-.375a8.23 8.23 0 01-1.344-4.496c0-4.57 3.711-8.281 8.281-8.281 4.57 0 8.281 3.711 8.281 8.281 0 4.57-3.711 8.281-8.281 8.281zm4.539-6.203c-.25-.125-1.477-.73-1.707-.812-.23-.086-.398-.125-.566.125-.168.25-.656.812-.805.98-.148.168-.297.188-.547.063-.25-.125-1.055-.39-2.012-1.242-.746-.664-1.25-1.484-1.398-1.734-.148-.25-.016-.387.109-.512.113-.113.25-.297.375-.445.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.426-.566-.434l-.484-.008c-.168 0-.441.063-.672.316-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.777 2.715 4.309 3.805.602.262 1.07.418 1.437.535.605.191 1.156.164 1.59.1.484-.07 1.477-.605 1.684-1.191.207-.586.207-1.086.145-1.191-.063-.106-.23-.168-.48-.293z" />
        </svg>
      </a>
    </main>
  )
}

export default Home

