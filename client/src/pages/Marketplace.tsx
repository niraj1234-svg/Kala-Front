import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchMarketplaceProducts,
  fetchMarketplaceVendors,
} from '../services/marketplaceApi'
import { getProductImage } from '../data/products'
import type { MarketplaceProduct, VendorShop } from '../types/marketplace'
import '../styles/Marketplace.css'

const CATEGORIES = [
  'All',
  'Streetwear',
  'Clothing Brand',
  'Custom Clothing',
  'Corporate Merchandise',
  'Printing Services',
  'Gymwear',
  'Gaming',
  'Accessories',
  'Manufacturer',
]

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [shops, setShops] = useState<VendorShop[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMarketplaceData()
  }, [selectedCategory, sortBy])

  const loadMarketplaceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, shopRes] = await Promise.all([
        fetchMarketplaceProducts({
          q: searchQuery || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort: sortBy,
        }),
        fetchMarketplaceVendors(),
      ])

      setProducts(prodRes.products || [])
      setShops(shopRes.shops || [])
    } catch (err: any) {
      console.error('Failed to load marketplace:', err)
      setError(err.message || 'Unable to connect to KALA Marketplace.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadMarketplaceData()
  }

  const scrollToProducts = () => {
    const el = document.getElementById('marketplace-products-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="kala-marketplace-page">
      {/* 1. HERO SECTION */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-badge">KALA Verified Multi-Vendor Commerce</div>
        <h1 className="marketplace-hero-title">
          Discover. Connect. <span>Grow.</span>
        </h1>
        <p className="marketplace-hero-desc">
          Explore independent businesses, discover unique apparel and merchandise, and source
          directly from trusted vendors across India through KALA Marketplace.
        </p>
        <div className="marketplace-hero-actions">
          <button
            type="button"
            className="marketplace-btn-primary"
            onClick={scrollToProducts}
          >
            Explore Products
          </button>
          <Link to="/vendor/register" className="marketplace-btn-secondary">
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* 2. SEARCH & CONTROLS CARD */}
      <div className="marketplace-controls-container">
        <div className="marketplace-controls-card">
          <form className="marketplace-search-row" onSubmit={handleSearchSubmit}>
            <div className="marketplace-search-input-wrap">
              <svg
                className="marketplace-search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="marketplace-search-input"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="marketplace-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Latest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </form>

          {/* Categories Horizontal Scroll */}
          <div className="marketplace-categories-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`marketplace-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FEATURED VENDOR SHOPS (Real Approved Vendors) */}
      {shops.length > 0 && (
        <section className="marketplace-section">
          <div className="marketplace-section-header">
            <div>
              <h2 className="marketplace-section-title">Featured Vendor Stores</h2>
              <p className="marketplace-section-subtitle">
                Official independent storefronts verified on KALA
              </p>
            </div>
            <Link to="/vendor/register" className="vendor-card-visit-btn">
              Sell on KALA &rarr;
            </Link>
          </div>

          <div className="marketplace-vendors-grid">
            {shops.map((shop) => (
              <Link
                key={shop.slug}
                to={`/shop/${shop.slug}`}
                className="vendor-card"
              >
                <div
                  className="vendor-card-banner"
                  style={shop.banner ? { backgroundImage: `url(${shop.banner})` } : undefined}
                >
                  <div className="vendor-card-avatar">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.shopName} />
                    ) : (
                      shop.shopName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <div className="vendor-card-body">
                  <div className="vendor-card-title-row">
                    <span className="vendor-card-name">{shop.shopName}</span>
                    <svg
                      className="verified-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-label="Verified Partner"
                    >
                      <title>Verified Partner</title>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="vendor-card-category">{shop.category}</div>
                  <p className="vendor-card-desc">
                    {shop.description || `Specialized in premium ${shop.category.toLowerCase()} and customized production.`}
                  </p>
                  <div className="vendor-card-footer">
                    <span>{shop.city}, {shop.state}</span>
                    <span className="vendor-card-visit-btn">
                      {shop.productCount || 0} Products &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. REAL PRODUCTS CATALOGUE */}
      <section className="marketplace-section" id="marketplace-products-section">
        <div className="marketplace-section-header">
          <div>
            <h2 className="marketplace-section-title">Marketplace Catalog</h2>
            <p className="marketplace-section-subtitle">
              Browse approved items available for purchase directly through KALA
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#5F6368' }}>
            {products.length} Products Found
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#D94700' }}>
              Loading marketplace products...
            </div>
          </div>
        ) : error ? (
          <div className="marketplace-empty-state">
            <h3 className="marketplace-empty-title">Notice</h3>
            <p className="marketplace-empty-desc">{error}</p>
            <button
              type="button"
              className="marketplace-btn-primary"
              onClick={loadMarketplaceData}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="marketplace-empty-state">
            <svg
              className="marketplace-empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="marketplace-empty-title">No products match your criteria</h3>
            <p className="marketplace-empty-desc">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              type="button"
              className="marketplace-btn-secondary"
              style={{ color: '#111111', borderColor: '#111111' }}
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="marketplace-products-grid">
            {products.map((item) => (
              <div key={item.id} className="m-product-card">
                <div className="m-product-img-wrap">
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    className="m-product-img"
                    loading="lazy"
                  />
                  {item.badge && <span className="m-product-badge">{item.badge}</span>}
                  {item.shop && (
                    <Link
                      to={`/shop/${item.shop.slug}`}
                      className="m-product-vendor-tag"
                      title="Visit Vendor Shop"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {item.shop.shopName}
                    </Link>
                  )}
                </div>

                <div className="m-product-content">
                  <div className="m-product-cat">{item.category}</div>
                  <Link to={`/product/${item.id}`} className="m-product-title">
                    {item.name}
                  </Link>

                  <div className="m-product-price-row">
                    <span className="m-product-price">₹{item.price.toLocaleString('en-IN')}</span>
                    {item.discountPrice && item.discountPrice < item.price && (
                      <span className="m-product-discount-price">
                        ₹{item.discountPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <Link to={`/product/${item.id}`} className="m-product-view-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. BECOME A VENDOR CTA */}
      <section className="marketplace-cta-card">
        <div className="marketplace-cta-inner">
          <div className="marketplace-cta-text">
            <h3>Are you a Manufacturer, Brand or Printer?</h3>
            <p>
              Open your verified shop on KALA Marketplace. Reach hundreds of custom apparel,
              streetwear, and merchandise buyers with zero setup fees.
            </p>
          </div>
          <Link to="/vendor/register" className="marketplace-btn-primary">
            Apply to Sell on KALA
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Marketplace
