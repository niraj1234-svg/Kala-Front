import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/productApi'
import type { Product } from '../data/products'
import '../styles/SearchModal.css'

export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const RECENT_SEARCHES_KEY = 'kala_recent_searches'
const MAX_RECENT_SEARCHES = 5

interface PopularCategoryChip {
  id: string
  name: string
  query: string
  icon: React.ReactNode
}

const POPULAR_CATEGORIES: PopularCategoryChip[] = [
  {
    id: 't-shirts',
    name: 'T-Shirts',
    query: 'Tee',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    query: 'Hoodie',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21h6" />
        <path d="M12 3a7 7 0 0 0-7 7v11h14V10a7 7 0 0 0-7-7z" />
        <path d="M9 13a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
  {
    id: 'gym-wear',
    name: 'Gym Wear',
    query: 'Gymwear',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="18" y1="5" x2="18" y2="19" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    id: 'gaming',
    name: 'Gaming',
    query: 'Gaming',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="4" />
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <circle cx="15.5" cy="12" r="1" />
        <circle cx="18" cy="10" r="1" />
      </svg>
    ),
  },
  {
    id: 'oversized',
    name: 'Oversized',
    query: 'Oversized',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
      </svg>
    ),
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    query: 'Streetwear',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
]

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_RECENT_SEARCHES)
        }
      }
    } catch {
      // Fallback on corrupt JSON
    }
    return []
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Save term to recent searches in localStorage
  const saveRecentSearch = (term: string) => {
    const clean = term.trim()
    if (!clean) return
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.warn('[SearchModal] Failed to persist recent search:', e)
      }
      return updated
    })
  }

  // Remove a single recent search item
  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation()
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.warn('[SearchModal] Failed to update recent searches:', e)
      }
      return updated
    })
  }

  // Clear all recent search history
  const clearAllRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (e) {
      console.warn('[SearchModal] Failed to clear recent searches:', e)
    }
  }

  // Fetch catalog on modal open if not loaded
  useEffect(() => {
    if (isOpen && catalogProducts.length === 0) {
      setIsLoading(true)
      fetchProducts()
        .then((items) => {
          if (items && items.length > 0) {
            setCatalogProducts(items)
          }
        })
        .catch((err) => {
          console.warn('[SearchModal] Failed to load catalog products:', err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, catalogProducts.length])

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
      setSearchQuery('')
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Live filtered results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return catalogProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(q)
      const catMatch = product.category.toLowerCase().includes(q)
      const descMatch = product.description.toLowerCase().includes(q)
      return nameMatch || catMatch || descMatch
    })
  }, [searchQuery, catalogProducts])

  // Highlight matching text in string
  const renderHighlightedText = (text: string, query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return text

    // Escape regex special characters
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="kala-search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // Form submit (Pressing Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      saveRecentSearch(q)
      navigate(`/shop?search=${encodeURIComponent(q)}`)
      onClose()
    }
  }

  // Navigate to product detail
  const handleProductSelect = (product: Product) => {
    saveRecentSearch(searchQuery.trim() || product.name)
    navigate(`/product/${product.id}`)
    onClose()
  }

  // Click on a popular category chip
  const handleCategoryClick = (category: PopularCategoryChip) => {
    setSearchQuery(category.query)
    saveRecentSearch(category.name)
  }

  // Click on a recent search history item
  const handleRecentSearchClick = (term: string) => {
    setSearchQuery(term)
  }

  // Close when clicking outside modal panel
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="kala-search-overlay-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search KALA products"
    >
      <div ref={panelRef} className="kala-search-modal-panel">
        {/* Top Search Bar Header */}
        <div className="kala-search-modal-header">
          <div className="kala-search-brand-row">
            <div className="kala-search-brand-tag">
              <svg className="kala-search-brand-sparkle" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
              </svg>
              <span>SEARCH KALA</span>
            </div>
            <span className="kala-search-quick-hint">Press ESC to exit</span>
          </div>

          <form className="kala-search-input-box" onSubmit={handleSubmit} role="search">
            {/* Orange Square Search Icon */}
            <div className="kala-search-icon-square" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              className="kala-search-main-input"
              placeholder="Search products, styles, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="kala-search-actions-right">
              {searchQuery && (
                <button
                  type="button"
                  className="kala-search-clear-action"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  title="Clear"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                className="kala-search-esc-btn"
                onClick={onClose}
                aria-label="Close search overlay"
                title="Press ESC to close"
              >
                <span>ESC</span>
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          </form>
        </div>

        {/* Popular Categories Row */}
        <div className="kala-search-categories-bar">
          <span className="kala-search-section-label">Popular Categories</span>
          <div className="kala-search-chips-row" role="group" aria-label="Popular Categories">
            {POPULAR_CATEGORIES.map((cat) => {
              const isActive = searchQuery.toLowerCase() === cat.query.toLowerCase()
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`kala-search-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                  aria-pressed={isActive}
                >
                  <span className="kala-search-chip-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="kala-search-modal-body">
          {/* STATE 1: Live Results while typing */}
          {searchQuery.trim() !== '' && (
            <div className="kala-search-results-wrapper">
              {isLoading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  Loading collection...
                </div>
              )}

              {!isLoading && searchResults.length > 0 && (
                <>
                  <div className="kala-search-results-bar">
                    <span className="kala-search-results-count">
                      {searchResults.length} {searchResults.length === 1 ? 'Product Match' : 'Product Matches'}
                    </span>
                    <button
                      type="button"
                      className="kala-search-view-all-btn"
                      onClick={handleSubmit}
                    >
                      <span>View all in Shop</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  <ul className="kala-search-results-grid" role="listbox">
                    {searchResults.map((product) => (
                      <li key={product.id} role="option" aria-selected="false">
                        <div
                          className="kala-search-card"
                          onClick={() => handleProductSelect(product)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleProductSelect(product)
                          }}
                        >
                          <div className="kala-search-card-left">
                            <div className="kala-search-thumb-wrap">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="kala-search-thumb"
                                loading="lazy"
                              />
                            </div>
                            <div className="kala-search-details">
                              <span className="kala-search-cat-badge">{product.category}</span>
                              <span className="kala-search-product-name">
                                {renderHighlightedText(product.name, searchQuery)}
                              </span>
                            </div>
                          </div>

                          <div className="kala-search-card-right">
                            <div className="kala-search-price-col">
                              <span className="kala-search-price">₹{product.price.toLocaleString('en-IN')}</span>
                              <span className={`kala-search-status-dot ${product.available ? 'in-stock' : 'sold-out'}`}>
                                {product.available ? '● In Stock' : '● Sold Out'}
                              </span>
                            </div>
                            <div className="kala-search-arrow-box" aria-hidden="true">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {!isLoading && searchResults.length === 0 && (
                <div className="kala-search-no-matches">
                  <h3 className="kala-search-no-matches-title">No products found</h3>
                  <p className="kala-search-no-matches-hint">
                    No results for &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for <em>Hoodie</em>, <em>Gaming</em>, <em>Gymwear</em>, or <em>Tee</em>.
                  </p>
                  <button
                    type="button"
                    className="kala-search-browse-shop-btn"
                    onClick={() => {
                      navigate('/shop')
                      onClose()
                    }}
                  >
                    <span>Browse All Shop Items</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: Recent Searches (When query is empty and history exists) */}
          {searchQuery.trim() === '' && recentSearches.length > 0 && (
            <div className="kala-search-recent-box">
              <div className="kala-search-recent-header">
                <span className="kala-search-recent-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Recent Searches</span>
                </span>
                <button
                  type="button"
                  className="kala-search-clear-all-btn"
                  onClick={clearAllRecentSearches}
                  aria-label="Clear all recent searches"
                >
                  Clear All
                </button>
              </div>

              <ul className="kala-search-recent-list">
                {recentSearches.map((term, index) => (
                  <li
                    key={term}
                    className="kala-search-recent-item"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    <div className="kala-search-recent-left">
                      <svg className="kala-search-recent-clock" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{term}</span>
                    </div>
                    <button
                      type="button"
                      className="kala-search-recent-remove"
                      onClick={(e) => removeRecentSearch(e, term)}
                      aria-label={`Remove ${term} from recent searches`}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* STATE 3: Empty State (When query is empty and no history) */}
          {searchQuery.trim() === '' && recentSearches.length === 0 && (
            <div className="kala-search-empty-state">
              <div className="kala-search-empty-illustration" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
              <h3 className="kala-search-empty-title">Start discovering KALA</h3>
              <p className="kala-search-empty-desc">
                Search for apparel, gaming tees, gymwear and custom collections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
