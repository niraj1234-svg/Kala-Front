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
  // Streetwear
  'streetwear-oversized-acid-tee': { rating: 4, purchaseCount: '4.6k' },
  'streetwear-heavyweight-hoodie-onyx': { rating: 4, purchaseCount: '3.2k' },
  'streetwear-tactical-cargo-pant': { rating: 4, purchaseCount: '5.1k' },
  'streetwear-vintage-wash-tee': { rating: 4, purchaseCount: '2.8k' },
  'streetwear-monochrome-sweatshirt': { rating: 4, purchaseCount: '4.1k' },
  'streetwear-distressed-urban-tee': { rating: 4, purchaseCount: '3.7k' },

  // Gaming
  'gaming-cyber-pro-jersey-01': { rating: 4, purchaseCount: '2.9k' },
  'gaming-stealth-tactical-hoodie-02': { rating: 4, purchaseCount: '6.3k' },
  'gaming-neon-overload-tee-03': { rating: 4, purchaseCount: '3.5k' },
  'gaming-pro-arena-warmup-04': { rating: 4, purchaseCount: '4.8k' },
  'gaming-shadow-spec-ops-tee-05': { rating: 4, purchaseCount: '2.4k' },

  // Gymwear
  'gymwear-performance-compression-tee-01': { rating: 4, purchaseCount: '5.2k' },
  'gymwear-seamless-muscle-tank-02': { rating: 4, purchaseCount: '3.8k' },
  'gymwear-tapered-jogger-03': { rating: 4, purchaseCount: '4.4k' },
  'gymwear-endurance-dryfit-tee-04': { rating: 4, purchaseCount: '3.1k' },
  'gymwear-oversized-pump-cover-05': { rating: 4, purchaseCount: '4.9k' },
  'gymwear-dynamic-stretch-shorts-06': { rating: 4, purchaseCount: '2.8k' },
  'gymwear-athletic-shorts-06': { rating: 4, purchaseCount: '2.7k' },
  'gymwear-stringer-vest-07': { rating: 4, purchaseCount: '3.6k' },
  'gymwear-power-lifting-tee-08': { rating: 4, purchaseCount: '4.3k' },
  'gymwear-runner-windbreaker-09': { rating: 4, purchaseCount: '5.0k' },
}

const DETERMINISTIC_PURCHASE_COUNTS = [
  '4.6k',
  '3.2k',
  '5.1k',
  '2.8k',
  '4.1k',
  '3.7k',
  '2.9k',
  '6.3k',
  '3.5k',
  '4.8k',
  '5.4k',
  '3.9k',
  '4.2k',
  '5.8k',
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
  // If real rating & reviews exist from backend in future, use them directly
  if (typeof realRating === 'number' && typeof realReviews === 'number' && realReviews > 0) {
    const compactCount =
      realReviews >= 1000 ? `${(realReviews / 1000).toFixed(1)}k` : `${realReviews}`
    return {
      rating: Math.round(realRating) || 4,
      purchaseCount: compactCount,
    }
  }

  const idKey = (productId || '').toLowerCase().trim()

  // 1. Direct ID lookup
  if (idKey && PRODUCT_METRIC_MAP[idKey]) {
    return PRODUCT_METRIC_MAP[idKey]
  }

  // 2. Keyword matching on name for items matching visual references
  const nameKey = (productName || '').toLowerCase()
  if (nameKey.includes('striped') || nameKey.includes('acid-wash')) {
    return { rating: 4, purchaseCount: '4.6k' }
  }
  if (nameKey.includes('good things') || nameKey.includes('boxy hoodie')) {
    return { rating: 4, purchaseCount: '3.2k' }
  }
  if (nameKey.includes('minimal') || nameKey.includes('cargo')) {
    return { rating: 4, purchaseCount: '5.1k' }
  }
  if (nameKey.includes('discipline') || nameKey.includes('vintage')) {
    return { rating: 4, purchaseCount: '2.8k' }
  }
  if (nameKey.includes('same people') || nameKey.includes('crewneck')) {
    return { rating: 4, purchaseCount: '4.1k' }
  }
  if (nameKey.includes('performance') || nameKey.includes('distressed')) {
    return { rating: 4, purchaseCount: '3.7k' }
  }
  if (nameKey.includes('urban drift') || nameKey.includes('cyber')) {
    return { rating: 4, purchaseCount: '2.9k' }
  }
  if (nameKey.includes('essential hoodie') || nameKey.includes('stealth')) {
    return { rating: 4, purchaseCount: '6.3k' }
  }

  // 3. Fallback deterministic hash algorithm based on product ID / name string
  const str = idKey || nameKey || 'kala-product'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % DETERMINISTIC_PURCHASE_COUNTS.length
  return {
    rating: 4,
    purchaseCount: DETERMINISTIC_PURCHASE_COUNTS[index],
  }
}
