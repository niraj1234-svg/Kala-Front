import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchShopBySlug } from '../services/marketplaceApi'
import { getProductImage } from '../data/products'
import type { VendorShop, MarketplaceProduct } from '../types/marketplace'
import '../styles/Marketplace.css'

export const PublicVendorShop: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<VendorShop | null>(null)
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    if (slug) {
      loadShop(slug)
    }
  }, [slug])

  const loadShop = async (shopSlug: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchShopBySlug(shopSlug)
      setShop(data.shop)
      setProducts(data.products || [])
    } catch (err: any) {
      console.error('Error loading vendor shop:', err)
      setError(err.message || 'Vendor shop not found.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#D94700' }}>
          Loading vendor storefront...
        </h2>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="marketplace-empty-state" style={{ margin: '5rem auto' }}>
        <h2 className="marketplace-empty-title">Shop Not Available</h2>
        <p className="marketplace-empty-desc">{error || 'This storefront does not exist or has been deactivated.'}</p>
        <Link to="/shop" className="marketplace-btn-primary">
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="vendor-storefront">
      {/* 1. STOREFRONT COVER BANNER */}
      <div
        className="storefront-banner"
        style={shop.banner ? { backgroundImage: `url(${shop.banner})` } : undefined}
      />

      {/* 2. STOREFRONT IDENTITY CARD */}
      <div className="storefront-header-wrap">
        <div className="storefront-profile-card">
          <div className="storefront-identity">
            <div className="storefront-logo">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.shopName} />
              ) : (
                shop.shopName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="storefront-titles">
              <h1>
                {shop.shopName}
                <svg
                  className="verified-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-label="Verified Vendor"
                >
                  <title>Verified Vendor</title>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </h1>
              <span className="storefront-badge">{shop.category}</span>

              <div className="storefront-meta">
                <span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {shop.city}, {shop.state}
                </span>

                {shop.contactEmail && (
                  <span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {shop.contactEmail}
                  </span>
                )}

                <span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  {products.length} Products listed
                </span>
              </div>
            </div>
          </div>

          <Link to="/shop" className="marketplace-btn-secondary" style={{ color: '#111', borderColor: '#111' }}>
            &larr; All Products
          </Link>
        </div>
      </div>

      {/* 3. STOREFRONT BIO & ABOUT */}
      {shop.description && (
        <div className="storefront-bio-box">
          <div className="storefront-bio-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              About {shop.shopName}
            </h3>
            <p>{shop.description}</p>
          </div>
        </div>
      )}

      {/* 4. VENDOR'S PRODUCT CATALOGUE */}
      <section className="marketplace-section">
        <div className="marketplace-section-header">
          <div>
            <h2 className="marketplace-section-title">Shop Collection</h2>
            <p className="marketplace-section-subtitle">
              Exclusive items supplied directly by {shop.shopName}
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#5F6368' }}>
            {products.length} Items Available
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        {products.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <input
                type="text"
                placeholder={`Search in ${shop.shopName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.25rem',
                  background: '#FFFFFF',
                  border: '1px solid #E5E2DD',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B7280"
                strokeWidth="2"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', ...Array.from(new Set(products.map((p) => p.category)))].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`vendor-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '20px',
                    border: selectedCategory === cat ? '1px solid #111' : '1px solid #E5E2DD',
                    background: selectedCategory === cat ? '#111' : '#FFF',
                    color: selectedCategory === cat ? '#FFF' : '#111',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'ALL' ? 'All Items' : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {(() => {
          const filtered = products.filter((item) => {
            const matchesQuery =
              !searchQuery.trim() ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory
            return matchesQuery && matchesCat
          })

          if (products.length === 0) {
            return (
              <div className="marketplace-empty-state">
                <h3 className="marketplace-empty-title">No products listed yet</h3>
                <p className="marketplace-empty-desc">
                  This vendor is preparing their collection. Check back shortly!
                </p>
              </div>
            )
          }

          if (filtered.length === 0) {
            return (
              <div className="marketplace-empty-state" style={{ padding: '3rem 1rem' }}>
                <h3 className="marketplace-empty-title">No items found</h3>
                <p className="marketplace-empty-desc">
                  No products matched your search in this store. Try clearing the filter.
                </p>
                <button
                  type="button"
                  className="marketplace-btn-secondary"
                  style={{ marginTop: '1rem', color: '#111', borderColor: '#111' }}
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('ALL')
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )
          }

          return (
            <div className="marketplace-products-grid">
              {filtered.map((item) => (
                <div key={item.id} className="m-product-card">
                  <div className="m-product-img-wrap">
                    <img src={getProductImage(item.image)} alt={item.name} className="m-product-img" loading="lazy" />
                    {item.badge && <span className="m-product-badge">{item.badge}</span>}
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
          )
        })()}
      </section>
    </div>
  )
}

export default PublicVendorShop
