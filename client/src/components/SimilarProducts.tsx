import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { fetchProducts } from '../services/productApi'
import { useWishlist } from '../context/WishlistContext'
import { getProductRatingInfo } from '../utils/productRating'
import '../styles/SimilarProducts.css'

interface SimilarProductsProps {
  currentProduct: Product
}

/**
 * Categorizes product into core apparel archetypes for semantic similarity.
 */
function getProductType(product: Product): string {
  const text = `${product.id} ${product.name} ${product.description}`.toLowerCase()
  if (text.includes('hoodie') || text.includes('sweatshirt')) return 'hoodie'
  if (text.includes('t-shirt') || text.includes('tee') || text.includes('jersey')) return 'tshirt'
  if (text.includes('short') || text.includes('jogger') || text.includes('pant') || text.includes('cargo')) return 'bottoms'
  if (text.includes('tank') || text.includes('vest') || text.includes('stringer') || text.includes('pump cover')) return 'tank'
  return 'other'
}

/**
 * Calculates a relevance score for candidate products relative to current product.
 * - Same category: +100
 * - Same apparel archetype: +60
 * - Shared style/aesthetic keywords: +15 each
 * - Available in stock: +10
 */
function calculateRelevanceScore(candidate: Product, current: Product): number {
  let score = 0
  const candidateType = getProductType(candidate)
  const currentType = getProductType(current)

  // 1. Category alignment (Highest priority)
  if (candidate.category === current.category) {
    score += 100
  }

  // 2. Apparel archetype alignment (T-Shirt to T-Shirt, Hoodie to Hoodie, etc.)
  if (candidateType === currentType && candidateType !== 'other') {
    score += 60
  }

  // 3. Shared aesthetic & material keywords
  const currentTokens = (current.name + ' ' + current.description).toLowerCase().split(/[\s,.-]+/)
  const candidateTokenSet = new Set((candidate.name + ' ' + candidate.description).toLowerCase().split(/[\s,.-]+/))
  const semanticKeywords = [
    'oversized',
    'heavyweight',
    'tactical',
    'cotton',
    'vintage',
    'acid',
    'compression',
    'dryfit',
    'stretch',
    'premium',
    'bihar',
    'cyber',
    'stealth',
    'performance',
    'urban',
  ]

  for (const kw of semanticKeywords) {
    if (currentTokens.includes(kw) && candidateTokenSet.has(kw)) {
      score += 15
    }
  }

  // 4. In-stock availability preference
  if (candidate.available) {
    score += 10
  }

  return score
}

/**
 * Computes a realistic retail MRP and discount percentage for e-commerce presentation.
 */
function calculatePricingMetrics(price: number): { mrp: number; discountPercent: number } {
  let mrp: number
  if (price <= 350) {
    mrp = 499
  } else if (price <= 450) {
    mrp = 699
  } else if (price <= 600) {
    mrp = 899
  } else if (price <= 750) {
    mrp = 1099
  } else if (price <= 900) {
    mrp = 1299
  } else {
    mrp = Math.round((price * 1.42) / 50) * 50 - 1
  }

  const discountPercent = Math.max(10, Math.round(((mrp - price) / mrp) * 100))
  return { mrp, discountPercent }
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct }) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false)
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true)

  const carouselTrackRef = useRef<HTMLDivElement>(null)
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Load and filter related products from the real API catalogue
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetchProducts()
      .then((allProducts) => {
        if (!isMounted) return

        // 1. Exclude the currently viewed product
        const eligible = allProducts.filter((p) => p.id !== currentProduct.id)

        // 2. Score and sort candidates based on multi-factor relevance
        const ranked = eligible
          .map((p) => ({
            product: p,
            score: calculateRelevanceScore(p, currentProduct),
          }))
          .sort((a, b) => b.score - a.score)
          .map((item) => item.product)

        // 3. Limit to 8–12 recommendations (ensuring robust carousel fill)
        const selected = ranked.slice(0, 10)
        setSimilarProducts(selected)
      })
      .catch((err) => {
        console.warn('[SimilarProducts] Failed to fetch catalog for recommendations:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentProduct.id, currentProduct.category, currentProduct.name])

  // Track scroll boundaries for updating button active/disabled states
  const checkScrollBoundaries = useCallback(() => {
    const el = carouselTrackRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    // Small threshold (4px) to account for subpixel rendering
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScrollBoundaries()
    const el = carouselTrackRef.current
    if (!el) return

    // Reset scroll position to start when product changes
    el.scrollLeft = 0
    setCanScrollLeft(false)
    setCanScrollRight(el.scrollWidth > el.clientWidth)

    window.addEventListener('resize', checkScrollBoundaries)
    return () => window.removeEventListener('resize', checkScrollBoundaries)
  }, [similarProducts, checkScrollBoundaries])

  // Scroll carousel left or right
  const handleScroll = (direction: 'left' | 'right') => {
    const el = carouselTrackRef.current
    if (!el) return

    const scrollDistance = el.clientWidth * 0.75
    el.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    })
  }

  // If there are no similar products or loading with empty list, render nothing to avoid layout shifts
  if (!isLoading && similarProducts.length === 0) {
    return null
  }

  return (
    <section className="kala-similar-section" aria-labelledby="kala-similar-heading">
      {/* Section Header */}
      <div className="kala-similar-header">
        <div className="kala-similar-title-box">
          <span className="kala-similar-badge">EXPLORE MORE</span>
          <h2 id="kala-similar-heading" className="kala-similar-title">
            SIMILAR PRODUCTS
          </h2>
          <p className="kala-similar-subtitle">
            Customers viewing this item also explored these signature pieces
          </p>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="kala-similar-nav-arrows" aria-label="Carousel navigation">
          <button
            type="button"
            className="kala-similar-arrow-btn prev"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left to see previous products"
            title="Previous products"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="kala-similar-arrow-btn next"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right to see more products"
            title="Next products"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel Track Container with Centered Edge Navigation Overlays */}
      <div className="kala-similar-carousel-viewport">
        {/* Floating Side Arrow: Left (Visible on desktop) */}
        <button
          type="button"
          className={`kala-similar-edge-nav prev ${!canScrollLeft ? 'hidden' : ''}`}
          onClick={() => handleScroll('left')}
          aria-label="Previous products"
          tabIndex={canScrollLeft ? 0 : -1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Horizontal Scroll Track */}
        <div
          className="kala-similar-track"
          ref={carouselTrackRef}
          onScroll={checkScrollBoundaries}
          role="region"
          aria-label="Similar products list"
          tabIndex={0}
        >
          {similarProducts.map((product) => {
            const isWishlisted = isInWishlist(product.id)
            const ratingMetric = getProductRatingInfo(product.id, product.name)
            const { mrp, discountPercent } = calculatePricingMetrics(product.price)

            return (
              <article key={product.id} className="kala-similar-card">
                <Link to={`/product/${product.id}`} className="kala-similar-card-link">
                  {/* Product Image Frame */}
                  <div className="kala-similar-img-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="kala-similar-img"
                      loading="lazy"
                    />

                    {/* Discount Tag */}
                    <span className="kala-similar-discount-badge">
                      {discountPercent}% OFF
                    </span>

                    {/* Wishlist Heart Action Button */}
                    <button
                      type="button"
                      className={`kala-similar-wish-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(product.id)
                      }}
                      aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                      title={isWishlisted ? 'In wishlist' : 'Add to wishlist'}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? '#D94700' : 'none'}
                        stroke={isWishlisted ? '#D94700' : 'currentColor'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Card Information */}
                  <div className="kala-similar-body">
                    {/* Category Label */}
                    <span className="kala-similar-cat-label">{product.category}</span>

                    {/* Product Name */}
                    <h3 className="kala-similar-product-name" title={product.name}>
                      {product.name}
                    </h3>

                    {/* Rating with Star Badge */}
                    <div className="kala-similar-rating-row">
                      <div className="kala-similar-rating-pill" aria-label={`Rated ${ratingMetric.rating} stars`}>
                        <span className="kala-similar-rating-num">{ratingMetric.rating}</span>
                        <svg className="kala-similar-star-icon" width="10" height="10" viewBox="0 0 24 24" fill="#0d9488" stroke="#0d9488" strokeWidth="1.2" aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <span className="kala-similar-rating-count">({ratingMetric.purchaseCount})</span>
                    </div>

                    {/* Pricing Information (Current Price + MRP Strikethrough) */}
                    <div className="kala-similar-price-row">
                      <span className="kala-similar-current-price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="kala-similar-mrp-price">
                        ₹{mrp.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Availability / Shipping Info */}
                    <div className="kala-similar-status-row">
                      {product.available ? (
                        <span className="kala-similar-stock-badge in-stock">
                          <span className="kala-stock-dot-mini" aria-hidden="true">●</span>
                          <span>Free Delivery</span>
                        </span>
                      ) : (
                        <span className="kala-similar-stock-badge out-of-stock">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>

        {/* Floating Side Arrow: Right (Visible on desktop) */}
        <button
          type="button"
          className={`kala-similar-edge-nav next ${!canScrollRight ? 'hidden' : ''}`}
          onClick={() => handleScroll('right')}
          aria-label="Next products"
          tabIndex={canScrollRight ? 0 : -1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default SimilarProducts
