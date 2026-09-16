import React, { useState, useMemo } from 'react'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/ProductCard'
import '../styles/Shop.css'

type CategoryFilter = 'All' | 'Streetwear' | 'Gaming' | 'Gymwear'

const CATEGORIES: CategoryFilter[] = ['All', 'Streetwear', 'Gaming', 'Gymwear']

export const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filter products based on active category and search query
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return PRODUCTS.filter((product) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory

      if (!matchesCategory) return false

      // Search match across name, category, description
      if (!query) return true

      const nameMatch = product.name.toLowerCase().includes(query)
      const categoryMatch = product.category.toLowerCase().includes(query)
      const descriptionMatch = product.description.toLowerCase().includes(query)

      return nameMatch || categoryMatch || descriptionMatch
    })
  }, [selectedCategory, searchQuery])

  const handleResetFilters = () => {
    setSelectedCategory('All')
    setSearchQuery('')
  }

  return (
    <main className="kala-container kala-shop-page">
      {/* 1. Page Header */}
      <header className="kala-shop-header">
        <p className="kala-label kala-shop-badge">COLLECTION 2026</p>
        <h1 className="kala-h1 kala-shop-title">SHOP CATALOG</h1>
        <p className="kala-body kala-shop-subtitle">
          Explore handcrafted Indian streetwear, tactical esports tournament wear, and high-performance gym essentials.
        </p>
      </header>

      {/* 2. Controls: Category Tabs & Search Bar */}
      <div className="kala-shop-controls">
        <div className="kala-category-tabs" role="tablist" aria-label="Product categories">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`kala-category-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            )
          })}
        </div>

        <div className="kala-shop-search-wrap">
          <input
            type="text"
            className="kala-shop-search-input"
            placeholder="Search products, styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
          {searchQuery ? (
            <button
              type="button"
              className="kala-search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="kala-shop-search-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* 3. Product Count Meta Row */}
      <div className="kala-shop-meta-row">
        <p className="kala-product-count">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* 4. Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="kala-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="kala-empty-state">
          <h2 className="kala-empty-title">NO PRODUCTS FOUND</h2>
          <p className="kala-empty-text">
            Try changing your search or category filter.
          </p>
          <button
            type="button"
            className="kala-btn kala-btn-secondary"
            onClick={handleResetFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  )
}

export default Shop
