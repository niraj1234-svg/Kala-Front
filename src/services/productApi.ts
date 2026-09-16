import { PRODUCTS, getProductImage } from '../data/products'
import type { Product } from '../data/products'

const API_BASE_URL = 'http://localhost:5000/api'

/**
 * Normalizes a product returned from the Express / MongoDB API
 * ensuring its image is properly resolved by Vite's asset pipeline.
 */
function normalizeApiProduct(p: any): Product {
  // If the image is a filename (e.g. "Streetwear 01.png" or "/images/..."), resolve through getProductImage
  let filename = p.image || ''
  if (filename.startsWith('/images/')) {
    filename = filename.replace('/images/', '')
  }

  const resolvedImage = getProductImage(filename)

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: resolvedImage,
    description: p.description,
    available: p.available ?? true,
  }
}

/**
 * Fetches all products from the Express API (backed by MongoDB Atlas).
 * If the API is unreachable, gracefully falls back to the static catalog.
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  try {
    const url = new URL(`${API_BASE_URL}/products`)
    if (category && category !== 'All') {
      url.searchParams.set('category', category)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    if (data && Array.isArray(data.products)) {
      return data.products.map(normalizeApiProduct)
    }

    throw new Error('Unexpected API response format')
  } catch (error) {
    console.warn('[ProductApi] Express API fetch failed, using local product catalog fallback:', error)
    if (category && category !== 'All') {
      return PRODUCTS.filter((p) => p.category === category)
    }
    return PRODUCTS
  }
}

/**
 * Fetches a single product by its ID from the Express API.
 * Falls back to local catalog if the API is offline.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    if (data && data.product) {
      return normalizeApiProduct(data.product)
    }

    return null
  } catch (error) {
    console.warn(`[ProductApi] Single product fetch for '${id}' failed, using local fallback:`, error)
    return PRODUCTS.find((p) => p.id === id) || null
  }
}
