import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { useWishlist } from '../context/WishlistContext'
import ProductRatingBadge from './ProductRatingBadge'
import '../styles/ProductCard.css'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <article className="kala-product-card">
      <Link to={`/product/${product.id}`} className="kala-product-link">
        <div className="kala-product-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="kala-product-image"
            loading="lazy"
          />
          <ProductRatingBadge productId={product.id} productName={product.name} />
          <button
            type="button"
            className={`kala-card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleWishlistClick}
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
          </button>
          {!product.available && (
            <span className="kala-card-badge sold-out">Out of Stock</span>
          )}
        </div>

        <div className="kala-product-info">
          <span className="kala-product-category">{product.category}</span>
          <h3 className="kala-product-name">{product.name}</h3>
          <div className="kala-product-price-row">
            <span className="kala-product-price">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="kala-product-status">
              {product.available ? 'In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default ProductCard
