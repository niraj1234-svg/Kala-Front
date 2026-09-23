import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product, ProductColorVariant } from '../data/products'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { flyToCart } from '../utils/cartAnimation'
import ProductRatingBadge from './ProductRatingBadge'
import '../styles/ProductCard.css'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const isWishlisted = isInWishlist(product.id)

  const imageRef = useRef<HTMLImageElement>(null)

  const [selectedVariant, setSelectedVariant] = useState<ProductColorVariant | null>(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null
  })

  const [displayedImage, setDisplayedImage] = useState<string>(
    product.variants && product.variants.length > 0 ? product.variants[0].image : product.image
  )

  const [isFading, setIsFading] = useState<boolean>(false)
  const [isBursting, setIsBursting] = useState<boolean>(false)

  // Sync state if product prop changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant((prev) => {
        if (!prev) return product.variants![0]
        const match = product.variants!.find((v) => v.colorName === prev.colorName)
        return match || product.variants![0]
      })
    } else {
      setSelectedVariant(null)
    }
  }, [product])

  useEffect(() => {
    if (selectedVariant) {
      setDisplayedImage(selectedVariant.image)
    } else {
      setDisplayedImage(product.image)
    }
  }, [product.image, selectedVariant])

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const willAdd = !isWishlisted
    toggleWishlist(product.id)
    if (willAdd) {
      setIsBursting(true)
      setTimeout(() => setIsBursting(false), 550)
    }
  }

  const handleVariantClick = (e: React.MouseEvent, variant: ProductColorVariant) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedVariant?.colorName === variant.colorName) return

    setIsFading(true)
    setTimeout(() => {
      setSelectedVariant(variant)
      setDisplayedImage(variant.image)
      setIsFading(false)
    }, 120)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.available) return

    const cartProduct = {
      id: product.id,
      name: product.name,
      image: selectedVariant?.image || displayedImage || product.image,
      price: product.price,
    }

    // Step 1: Existing Add to Cart functionality executes normally
    addToCart(cartProduct, 'M', 1)

    // Step 2 & 3: Animate cloned product image toward Navbar cart icon
    flyToCart({
      sourceElement: imageRef.current,
      imageSrc: cartProduct.image,
      productName: product.name,
    })
  }

  const productUrl = selectedVariant
    ? `/product/${product.id}?color=${encodeURIComponent(selectedVariant.colorName)}`
    : `/product/${product.id}`

  return (
    <article className="kala-product-card">
      <Link to={productUrl} className="kala-product-link">
        <div className="kala-product-image-wrap">
          <img
            ref={imageRef}
            src={displayedImage}
            alt={`${product.name}${selectedVariant ? ` - ${selectedVariant.colorName}` : ''}`}
            className={`kala-product-image ${isFading ? 'is-fading' : ''}`}
            loading="lazy"
          />
          <ProductRatingBadge productId={product.id} productName={product.name} />
          <button
            type="button"
            className={`kala-card-wishlist-btn ${isWishlisted ? 'active' : ''} ${isBursting ? 'burst' : ''}`}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleWishlistClick}
          >
            <svg
              className="kala-wishlist-heart-svg"
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
            {isBursting && (
              <span className="kala-heart-particles" aria-hidden="true">
                <span className="kala-heart-particle p1">
                  <svg viewBox="0 0 24 24" width="8" height="8" fill="var(--kala-orange)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
                <span className="kala-heart-particle p2">
                  <svg viewBox="0 0 24 24" width="7" height="7" fill="var(--kala-orange)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
                <span className="kala-heart-particle p3">
                  <svg viewBox="0 0 24 24" width="6" height="6" fill="var(--kala-orange)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
              </span>
            )}
          </button>
          {!product.available && (
            <span className="kala-card-badge sold-out">Out of Stock</span>
          )}
        </div>

        <div className="kala-product-info">
          <span className="kala-product-category">{product.category}</span>
          <h3 className="kala-product-name">{product.name}</h3>

          {/* Color Variant Swatches */}
          {product.variants && product.variants.length > 0 && (
            <div
              className="kala-card-swatches"
              role="radiogroup"
              aria-label="Color options"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
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
                    className={`kala-card-swatch ${isSelected ? 'selected' : ''} ${
                      isWhite ? 'swatch-white' : ''
                    }`}
                    style={{ backgroundColor: v.color }}
                    onClick={(e) => handleVariantClick(e, v)}
                    aria-label={`Select ${v.colorName} color`}
                    title={v.colorName}
                  />
                )
              })}
            </div>
          )}

          <div className="kala-product-price-row">
            <span className="kala-product-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.available ? (
              <button
                type="button"
                className="kala-card-cart-btn"
                aria-label={`Add ${product.name} to cart`}
                title="Add to cart"
                onClick={handleAddToCartClick}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </button>
            ) : (
              <span className="kala-product-status">Sold Out</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

export default ProductCard
