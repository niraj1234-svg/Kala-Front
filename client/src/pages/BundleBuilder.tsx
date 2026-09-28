import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchProducts } from '../services/productApi'
import { isTShirtProduct } from '../data/products'
import type { Product, ProductColorVariant } from '../data/products'
import '../styles/BundleBuilder.css'

export type BundleOfferKey = 2 | 3 | 5

interface BundleTierConfig {
  key: BundleOfferKey
  label: string
  sublabel: string
  price: number
  badge?: string
  bundleType: string
}

export const BUNDLE_TIERS: Record<BundleOfferKey, BundleTierConfig> = {
  2: {
    key: 2,
    label: '2 T-SHIRTS',
    sublabel: 'Essential Duo',
    price: 499,
    bundleType: '2_TSHIRT',
  },
  3: {
    key: 3,
    label: '3 T-SHIRTS',
    sublabel: 'Streetwear Rotation',
    price: 699,
    badge: 'POPULAR',
    bundleType: '3_TSHIRT',
  },
  5: {
    key: 5,
    label: '5 T-SHIRTS',
    sublabel: 'Full Week Stack',
    price: 999,
    badge: 'BEST VALUE',
    bundleType: '5_TSHIRT',
  },
}

export interface BundleSlotItem {
  id: string // unique slot id
  product: Product
  size: string
  selectedVariant?: ProductColorVariant
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export const BundleBuilder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Parse initial offer from URL (default: 3)
  const initialOfferParam = Number(searchParams.get('offer'))
  const initialTier: BundleOfferKey =
    initialOfferParam === 2 || initialOfferParam === 5 ? initialOfferParam : 3

  const [activeTier, setActiveTier] = useState<BundleOfferKey>(initialTier)
  const currentConfig = BUNDLE_TIERS[activeTier]

  // Slots state (array with length equal to activeTier)
  const [slots, setSlots] = useState<(BundleSlotItem | null)[]>(() => {
    // Check if session has saved bundle with matching tier
    try {
      const saved = sessionStorage.getItem('kala_active_bundle')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.slotCount === initialTier && Array.isArray(parsed.items)) {
          const loadedSlots: (BundleSlotItem | null)[] = new Array(initialTier).fill(null)
          parsed.items.forEach((it: any, index: number) => {
            if (index < initialTier) {
              loadedSlots[index] = {
                id: `slot-${index}-${Date.now()}`,
                product: it.product,
                size: it.size || 'M',
                selectedVariant: it.selectedVariant,
              }
            }
          })
          return loadedSlots
        }
      }
    } catch {}
    return new Array(initialTier).fill(null)
  })

  // Currently focused slot index for product selection
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0)

  // Products catalog state
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Offer switch confirmation modal state
  const [pendingSwitchTier, setPendingSwitchTier] = useState<BundleOfferKey | null>(null)

  // Ref to catalog section for smooth scrolling on slot click
  const catalogRef = useRef<HTMLDivElement>(null)

  // Fetch available products
  useEffect(() => {
    let isMounted = true
    setIsLoadingProducts(true)
    fetchProducts()
      .then((data) => {
        if (isMounted) {
          // Filter to T-shirts / jerseys / streetwear
          const tShirts = data.filter((p) => isTShirtProduct(p) || p.category === 'Streetwear')
          setProducts(tShirts.length > 0 ? tShirts : data)
          setIsLoadingProducts(false)
        }
      })
      .catch((err) => {
        console.warn('[BundleBuilder] Products fetch error:', err)
        if (isMounted) setIsLoadingProducts(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync activeTier with URL parameter
  useEffect(() => {
    const param = Number(searchParams.get('offer'))
    if (param === 2 || param === 3 || param === 5) {
      if (param !== activeTier) {
        switchTier(param, false)
      }
    }
  }, [searchParams])

  // Count filled slots
  const filledSlotsCount = useMemo(() => {
    return slots.filter(Boolean).length
  }, [slots])

  const isComplete = filledSlotsCount === activeTier

  // Calculate regular retail value of selected shirts for real savings display
  const regularRetailTotal = useMemo(() => {
    return slots.reduce((sum, slot) => {
      if (slot && slot.product?.price) {
        return sum + slot.product.price
      }
      return sum
    }, 0)
  }, [slots])

  const savingsAmount = useMemo(() => {
    if (regularRetailTotal > currentConfig.price) {
      return regularRetailTotal - currentConfig.price
    }
    return 0
  }, [regularRetailTotal, currentConfig.price])

  // Switch Tier Logic (with confirmation if downsizing loses items)
  const handleTierClick = (newTier: BundleOfferKey) => {
    if (newTier === activeTier) return

    // If downsizing and user has filled more slots than new tier
    if (newTier < activeTier && filledSlotsCount > newTier) {
      setPendingSwitchTier(newTier)
      return
    }

    switchTier(newTier, true)
  }

  const switchTier = (newTier: BundleOfferKey, updateUrl: boolean) => {
    setActiveTier(newTier)
    if (updateUrl) {
      setSearchParams({ offer: String(newTier) })
    }

    setSlots((prev) => {
      const nextSlots = new Array(newTier).fill(null)
      // Copy existing items up to new length
      for (let i = 0; i < Math.min(prev.length, newTier); i++) {
        nextSlots[i] = prev[i]
      }
      return nextSlots
    })

    // Adjust active slot index
    setActiveSlotIndex((prevIndex) => {
      if (prevIndex >= newTier) {
        return newTier - 1
      }
      return prevIndex
    })

    setPendingSwitchTier(null)
  }

  // Handle selecting a product for the currently active slot
  const handleSelectProduct = (product: Product) => {
    if (!product.available) return

    // Target slot: activeSlotIndex if valid, else first empty slot
    let targetIndex = activeSlotIndex
    if (targetIndex >= activeTier || slots[targetIndex] !== null) {
      const firstEmpty = slots.findIndex((s) => s === null)
      if (firstEmpty !== -1) {
        targetIndex = firstEmpty
      }
    }

    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined

    const newItem: BundleSlotItem = {
      id: `slot-${targetIndex}-${Date.now()}`,
      product,
      size: 'M', // default size
      selectedVariant: defaultVariant,
    }

    const nextSlots = [...slots]
    nextSlots[targetIndex] = newItem
    setSlots(nextSlots)

    // Auto-advance to next empty slot
    const nextEmptyIndex = nextSlots.findIndex((s, idx) => s === null && idx !== targetIndex)
    if (nextEmptyIndex !== -1) {
      setActiveSlotIndex(nextEmptyIndex)
    }
  }

  // Handle changing size of a slot
  const handleSizeChange = (slotIndex: number, size: string) => {
    setSlots((prev) => {
      const copy = [...prev]
      if (copy[slotIndex]) {
        copy[slotIndex] = {
          ...copy[slotIndex]!,
          size,
        }
      }
      return copy
    })
  }

  // Handle changing variant/color of a slot
  const handleVariantChange = (slotIndex: number, variant: ProductColorVariant) => {
    setSlots((prev) => {
      const copy = [...prev]
      if (copy[slotIndex]) {
        copy[slotIndex] = {
          ...copy[slotIndex]!,
          selectedVariant: variant,
        }
      }
      return copy
    })
  }

  // Handle removing an item from a slot
  const handleRemoveSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const copy = [...prev]
      copy[slotIndex] = null
      return copy
    })
    setActiveSlotIndex(slotIndex)
  }

  // Handle clicking "CHANGE" on a slot
  const handleChangeSlot = (slotIndex: number) => {
    setActiveSlotIndex(slotIndex)
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Handle clicking an empty slot to focus it
  const handleSlotClick = (slotIndex: number) => {
    setActiveSlotIndex(slotIndex)
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Proceed to Checkout
  const handleContinueToCheckout = () => {
    if (!isComplete) return

    // Verify all items have size
    const validItems = slots.filter((s): s is BundleSlotItem => s !== null)
    if (validItems.length !== activeTier) return

    // Construct clean bundle payload
    const bundlePayload = {
      type: currentConfig.bundleType,
      name: currentConfig.label,
      price: currentConfig.price,
      slotCount: activeTier,
      items: validItems.map((slot) => ({
        productId: slot.product.id,
        name: slot.product.name,
        image: slot.selectedVariant?.image || slot.product.image,
        size: slot.size,
        quantity: 1,
        variant: slot.selectedVariant?.colorName,
        product: slot.product,
      })),
    }

    // Save to session storage for checkout retrieval
    try {
      sessionStorage.setItem('kala_active_bundle', JSON.stringify(bundlePayload))
    } catch (err) {
      console.warn('[BundleBuilder] SessionStorage save failed:', err)
    }

    // Navigate to checkout in bundle mode
    navigate('/checkout?bundle=true')
  }

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = p.name.toLowerCase().includes(query)
        const matchesDesc = p.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc) return false
      }
      return true
    })
  }, [products, selectedCategory, searchQuery])

  // Count how many times a product is already in the stack
  const getProductCountInStack = (productId: string) => {
    return slots.filter((s) => s && s.product.id === productId).length
  }

  return (
    <main className="kala-bundle-builder-page" id="main-content">
      {/* ====================================================================
          1. HEADER & OFFER TIER SELECTOR
          ==================================================================== */}
      <section className="kala-bundle-hero">
        <div className="kala-bundle-hero-container">
          <div className="kala-bundle-eyebrow">
            <span className="kala-eyebrow-accent-dot" aria-hidden="true" />
            <span>KALA • MULTI-BUY CAMPAIGN</span>
          </div>

          <h1 className="kala-bundle-main-title">BUILD YOUR T-SHIRT STACK</h1>
          <p className="kala-bundle-main-subtitle">
            Choose your pack size. Mix and match any T-shirt from our streetwear &amp; culture collection.
          </p>

          {/* Interactive Tier Tabs (2, 3, 5 T-Shirts) */}
          <div className="kala-tier-tabs" role="tablist" aria-label="Bundle Offers">
            {(Object.keys(BUNDLE_TIERS) as unknown as BundleOfferKey[]).map((tierKey) => {
              const tier = BUNDLE_TIERS[tierKey]
              const isSelected = activeTier === tierKey
              return (
                <button
                  key={tierKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`kala-tier-tab ${isSelected ? 'active' : ''} ${
                    tier.badge ? 'has-badge' : ''
                  }`}
                  onClick={() => handleTierClick(tierKey)}
                >
                  {tier.badge && <span className="kala-tier-badge">{tier.badge}</span>}
                  <span className="kala-tier-tab-qty">{tier.label}</span>
                  <span className="kala-tier-tab-price">₹{tier.price}</span>
                  <span className="kala-tier-tab-per-piece">
                    ₹{Math.round(tier.price / tier.key)} / piece
                  </span>
                </button>
              )
            })}
          </div>

          {/* Progress Tracker */}
          <div className="kala-bundle-progress-wrap" aria-live="polite">
            <div className="kala-bundle-progress-header">
              <span className="kala-progress-status-text">
                <strong>{filledSlotsCount} / {activeTier}</strong> T-SHIRTS SELECTED
              </span>
              <span className="kala-progress-offer-pill">
                {currentConfig.label} FOR ₹{currentConfig.price}
              </span>
            </div>
            <div className="kala-progress-bar-track" role="progressbar" aria-valuenow={filledSlotsCount} aria-valuemin={0} aria-valuemax={activeTier}>
              <div
                className="kala-progress-bar-fill"
                style={{ width: `${(filledSlotsCount / activeTier) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. MAIN WORKSPACE: SLOTS STACK & PRODUCT CATALOG
          ==================================================================== */}
      <div className="kala-bundle-workspace">
        <div className="kala-bundle-workspace-container">
          {/* LEFT / TOP COLUMN: THE STACK SLOTS */}
          <div className="kala-bundle-slots-column">
            <div className="kala-slots-header">
              <h2 className="kala-slots-title">YOUR SELECTION STACK</h2>
              <span className="kala-slots-instruction">
                {isComplete
                  ? 'All slots filled! You can adjust sizes below or continue to checkout.'
                  : `Select a T-shirt from the catalogue to fill Slot ${activeSlotIndex + 1}`}
              </span>
            </div>

            <div className="kala-slots-grid" data-slots-count={activeTier}>
              {slots.map((slot, index) => {
                const isActive = activeSlotIndex === index
                const slotNumber = index + 1

                if (!slot) {
                  // EMPTY SLOT
                  return (
                    <div
                      key={`empty-slot-${index}`}
                      className={`kala-slot-card kala-slot-empty ${isActive ? 'is-active-slot' : ''}`}
                      onClick={() => handleSlotClick(index)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Slot ${slotNumber}: Empty. Click to choose a T-shirt.`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSlotClick(index)
                        }
                      }}
                    >
                      <div className="kala-slot-badge">SLOT {slotNumber}</div>
                      <div className="kala-slot-empty-icon-wrap">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <span className="kala-slot-empty-label">+ SELECT T-SHIRT</span>
                      {isActive && <span className="kala-active-indicator">CURRENT ACTIVE SLOT</span>}
                    </div>
                  )
                }

                // FILLED SLOT
                const displayImage = slot.selectedVariant?.image || slot.product.image
                return (
                  <div
                    key={slot.id}
                    className={`kala-slot-card kala-slot-filled ${isActive ? 'is-active-slot' : ''}`}
                  >
                    <div className="kala-slot-top-row">
                      <div className="kala-slot-badge kala-slot-badge-filled">
                        <span className="kala-slot-check-icon" aria-hidden="true">✓</span>
                        SLOT {slotNumber}
                      </div>
                      <div className="kala-slot-actions">
                        <button
                          type="button"
                          className="kala-slot-btn kala-slot-btn-change"
                          onClick={() => handleChangeSlot(index)}
                          aria-label={`Change product in Slot ${slotNumber}`}
                        >
                          CHANGE
                        </button>
                        <button
                          type="button"
                          className="kala-slot-btn kala-slot-btn-remove"
                          onClick={() => handleRemoveSlot(index)}
                          aria-label={`Remove product from Slot ${slotNumber}`}
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>

                    <div className="kala-slot-item-content">
                      <div className="kala-slot-img-wrap">
                        <img
                          src={displayImage}
                          alt={slot.product.name}
                          className="kala-slot-img"
                          loading="lazy"
                        />
                      </div>

                      <div className="kala-slot-info">
                        <h3 className="kala-slot-product-name">{slot.product.name}</h3>

                        {/* Color Variant Selector if Available */}
                        {slot.product.variants && slot.product.variants.length > 0 && (
                          <div className="kala-slot-variant-picker">
                            <span className="kala-slot-picker-label">Color:</span>
                            <div className="kala-slot-variant-swatches">
                              {slot.product.variants.map((v) => {
                                const isSelectedVariant =
                                  slot.selectedVariant?.colorName.toLowerCase() ===
                                  v.colorName.toLowerCase()
                                return (
                                  <button
                                    key={v.colorName}
                                    type="button"
                                    className={`kala-swatch-dot ${isSelectedVariant ? 'active' : ''}`}
                                    style={{ backgroundColor: v.color }}
                                    title={v.colorName}
                                    onClick={() => handleVariantChange(index, v)}
                                    aria-label={`Select ${v.colorName} variant`}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Individual Size Selector for this slot */}
                        <div className="kala-slot-size-picker">
                          <span className="kala-slot-picker-label">Size:</span>
                          <div className="kala-slot-size-pills" role="radiogroup" aria-label={`Select size for slot ${slotNumber}`}>
                            {AVAILABLE_SIZES.map((size) => {
                              const isSelectedSize = slot.size === size
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelectedSize}
                                  className={`kala-size-pill ${isSelectedSize ? 'active' : ''}`}
                                  onClick={() => handleSizeChange(index, size)}
                                >
                                  {size}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY BUNDLE SUMMARY (Desktop) */}
          <aside className="kala-bundle-summary-column">
            <div className="kala-bundle-summary-card">
              <h2 className="kala-summary-heading">YOUR BUNDLE</h2>
              <div className="kala-summary-tier-name">{currentConfig.label}</div>
              <p className="kala-summary-tagline">{currentConfig.sublabel}</p>

              <div className="kala-summary-price-box">
                <span className="kala-summary-currency">₹</span>
                <span className="kala-summary-price-num">{currentConfig.price}</span>
                <span className="kala-summary-all-inclusive">ALL INCLUSIVE</span>
              </div>

              {savingsAmount > 0 && (
                <div className="kala-summary-savings-tag">
                  <span className="kala-savings-icon">⚡</span>
                  <span>YOU SAVE ₹{savingsAmount.toLocaleString('en-IN')} ON THIS BUNDLE</span>
                </div>
              )}

              <div className="kala-summary-divider" />

              <div className="kala-summary-breakdown">
                <div className="kala-summary-row">
                  <span>Selected Items</span>
                  <span>{filledSlotsCount} / {activeTier}</span>
                </div>
                <div className="kala-summary-row">
                  <span>Bundle Rate</span>
                  <span>₹{currentConfig.price}</span>
                </div>
                <div className="kala-summary-row">
                  <span>Standard Shipping</span>
                  <span>₹99 <small>(Free on orders ₹2,000+)</small></span>
                </div>
              </div>

              {/* Continue to Checkout Button */}
              <button
                type="button"
                className={`kala-bundle-cta-btn ${isComplete ? 'is-ready' : 'is-disabled'}`}
                disabled={!isComplete}
                onClick={handleContinueToCheckout}
              >
                {isComplete ? (
                  <>
                    <span>CONTINUE TO CHECKOUT</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                ) : (
                  <span>
                    SELECT {activeTier - filledSlotsCount} MORE T-SHIRT
                    {activeTier - filledSlotsCount > 1 ? 'S' : ''}
                  </span>
                )}
              </button>

              <p className="kala-summary-guarantee">
                ✓ 100% Premium Cotton • Custom Fit Guaranteed • Safe Razorpay Checkout
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ====================================================================
          3. PRODUCT SELECTION CATALOG SECTION
          ==================================================================== */}
      <section className="kala-bundle-catalog-section" ref={catalogRef}>
        <div className="kala-bundle-catalog-container">
          <div className="kala-catalog-header-bar">
            <div>
              <h2 className="kala-catalog-title">CHOOSE T-SHIRTS FOR YOUR STACK</h2>
              <p className="kala-catalog-subtitle">
                Click any product below to add it to <strong>Slot {activeSlotIndex + 1}</strong>.
              </p>
            </div>

            {/* Search Input */}
            <div className="kala-catalog-search-wrap">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kala-catalog-search-input"
                aria-label="Search available T-shirts"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="kala-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="kala-catalog-category-pills" role="tablist" aria-label="Filter by category">
            {['All', 'Streetwear', 'Gaming', 'Gymwear'].map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`kala-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? 'All T-Shirts' : cat}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoadingProducts && (
            <div className="kala-catalog-loading">
              <div className="kala-loading-spinner" />
              <p>LOADING KALA COLLECTION...</p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoadingProducts && filteredProducts.length === 0 && (
            <div className="kala-catalog-empty">
              <p>No products found matching your filter.</p>
              <button
                type="button"
                className="kala-btn kala-btn-secondary"
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
              >
                RESET FILTERS
              </button>
            </div>
          )}

          {!isLoadingProducts && filteredProducts.length > 0 && (
            <div className="kala-bundle-products-grid">
              {filteredProducts.map((product) => {
                const inStackCount = getProductCountInStack(product.id)
                const isSelectedInActive =
                  slots[activeSlotIndex] && slots[activeSlotIndex]?.product.id === product.id

                return (
                  <article
                    key={product.id}
                    className={`kala-bundle-product-card ${!product.available ? 'is-unavailable' : ''} ${
                      isSelectedInActive ? 'is-selected-active' : ''
                    }`}
                  >
                    <div className="kala-product-card-img-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="kala-bundle-product-img"
                        loading="lazy"
                      />
                      {inStackCount > 0 && (
                        <span className="kala-product-stack-badge">
                          {inStackCount} IN STACK
                        </span>
                      )}
                      {!product.available && (
                        <span className="kala-product-out-of-stock-badge">OUT OF STOCK</span>
                      )}
                    </div>

                    <div className="kala-bundle-product-body">
                      <div className="kala-bundle-product-meta">
                        <span className="kala-bundle-product-category">{product.category}</span>
                      </div>
                      <h3 className="kala-bundle-product-name">{product.name}</h3>

                      <button
                        type="button"
                        className="kala-bundle-select-btn"
                        disabled={!product.available}
                        onClick={() => handleSelectProduct(product)}
                      >
                        {isSelectedInActive ? 'SELECTED' : `+ ADD TO SLOT ${activeSlotIndex + 1}`}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          4. MOBILE STICKY BOTTOM BAR
          ==================================================================== */}
      <div className="kala-bundle-mobile-bottom-bar">
        <div className="kala-mobile-bottom-content">
          <div className="kala-mobile-price-col">
            <span className="kala-mobile-progress-badge">
              {filledSlotsCount} / {activeTier} SELECTED
            </span>
            <div className="kala-mobile-price">
              <span>₹{currentConfig.price}</span>
              {savingsAmount > 0 && (
                <span className="kala-mobile-savings-pill">Save ₹{savingsAmount}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`kala-mobile-checkout-btn ${isComplete ? 'is-ready' : 'is-disabled'}`}
            disabled={!isComplete}
            onClick={handleContinueToCheckout}
          >
            {isComplete ? 'CONTINUE →' : `ADD ${activeTier - filledSlotsCount} MORE`}
          </button>
        </div>
      </div>

      {/* ====================================================================
          5. OFFER SWITCH CONFIRMATION MODAL
          ==================================================================== */}
      {pendingSwitchTier !== null && (
        <div className="kala-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="switch-modal-title">
          <div className="kala-confirm-modal">
            <h3 id="switch-modal-title" className="kala-modal-title">
              Switch to {pendingSwitchTier} T-Shirts?
            </h3>
            <p className="kala-modal-desc">
              You currently have {filledSlotsCount} items selected. Switching to the{' '}
              {BUNDLE_TIERS[pendingSwitchTier].label} will keep the first {pendingSwitchTier} slots
              and remove the remaining selections.
            </p>
            <div className="kala-modal-actions">
              <button
                type="button"
                className="kala-modal-btn kala-modal-btn-cancel"
                onClick={() => setPendingSwitchTier(null)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="kala-modal-btn kala-modal-btn-confirm"
                onClick={() => switchTier(pendingSwitchTier, true)}
              >
                SWITCH OFFER
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default BundleBuilder
