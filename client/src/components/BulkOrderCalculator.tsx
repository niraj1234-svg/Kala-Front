import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductImage } from '../data/products'
import '../styles/BulkOrderCalculator.css'

interface BulkProduct {
  id: string
  name: string
  startingPrice: number
  image: string
  tierPrices: {
    '10-24': number
    '25-49': number
    '50-99': number
    '100-249': number
    '250+': number | string
  }
}

const BULK_PRODUCTS: BulkProduct[] = [
  {
    id: 'oversized-tee',
    name: 'Oversized T-Shirt',
    startingPrice: 299,
    image: getProductImage('Streetwear 01.png'),
    tierPrices: {
      '10-24': 499,
      '25-49': 449,
      '50-99': 399,
      '100-249': 349,
      '250+': 'Get Quote',
    },
  },
  {
    id: 'boxy-hoodie',
    name: 'Heavyweight Boxy Hoodie',
    startingPrice: 499,
    image: getProductImage('Streetwear -02.png'),
    tierPrices: {
      '10-24': 799,
      '25-49': 699,
      '50-99': 599,
      '100-249': 499,
      '250+': 'Get Quote',
    },
  },
  {
    id: 'tournament-jersey',
    name: 'Esports Tournament Jersey',
    startingPrice: 349,
    image: getProductImage('gaming 01.png'),
    tierPrices: {
      '10-24': 549,
      '25-49': 489,
      '50-99': 429,
      '100-249': 369,
      '250+': 'Get Quote',
    },
  },
  {
    id: 'dryfit-tee',
    name: 'Performance Dry-Fit Tee',
    startingPrice: 279,
    image: getProductImage('Gymwear04.png'),
    tierPrices: {
      '10-24': 449,
      '25-49': 399,
      '50-99': 349,
      '100-249': 299,
      '250+': 'Get Quote',
    },
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'Minimalist Crewneck Sweatshirt',
    startingPrice: 449,
    image: getProductImage('Streetwear 05.png'),
    tierPrices: {
      '10-24': 699,
      '25-49': 619,
      '50-99': 549,
      '100-249': 479,
      '250+': 'Get Quote',
    },
  },
]

type CustomizationType = 'Front Print' | 'Front + Back' | 'Custom Design'

const CUSTOMIZATION_OPTIONS: { id: CustomizationType; label: string; icon: string }[] = [
  { id: 'Front Print', label: 'Front Print', icon: 'shirt' },
  { id: 'Front + Back', label: 'Front + Back', icon: 'shirt' },
  { id: 'Custom Design', label: 'Custom Design', icon: 'edit' },
]

const TIERS = [
  { key: '10-24', range: '10 - 24', min: 10, max: 24 },
  { key: '25-49', range: '25 - 49', min: 25, max: 49 },
  { key: '50-99', range: '50 - 99', min: 50, max: 99 },
  { key: '100-249', range: '100 - 249', min: 100, max: 249 },
  { key: '250+', range: '250+', min: 250, max: Infinity },
] as const

export const BulkOrderCalculator: React.FC = () => {
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(50)
  const [customization, setCustomization] = useState<CustomizationType>('Front + Back')
  const navigate = useNavigate()

  const currentProduct = BULK_PRODUCTS[selectedProductIndex]

  // Identify active tier based on quantity
  const activeTierKey = useMemo(() => {
    if (quantity < 25) return '10-24'
    if (quantity < 50) return '25-49'
    if (quantity < 100) return '50-99'
    if (quantity < 250) return '100-249'
    return '250+'
  }, [quantity])

  // Customization price modifier
  const customizationAddon = useMemo(() => {
    switch (customization) {
      case 'Front + Back':
        return 0 // Matches reference base
      case 'Custom Design':
        return 30
      case 'Front Print':
      default:
        return 0
    }
  }, [customization])

  // Calculation
  const pricePerPieceRaw = currentProduct.tierPrices[activeTierKey]
  const isCustomQuoteTier = typeof pricePerPieceRaw === 'string'

  const estimatedPricePerPiece = useMemo(() => {
    if (isCustomQuoteTier) {
      return typeof currentProduct.startingPrice === 'number'
        ? currentProduct.startingPrice + customizationAddon
        : 299
    }
    return (pricePerPieceRaw as number) + customizationAddon
  }, [isCustomQuoteTier, pricePerPieceRaw, currentProduct.startingPrice, customizationAddon])

  const estimatedTotal = useMemo(() => {
    return estimatedPricePerPiece * quantity
  }, [estimatedPricePerPiece, quantity])

  // Navigation handlers
  const handlePrevProduct = () => {
    setSelectedProductIndex((prev) => (prev - 1 + BULK_PRODUCTS.length) % BULK_PRODUCTS.length)
  }

  const handleNextProduct = () => {
    setSelectedProductIndex((prev) => (prev + 1) % BULK_PRODUCTS.length)
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const step = prev >= 100 ? 25 : prev >= 50 ? 10 : 5
      const next = prev + delta * step
      return Math.max(10, Math.min(5000, next))
    })
  }

  const handleTierClick = (minQty: number) => {
    setQuantity(minQty)
  }

  const handleCtaClick = () => {
    const params = new URLSearchParams({
      product: currentProduct.name,
      qty: String(quantity),
      customization,
      estimate: String(estimatedTotal),
    })
    navigate(`/business-branding?${params.toString()}`)
  }

  // Peeking indices for carousel preview
  const prevIndex = (selectedProductIndex - 1 + BULK_PRODUCTS.length) % BULK_PRODUCTS.length
  const nextIndex = (selectedProductIndex + 1) % BULK_PRODUCTS.length

  return (
    <section className="kala-bulk-calculator-section" aria-labelledby="bulk-calc-heading">
      <div className="kala-container">
        {/* Section Heading */}
        <div className="kala-bulk-header-wrap">
          <div className="kala-bulk-eyebrow-row">
            <span className="kala-bulk-eyebrow-line" aria-hidden="true" />
            <span className="kala-bulk-eyebrow">KALA BUSINESS</span>
            <span className="kala-bulk-eyebrow-line" aria-hidden="true" />
          </div>
          <h2 id="bulk-calc-heading" className="kala-bulk-main-heading">
            Calculate Your <span className="kala-bulk-heading-accent">Bulk Order</span>
          </h2>
          <p className="kala-bulk-supporting-text">
            Get an instant estimate for custom apparel. Choose your product, quantity and customization to see your estimated total.
          </p>
        </div>

        {/* Main 2-Column Calculator Card */}
        <div className="kala-bulk-card">
          {/* LEFT SIDE: Product Visual Area */}
          <div className="kala-bulk-left-panel">
            <div className="kala-bulk-left-title-row">
              <h3 className="kala-bulk-product-title">{currentProduct.name}</h3>
              <p className="kala-bulk-starting-price">
                Starting from - <span className="kala-bulk-starting-price-val">₹{currentProduct.startingPrice}</span>
              </p>
            </div>

            {/* Product Peek Slider */}
            <div className="kala-bulk-slider-stage" aria-label="Product Showcase">
              {/* Previous peek image */}
              <div
                className="kala-bulk-peek-card kala-bulk-peek-prev"
                onClick={handlePrevProduct}
                title={`View ${BULK_PRODUCTS[prevIndex].name}`}
                aria-hidden="true"
              >
                <img
                  src={BULK_PRODUCTS[prevIndex].image}
                  alt=""
                  className="kala-bulk-peek-img"
                  loading="lazy"
                />
              </div>

              {/* Active center product */}
              <div className="kala-bulk-active-card">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="kala-bulk-active-img"
                />
              </div>

              {/* Next peek image */}
              <div
                className="kala-bulk-peek-card kala-bulk-peek-next"
                onClick={handleNextProduct}
                title={`View ${BULK_PRODUCTS[nextIndex].name}`}
                aria-hidden="true"
              >
                <img
                  src={BULK_PRODUCTS[nextIndex].image}
                  alt=""
                  className="kala-bulk-peek-img"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Slider Navigation Arrows & Dots */}
            <div className="kala-bulk-slider-controls">
              <div className="kala-bulk-nav-arrows">
                <button
                  type="button"
                  className="kala-bulk-arrow-btn"
                  onClick={handlePrevProduct}
                  aria-label="Previous apparel product"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="kala-bulk-arrow-btn"
                  onClick={handleNextProduct}
                  aria-label="Next apparel product"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              <div className="kala-bulk-dots" role="tablist" aria-label="Product selection">
                {BULK_PRODUCTS.map((prod, idx) => (
                  <button
                    key={prod.id}
                    type="button"
                    role="tab"
                    className={`kala-bulk-dot ${idx === selectedProductIndex ? 'active' : ''}`}
                    aria-label={`Select ${prod.name}`}
                    aria-selected={idx === selectedProductIndex}
                    onClick={() => setSelectedProductIndex(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Feature Icons Row */}
            <div className="kala-bulk-features-row">
              <div className="kala-bulk-feature-item">
                <svg className="kala-bulk-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
                  <line x1="10" y1="22" x2="14" y2="22" />
                </svg>
                <span>Premium Fabric</span>
              </div>
              <div className="kala-bulk-feature-item">
                <svg className="kala-bulk-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 3h12l4 6-10 13L2 9z" />
                  <path d="M11 3L8 9l4 13 4-13-3-6" />
                  <line x1="2" y1="9" x2="22" y2="9" />
                </svg>
                <span>High Quality Prints</span>
              </div>
              <div className="kala-bulk-feature-item">
                <svg className="kala-bulk-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Pan-India Delivery</span>
              </div>
              <div className="kala-bulk-feature-item">
                <svg className="kala-bulk-feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Perfect for Teams &amp; Events</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Order Configuration Area */}
          <div className="kala-bulk-right-panel">
            {/* 1. Select Product Dropdown */}
            <div className="kala-bulk-field-group">
              <label htmlFor="bulk-product-select" className="kala-bulk-field-label">
                1. Select Product
              </label>
              <div className="kala-bulk-select-wrap">
                <img
                  src={currentProduct.image}
                  alt=""
                  className="kala-bulk-select-thumb"
                  aria-hidden="true"
                />
                <select
                  id="bulk-product-select"
                  className="kala-bulk-select"
                  value={selectedProductIndex}
                  onChange={(e) => setSelectedProductIndex(Number(e.target.value))}
                >
                  {BULK_PRODUCTS.map((prod, idx) => (
                    <option key={prod.id} value={idx}>
                      {prod.name}
                    </option>
                  ))}
                </select>
                <span className="kala-bulk-select-chevron" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 2. Quantity Counter & Tier Banner */}
            <div className="kala-bulk-field-group">
              <span className="kala-bulk-field-label">2. Quantity</span>
              <div className="kala-bulk-qty-row">
                <div className="kala-bulk-qty-stepper">
                  <button
                    type="button"
                    className="kala-bulk-qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 10}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    className="kala-bulk-qty-input"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setQuantity(Math.max(1, Math.min(10000, val)))
                      }
                    }}
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    className="kala-bulk-qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="kala-bulk-tier-perk-badge">
                  <span className="kala-bulk-perk-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div className="kala-bulk-perk-text">
                    <strong>Higher quantity</strong>
                    <span>lower price per piece!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Customization Options */}
            <div className="kala-bulk-field-group">
              <span className="kala-bulk-field-label">3. Customization</span>
              <div className="kala-bulk-custom-grid" role="radiogroup" aria-label="Customization options">
                {CUSTOMIZATION_OPTIONS.map((opt) => {
                  const isSelected = customization === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`kala-bulk-custom-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setCustomization(opt.id)}
                    >
                      {opt.icon === 'shirt' ? (
                        <svg className="kala-bulk-custom-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                        </svg>
                      ) : (
                        <svg className="kala-bulk-custom-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      )}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4. Price Breakup Tiers */}
            <div className="kala-bulk-field-group">
              <span className="kala-bulk-field-label">4. Price Breakup</span>
              <div className="kala-bulk-tiers-grid">
                {TIERS.map((tier) => {
                  const isActive = activeTierKey === tier.key
                  const price = currentProduct.tierPrices[tier.key]
                  const displayPrice = typeof price === 'number' ? `₹${price}` : price

                  return (
                    <button
                      key={tier.key}
                      type="button"
                      className={`kala-bulk-tier-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleTierClick(tier.min)}
                      title={`Select ${tier.range} tier (${tier.min} pieces)`}
                    >
                      <span className="kala-bulk-tier-qty">{tier.range}</span>
                      <span className="kala-bulk-tier-price">{displayPrice}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Highlighted Calculation Box */}
            <div className="kala-bulk-estimate-box">
              <div className="kala-bulk-estimate-col">
                <span className="kala-bulk-estimate-label">Estimated Price / Piece</span>
                <span className="kala-bulk-estimate-value">
                  {isCustomQuoteTier ? 'Get Quote' : `₹${estimatedPricePerPiece}`}
                </span>
              </div>
              <div className="kala-bulk-estimate-divider" aria-hidden="true" />
              <div className="kala-bulk-estimate-col">
                <span className="kala-bulk-estimate-label">Estimated Total</span>
                <span className="kala-bulk-estimate-total">
                  {isCustomQuoteTier ? 'Custom Tier' : `₹${estimatedTotal.toLocaleString('en-IN')}`}
                </span>
                <span className="kala-bulk-estimate-pieces">({quantity} pieces)</span>
              </div>
            </div>

            {/* 6. CTA Button */}
            <button
              type="button"
              className="kala-bulk-cta-btn"
              onClick={handleCtaClick}
            >
              <span>Request Bulk Quote</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Small Pricing Disclaimer */}
        <p className="kala-bulk-disclaimer">
          Final price may vary based on product, quantity, fabric and customization.
        </p>
      </div>
    </section>
  )
}

export default BulkOrderCalculator
