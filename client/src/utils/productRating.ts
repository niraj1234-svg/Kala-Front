/**
 * Temporary mock rating and purchase count utilities for product cards.
 * Provides deterministic values derived from product ID / name so numbers
 * remain stable and realistic across re-renders and refreshes.
 *
 * Designed to be easily replaced by backend review & purchase statistics in the future.
 */

export interface ProductRatingMetric {
  rating: number | string
  purchaseCount: string
}

// Stable deterministic mappings matching reference designs & catalog
const PRODUCT_METRIC_MAP: Record<string, ProductRatingMetric> = {
  // AI & Data Science Polo T-Shirt (User specified: only buyers 60 and 5 stars)
  'ai-data-science-polo-t-shirt': { rating: 5, purchaseCount: '60' },

  // KALA Bihari Story Premium T-Shirt
  'kala-bihari-story-premium-t-shirt': { rating: 4.8, purchaseCount: '92' },

  // Streetwear (buyers strictly below 100, ratings between 3.9 and 5.0)
  'streetwear-oversized-acid-tee': { rating: 4.5, purchaseCount: '78' },
  'streetwear-heavyweight-hoodie-onyx': { rating: 4.7, purchaseCount: '64' },
  'streetwear-tactical-cargo-pant': { rating: 4.3, purchaseCount: '85' },
  'streetwear-vintage-wash-tee': { rating: 4.1, purchaseCount: '52' },
  'streetwear-monochrome-sweatshirt': { rating: 4.6, purchaseCount: '89' },
  'streetwear-distressed-urban-tee': { rating: 4.4, purchaseCount: '73' },

  // Gaming (buyers strictly below 100, ratings between 3.9 and 5.0)
  'gaming-cyber-pro-jersey-01': { rating: 4.6, purchaseCount: '67' },
  'gaming-stealth-tactical-hoodie-02': { rating: 4.8, purchaseCount: '94' },
  'gaming-neon-overload-tee-03': { rating: 4.2, purchaseCount: '58' },
  'gaming-pro-arena-warmup-04': { rating: 4.7, purchaseCount: '81' },
  'gaming-shadow-spec-ops-tee-05': { rating: 3.9, purchaseCount: '46' },

  // Gymwear (buyers strictly below 100, ratings between 3.9 and 5.0)
  'gymwear-performance-compression-tee-01': { rating: 4.8, purchaseCount: '87' },
  'gymwear-seamless-muscle-tank-02': { rating: 4.3, purchaseCount: '69' },
  'gymwear-tapered-jogger-03': { rating: 4.5, purchaseCount: '74' },
  'gymwear-endurance-dryfit-tee-04': { rating: 4.1, purchaseCount: '55' },
  'gymwear-oversized-pump-cover-05': { rating: 4.9, purchaseCount: '96' },
  'gymwear-dynamic-stretch-shorts-06': { rating: 4.4, purchaseCount: '63' },
  'gymwear-athletic-shorts-06': { rating: 4.0, purchaseCount: '51' },
  'gymwear-stringer-vest-07': { rating: 4.2, purchaseCount: '70' },
  'gymwear-power-lifting-tee-08': { rating: 4.7, purchaseCount: '83' },
  'gymwear-runner-windbreaker-09': { rating: 4.5, purchaseCount: '90' },
}

const DETERMINISTIC_PURCHASE_COUNTS = [
  '78',
  '64',
  '85',
  '52',
  '89',
  '73',
  '67',
  '94',
  '58',
  '81',
  '46',
  '87',
  '69',
  '74',
  '55',
  '96',
  '63',
  '90',
]

/**
 * Returns a stable rating and purchase count for any product.
 * Easily accepts real backend values if available.
 */
export function getProductRatingInfo(
  productId?: string,
  productName?: string,
  realRating?: number,
  realReviews?: number
): ProductRatingMetric {
  const idKey = (productId || '').toLowerCase().trim()
  const nameKey = (productName || '').toLowerCase().trim()

  // SPECIAL EXPLICIT RULE: The user-provided AI & Data Science Polo T-Shirt always has 5 stars and 60 buyers
  if (
    idKey === 'ai-data-science-polo-t-shirt' ||
    nameKey.includes('ai & data science') ||
    nameKey.includes('data science polo')
  ) {
    return {
      rating: 5,
      purchaseCount: '60',
    }
  }

  // If real rating & reviews exist from backend in future, use them directly
  if (typeof realRating === 'number' && typeof realReviews === 'number' && realReviews > 0) {
    const clampedRating = Math.max(3.9, Math.min(5, +realRating.toFixed(1)))
    const compactCount = String(Math.min(99, Math.max(1, realReviews)))
    return {
      rating: clampedRating,
      purchaseCount: compactCount,
    }
  }

  // 1. Direct ID lookup in authoritative metric map
  if (idKey && PRODUCT_METRIC_MAP[idKey]) {
    return PRODUCT_METRIC_MAP[idKey]
  }

  // 2. Fallback deterministic hash algorithm based on product ID / name string
  // Generates ratings between 3.9 and 5.0 and buyers strictly below 100
  const str = idKey || nameKey || 'kala-product'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const absHash = Math.abs(hash)
  const ratingSpread = [3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]
  const randomRating = ratingSpread[absHash % ratingSpread.length]
  const randomBuyers = DETERMINISTIC_PURCHASE_COUNTS[absHash % DETERMINISTIC_PURCHASE_COUNTS.length]

  return {
    rating: randomRating,
    purchaseCount: randomBuyers,
  }
}
