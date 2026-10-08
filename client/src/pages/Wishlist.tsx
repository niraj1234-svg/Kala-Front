import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import '../styles/Wishlist.css'

export const Wishlist: React.FC = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist()

  if (wishlistCount === 0) {
    return (
      <main className="kala-container kala-wishlist-page">
        <div className="kala-wishlist-empty">
          <h1 className="kala-wishlist-empty-title">YOUR WISHLIST IS EMPTY</h1>
          <p className="kala-wishlist-empty-desc">
            Save products you love and find them here later.
          </p>
          <Link to="/shop" className="kala-btn kala-btn-primary">
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="kala-container kala-wishlist-page">
      <header className="kala-wishlist-header">
        <h1 className="kala-h1 kala-wishlist-title-main">
          WISHLIST
        </h1>
        <span className="kala-label kala-wishlist-count-badge">
          {wishlistCount} {wishlistCount === 1 ? 'SAVED ITEM' : 'SAVED ITEMS'}
        </span>
      </header>

      <div className="kala-wishlist-grid" role="list">
        {wishlistItems.map((product) => (
          <article key={product.id} className="kala-wishlist-card" role="listitem">
            <div className="kala-wishlist-img-wrap">
              <Link to={`/product/${product.id}`} className="kala-wishlist-img-link" tabIndex={-1}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="kala-wishlist-img"
                  loading="lazy"
                />
              </Link>
              <button
                type="button"
                className="kala-wishlist-remove-btn"
                onClick={() => removeFromWishlist(product.id)}
                aria-label={`Remove ${product.name} from wishlist`}
                title="Remove from wishlist"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="kala-wishlist-content">
              <span className="kala-wishlist-category">{product.category}</span>
              <h2 className="kala-wishlist-title" title={product.name}>
                <Link to={`/product/${product.id}`} className="kala-wishlist-title-link">
                  {product.name}
                </Link>
              </h2>
              <div className="kala-wishlist-meta-row">
                <span className="kala-wishlist-price">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span
                  className={`kala-wishlist-stock ${
                    product.available ? 'in-stock' : 'out-of-stock'
                  }`}
                >
                  ● {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="kala-wishlist-card-actions">
                <Link
                  to={`/product/${product.id}`}
                  className="kala-btn kala-wishlist-action-btn primary"
                >
                  <span className="kala-wishlist-btn-text">SELECT SIZE & ADD TO CART</span>
                </Link>
                <Link
                  to={`/product/${product.id}`}
                  className="kala-btn kala-wishlist-action-btn secondary"
                >
                  VIEW PRODUCT
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export default Wishlist
