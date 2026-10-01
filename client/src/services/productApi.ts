import { PRODUCTS, getProductImage } from '../data/products'
import type { Product } from '../data/products'
import { API_BASE_URL } from '../config/api'

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

  let resolvedImages: string[] | undefined = undefined
  if (Array.isArray(p.images) && p.images.length > 0) {
    resolvedImages = p.images.map((img: string) => {
      let f = img || ''
      if (f.startsWith('/images/')) {
        f = f.replace('/images/', '')
      }
      return getProductImage(f)
    })
  } else if (p.id === 'ai-data-science-polo-t-shirt') {
    resolvedImages = [
      getProductImage('ai-data-science-polo-front.png'),
      getProductImage('ai-data-science-polo-back.png'),
    ]
  }

  let resolvedVariants = undefined
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    resolvedVariants = p.variants.map((v: any) => {
      let f = v.image || ''
      if (f.startsWith('/images/')) {
        f = f.replace('/images/', '')
      }
      return {
        color: v.color,
        colorName: v.colorName,
        image: getProductImage(f),
      }
    })
  } else if (p.id === 'gymwear-dynamic-stretch-shorts-06') {
    resolvedVariants = [
      {
        color: '#000000',
        colorName: 'Black',
        image: getProductImage('Gymwear06.png'),
      },
      {
        color: '#FFFFFF',
        colorName: 'White',
        image: getProductImage('Gymwear-05.png'),
      },
    ]
  }

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: resolvedImage,
    images: resolvedImages,
    description: p.description,
    available: p.available ?? true,
    variants: resolvedVariants,
    highlights:
      Array.isArray(p.highlights) && p.highlights.length > 0
        ? p.highlights
        : p.id === 'ai-data-science-polo-t-shirt'
          ? [
              { label: 'Collar', value: 'Polo collar' },
              { label: 'Placket', value: '2-button front placket' },
              { label: 'Color', value: 'Light grey' },
              { label: 'Front Print', value: 'Front chest university logo' },
              { label: 'Back Print', value: 'Large AI & Data Science back print' },
              { label: 'Sizes', value: 'S, M, L, XL, XXL' },
            ]
          : undefined,
    customPrintTextEnabled: p.customPrintTextEnabled ?? (p.id === 'kala-bihari-story-premium-t-shirt'),
    customPrintTextPrice: p.customPrintTextPrice ?? 25,
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
      const normalized = data.products
        .filter(
          (item: any) =>
            item.id !== 'gymwear-oversized-pump-cover-05' &&
            item.id !== 'gymwear-seamless-muscle-tank-02'
        )
        .map(normalizeApiProduct)

      // Ensure AI & Data Science Polo T-Shirt is always the FIRST product, followed by KALA Bihari Story Premium T-Shirt
      return normalized.sort((a: Product, b: Product) => {
        if (a.id === 'ai-data-science-polo-t-shirt') return -1
        if (b.id === 'ai-data-science-polo-t-shirt') return 1
        if (a.id === 'kala-bihari-story-premium-t-shirt') return -1
        if (b.id === 'kala-bihari-story-premium-t-shirt') return 1
        return 0
      })
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
  const targetId = id === 'gymwear-oversized-pump-cover-05' ? 'gymwear-dynamic-stretch-shorts-06' : id
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(targetId)}`, {
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
    console.warn(`[ProductApi] Single product fetch for '${targetId}' failed, using local fallback:`, error)
    return PRODUCTS.find((p) => p.id === targetId) || null
  }
}
