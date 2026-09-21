import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '../services/productApi'
import type { Product } from '../data/products'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
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
            // Display top 5 curated products across categories matching reference design
            setFeaturedProducts(data.slice(0, 5))
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

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
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
  }

  const handleWishlistClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(productId)
  }

  return (
    <main className="kala-home" id="main-content">
      {/* ====================================================================
          1. HERO SECTION (Minimalist, Visual, Streetwear Aesthetic)
          ==================================================================== */}
      <section className="kala-hero-section" aria-label="KALA Streetwear">
        <div className="kala-hero-bg-media">
          <img
            src="/home/hero-banner.jpg"
            alt="KALA Streetwear Model"
            className="kala-hero-bg-img"
            loading="eager"
            fetchPriority="high"
          />
          <div className="kala-hero-vignette" aria-hidden="true" />
        </div>

        <div className="kala-hero-container">
          <div className="kala-hero-text-wrap">
            <h1 className="kala-hero-title">
              WEAR YOUR<br />
              <span className="kala-hero-title-accent">STORY</span>
            </h1>
            <p className="kala-hero-subtitle">
              APPAREL &times; IDENTITY &times; YOU
            </p>
          </div>

          <div className="kala-hero-script-wrap" aria-hidden="true">
            <span className="kala-hero-script">More Than Apparel</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TWO VISUAL CARDS: CUSTOM APPAREL & BUSINESS BRANDING
          ==================================================================== */}
      <section className="kala-split-cards-section" aria-label="Explore KALA Services">
        <div className="kala-split-cards-grid">
          {/* Card 1: Custom Apparel */}
          <Link
            to="/custom-apparel"
            className="kala-split-card kala-split-card-light"
            aria-label="Custom Apparel — T-shirts, Hoodies, Jerseys made your way"
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
                T-shirts, hoodies &amp; jerseys.<br />
                Made your way.
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
            aria-label="Business Branding — Packaging, Uniforms, Merch built for your brand"
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
                Packaging, uniforms &amp; merch.<br />
                Built for your brand.
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
          3. FEATURED PRODUCTS (Clean Visual Row)
          ==================================================================== */}
      <section className="kala-featured-section" aria-labelledby="featured-heading">
        <div className="kala-featured-container">
          <div className="kala-featured-header-row">
            <h2 id="featured-heading" className="kala-featured-heading">Featured Products</h2>
            <div className="kala-featured-divider" aria-hidden="true" />
            <Link to="/shop" className="kala-featured-view-all">
              <span>View All</span>
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
          4. SERVICE / TRUST SECTION (Minimal Row)
          ==================================================================== */}
      <section className="kala-trust-bar-section" aria-label="Trust & Guarantees">
        <div className="kala-trust-bar-container">
          <div className="kala-trust-item">
            <svg className="kala-trust-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="kala-trust-text">Reliable Delivery</span>
          </div>

          <div className="kala-trust-item">
            <svg className="kala-trust-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="kala-trust-text">Secure Payments</span>
          </div>

          <div className="kala-trust-item">
            <svg className="kala-trust-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="kala-trust-text">Premium Quality</span>
          </div>

          <div className="kala-trust-item">
            <svg className="kala-trust-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="kala-trust-text">Trusted by Teams</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. CONTACT US SECTION (Mobile-First 4-Option Contact Hub)
          ==================================================================== */}
      <section className="kala-contact-section" id="contact" aria-labelledby="contact-heading">
        <div className="kala-contact-container">
          <div className="kala-contact-header">
            <h2 id="contact-heading" className="kala-contact-heading">CONTACT US</h2>
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
          6. CINEMATIC STATEMENT BANNER
          ==================================================================== */}
      <section className="kala-statement-banner-section" aria-label="Brand Philosophy">
        <div className="kala-statement-bg-media">
          <img
            src="/home/statement-banner.jpg"
            alt="KALA Apparel Silhouette"
            className="kala-statement-bg-img"
            loading="lazy"
          />
          <div className="kala-statement-overlay" aria-hidden="true" />
        </div>

        <div className="kala-statement-container">
          <div className="kala-statement-content">
            <h2 className="kala-statement-title">
              MORE<br />
              THAN<br />
              APPAREL
            </h2>
            <div className="kala-statement-underline" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. BRAND STATEMENT SUB-BAR
          ==================================================================== */}
      <section className="kala-tagline-bar-section" aria-label="Brand Philosophy Tagline">
        <p className="kala-tagline-bar-text">
          APPAREL &times; TEAMS &times; BRANDS &times; YOU
        </p>
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

