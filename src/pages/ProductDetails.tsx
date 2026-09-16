import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PRODUCTS } from '../data/products'
import type { Product } from '../data/products'
import { fetchProductById } from '../services/productApi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductReviewsSection from '../components/reviews/ProductReviewsSection'
import '../styles/ProductDetails.css'

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState<Product | null>(() => {
    return PRODUCTS.find((p) => p.id === id) || null
  })

  useEffect(() => {
    if (!id) return
    let isMounted = true

    fetchProductById(id).then((liveProduct) => {
      if (isMounted && liveProduct) {
        setProduct(liveProduct)
      }
    })

    return () => {
      isMounted = false
    }
  }, [id])

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [sizeError, setSizeError] = useState<string>('')
  const [addedNotification, setAddedNotification] = useState<boolean>(false)
  const isWishlisted = product ? isInWishlist(product.id) : false

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

  // Handle Quantity adjustments
  const handleIncreaseQty = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Please select a size.')
      return
    }

    setSizeError('')
    addToCart(product, selectedSize, quantity)
    setAddedNotification(true)

    // Reset notification after 4 seconds
    setTimeout(() => {
      setAddedNotification(false)
    }, 4000)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    if (sizeError) {
      setSizeError('')
    }
  }

  return (
    <main className="kala-container kala-details-page">
      {/* Back to Shop Navigation */}
      <Link to="/shop" className="kala-details-back-link">
        ← BACK TO SHOP
      </Link>

      <div className="kala-details-grid">
        {/* Product Image */}
        <div className="kala-details-image-card">
          <img
            src={product.image}
            alt={product.name}
            loading="eager"
          />
        </div>

        {/* Product Information */}
        <div className="kala-details-info">
          <span className="kala-details-category">{product.category}</span>
          <h1 className="kala-details-title">{product.name}</h1>
          <div className="kala-details-price">
            ₹{product.price.toLocaleString('en-IN')}
          </div>

          <div
            className={`kala-details-stock-status ${
              product.available ? 'in-stock' : 'out-of-stock'
            }`}
          >
            <span>●</span>
            <span>{product.available ? 'In Stock — Ready to Dispatch' : 'Out of Stock'}</span>
          </div>

          <p className="kala-details-description">{product.description}</p>

          {/* Size Selector */}
          <div className="kala-size-section">
            <div className="kala-section-label-row">
              <span className="kala-section-label">SIZE</span>
              {selectedSize && (
                <span className="kala-label" style={{ color: 'var(--kala-orange)' }}>
                  Selected: {selectedSize}
                </span>
              )}
            </div>
            <div className="kala-size-options" role="radiogroup" aria-label="Select apparel size">
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
            <div className="kala-section-label-row">
              <span className="kala-section-label">QUANTITY</span>
            </div>
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
              <span>✓ Added {quantity} × {product.name} ({selectedSize}) to cart!</span>
              <Link to="/cart" className="kala-view-cart-link">
                View Bag →
              </Link>
            </div>
          )}

          {/* Action Buttons (Add to Cart + Wishlist) */}
          <div className="kala-details-actions">
            <button
              type="button"
              className="kala-btn kala-btn-primary kala-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              {product.available ? 'ADD TO CART' : 'OUT OF STOCK'}
            </button>

            <button
              type="button"
              className={`kala-details-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              onClick={() => toggleWishlist(product.id)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isWishlisted ? 'var(--kala-orange)' : 'none'}
                stroke={isWishlisted ? 'var(--kala-orange)' : 'currentColor'}
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ProductReviewsSection productId={product.id} />
    </main>
  )
}

export default ProductDetails
