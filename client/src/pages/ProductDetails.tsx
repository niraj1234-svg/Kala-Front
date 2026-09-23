import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PRODUCTS, getProductHighlights } from '../data/products'
import type { Product, ProductColorVariant } from '../data/products'
import { fetchProductById } from '../services/productApi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import ProductReviewsSection from '../components/reviews/ProductReviewsSection'
import '../styles/ProductDetails.css'

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialColorParam = searchParams.get('color')
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState<Product | null>(() => {
    return PRODUCTS.find((p) => p.id === id) || null
  })

  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(() => {
    const p = PRODUCTS.find((prod) => prod.id === id)
    if (!p?.variants || p.variants.length === 0) return null
    if (initialColorParam) {
      const match = p.variants.find(
        (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
      )
      if (match) return match
    }
    return p.variants[0]
  })

  const [activeImage, setActiveImage] = useState<string>(() => {
    const p = PRODUCTS.find((prod) => prod.id === id)
    if (p?.variants && p.variants.length > 0) {
      if (initialColorParam) {
        const match = p.variants.find(
          (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
        )
        if (match) return match.image
      }
      return p.variants[0].image
    }
    return p?.image || ''
  })
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [sizeError, setSizeError] = useState<string>('')
  const [addedNotification, setAddedNotification] = useState<boolean>(false)
  const [shareFeedback, setShareFeedback] = useState<string>('')

  // Scroll to top and fetch fresh product data on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (!id) return
    let isMounted = true

    fetchProductById(id).then((liveProduct) => {
      if (isMounted && liveProduct) {
        setProduct(liveProduct)
        if (liveProduct.variants && liveProduct.variants.length > 0) {
          const match = initialColorParam
            ? liveProduct.variants.find(
                (v) => v.colorName.toLowerCase() === initialColorParam.toLowerCase()
              )
            : null
          const chosen = match || liveProduct.variants[0]
          setSelectedVariant(chosen)
          setActiveImage(chosen.image)
        } else {
          setActiveImage(liveProduct.image)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [id, initialColorParam])

  // Sync activeImage whenever product initial load or update occurs
  useEffect(() => {
    if (selectedVariant) {
      setActiveImage(selectedVariant.image)
    } else if (product && !activeImage) {
      setActiveImage(product.image)
    }
  }, [product, selectedVariant, activeImage])

  // 1. PRODUCT NOT FOUND STATE
  if (!product) {
    return (
      <main className="kala-container kala-not-found-box">
        <p className="kala-display" style={{ color: 'var(--kala-orange)', marginBottom: '0.5rem' }}>
          404
        </p>
        <h1 className="kala-h2" style={{ marginBottom: '1rem' }}>
          PRODUCT NOT FOUND
        </h1>
        <p className="kala-body" style={{ color: 'var(--kala-text-secondary)', marginBottom: '2rem' }}>
          The product you're looking for does not exist.
        </p>
        <Link to="/shop" className="kala-btn kala-btn-primary">
          BACK TO SHOP
        </Link>
      </main>
    )
  }

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean)

  const highlights = getProductHighlights(product)
  const isWishlisted = isInWishlist(product.id)

  // Handle Quantity adjustments
  const handleIncreaseQty = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  // Handle Buy Now: immediately add item with selected size/quantity and go to checkout (or login if unauthenticated)
  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError('Please select a size')
      return
    }

    setSizeError('')
    const cartProduct = {
      ...product,
      image: selectedVariant?.image || activeImage || product.image,
    }
    addToCart(cartProduct, selectedSize, quantity)

    if (!isAuthenticated) {
      navigate('/account?redirect=/checkout&message=Please%20log%20in%20to%20continue%20with%20your%20purchase.')
      return
    }

    navigate('/checkout')
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Please select a size')
      return
    }

    setSizeError('')
    const cartProduct = {
      ...product,
      image: selectedVariant?.image || activeImage || product.image,
    }
    addToCart(cartProduct, selectedSize, quantity)
    setAddedNotification(true)

    // Reset notification after 3 seconds
    setTimeout(() => {
      setAddedNotification(false)
    }, 3000)
  }

  const handleColorSelect = (variant: ProductColorVariant) => {
    setSelectedVariant(variant)
    setActiveImage(variant.image)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    if (sizeError) {
      setSizeError('')
    }
  }

  // Handle Share action
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} — KALA`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // Fall back to clipboard if user dismissed native sheet
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareFeedback('Link Copied!')
      setTimeout(() => setShareFeedback(''), 2500)
    } catch {
      setShareFeedback('Link Copied!')
      setTimeout(() => setShareFeedback(''), 2500)
    }
  }

  return (
    <main className="kala-container kala-details-page">
      <div className="kala-details-grid">
        {/* Product Image Gallery */}
        <div className="kala-details-gallery">
          {galleryImages.length > 1 && (
            <div className="kala-gallery-thumbnails" role="tablist" aria-label="Product thumbnails">
              {galleryImages.map((imgUrl, idx) => {
                const isCurrent = (activeImage || product.image) === imgUrl
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`View image ${idx + 1}`}
                    className={`kala-gallery-thumb-btn ${isCurrent ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                )
              })}
            </div>
          )}

          <div className="kala-details-main-image-card">
            <img
              src={activeImage || product.image}
              alt={product.name}
              loading="eager"
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="kala-details-info">
          {/* Product Name */}
          <h1 className="kala-details-title">{product.name}</h1>

          {/* Price */}
          <div className="kala-details-price">
            ₹{product.price.toLocaleString('en-IN')}
          </div>

          {/* Stock */}
          <div
            className={`kala-details-stock-status ${
              product.available ? 'in-stock' : 'out-of-stock'
            }`}
          >
            <span className="kala-stock-dot">●</span>
            <span>{product.available ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          {/* Short 1-line description */}
          <p className="kala-details-description">{product.description}</p>

          {/* Color Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="kala-details-color-section">
              <span className="kala-section-label">Color</span>
              <div className="kala-details-color-options" role="radiogroup" aria-label="Select color">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.colorName === v.colorName
                  const isWhite =
                    v.colorName.toLowerCase() === 'white' || v.color.toLowerCase() === '#ffffff'
                  return (
                    <button
                      key={v.colorName}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`kala-details-color-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleColorSelect(v)}
                      aria-label={`${v.colorName} color`}
                    >
                      <span
                        className={`kala-details-color-circle ${isSelected ? 'selected' : ''} ${
                          isWhite ? 'is-white' : ''
                        }`}
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="kala-details-color-name">{v.colorName}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="kala-size-section">
            <span className="kala-section-label">SIZE</span>
            <div className="kala-size-options" role="radiogroup" aria-label="Select size">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`kala-size-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {sizeError && <p className="kala-size-error">{sizeError}</p>}
          </div>

          {/* Quantity Selector */}
          <div className="kala-qty-section">
            <span className="kala-section-label">QUANTITY</span>
            <div className="kala-qty-controls" aria-label="Quantity controls">
              <button
                type="button"
                className="kala-qty-btn"
                onClick={handleDecreaseQty}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="kala-qty-value" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="kala-qty-btn"
                onClick={handleIncreaseQty}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Added to Cart Feedback Notification */}
          {addedNotification && (
            <div className="kala-added-banner" role="status">
              <span>✓ Added to cart</span>
              <Link to="/cart" className="kala-view-cart-link">
                View Bag →
              </Link>
            </div>
          )}

          {/* Action Buttons (BUY NOW + ADD TO CART) */}
          <div className="kala-details-actions">
            <div className="kala-details-cta-stack">
              <button
                type="button"
                className="kala-btn kala-btn-primary kala-buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.available}
              >
                BUY NOW
              </button>

              <button
                type="button"
                className="kala-btn kala-btn-secondary kala-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.available}
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Small Actions (Wishlist + Share) */}
          <div className="kala-details-small-actions">
            <button
              type="button"
              className={`kala-small-action-btn ${isWishlisted ? 'active' : ''}`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => toggleWishlist(product.id)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isWishlisted ? 'var(--kala-orange)' : 'none'}
                stroke={isWishlisted ? 'var(--kala-orange)' : 'currentColor'}
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            <button
              type="button"
              className="kala-small-action-btn"
              aria-label="Share product"
              onClick={handleShare}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span>{shareFeedback || 'Share'}</span>
            </button>
          </div>

          {/* Service Row (Pan-India Delivery, Secure Payments, Premium Quality ONLY) */}
          <div className="kala-details-services">
            <div className="kala-service-pill">
              <span className="kala-service-icon" aria-hidden="true">🚚</span>
              <span className="kala-service-text">Pan-India Delivery</span>
            </div>
            <div className="kala-service-pill">
              <span className="kala-service-icon" aria-hidden="true">🛡</span>
              <span className="kala-service-text">Secure Payments</span>
            </div>
            <div className="kala-service-pill">
              <span className="kala-service-icon" aria-hidden="true">★</span>
              <span className="kala-service-text">Premium Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Highlights Section (Clean compact layout for T-Shirts) */}
      {highlights.length > 0 && (
        <section className="kala-product-highlights" aria-labelledby="highlights-heading">
          <h2 id="highlights-heading" className="kala-highlights-title">
            Product Highlights
          </h2>
          <div className="kala-highlights-grid">
            {highlights.map((item) => (
              <div key={item.label} className="kala-highlight-item">
                <span className="kala-highlight-label">{item.label}</span>
                <span className="kala-highlight-value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Ratings Section */}
      <ProductReviewsSection productId={product.id} />
    </main>
  )
}

export default ProductDetails
