import React from 'react'
import { getProductRatingInfo } from '../utils/productRating'
import '../styles/ProductRatingBadge.css'

interface ProductRatingBadgeProps {
  productId: string
  productName?: string
  rating?: number | string
  purchaseCount?: string
  className?: string
}

export const ProductRatingBadge: React.FC<ProductRatingBadgeProps> = ({
  productId,
  productName,
  rating: overrideRating,
  purchaseCount: overrideCount,
  className = '',
}) => {
  const metric = getProductRatingInfo(productId, productName)
  const displayRating = overrideRating ?? metric.rating
  const displayCount = overrideCount ?? metric.purchaseCount

  return (
    <div
      className={`kala-rating-badge ${className}`}
      aria-label={`Rated ${displayRating} stars with ${displayCount} purchases`}
    >
      <span className="kala-rating-score">{displayRating}</span>
      <svg
        className="kala-rating-star"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="#0d9488"
        stroke="#0d9488"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="kala-rating-divider" aria-hidden="true">
        |
      </span>
      <span className="kala-rating-count">{displayCount}</span>
    </div>
  )
}

export default ProductRatingBadge
