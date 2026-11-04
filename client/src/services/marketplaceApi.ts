import { API_BASE_URL } from '../config/api'
import type { MarketplaceProduct, VendorShop } from '../types/marketplace'

export interface FetchMarketplaceProductsParams {
  q?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
}

export interface MarketplaceProductsResponse {
  success: boolean
  products: MarketplaceProduct[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
}

export interface MarketplaceVendorsResponse {
  success: boolean
  shops: VendorShop[]
  count: number
  message?: string
}

export interface ShopBySlugResponse {
  success: boolean
  shop: VendorShop
  vendor: {
    businessName: string
    category: string
    city: string
    state: string
  }
  products: MarketplaceProduct[]
  message?: string
}

export async function fetchMarketplaceProducts(
  params?: FetchMarketplaceProductsParams
): Promise<MarketplaceProductsResponse> {
  const query = new URLSearchParams()
  if (params?.q) query.append('q', params.q)
  if (params?.category) query.append('category', params.category)
  if (params?.sort) query.append('sort', params.sort)
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/marketplace/products${queryString}`)
  if (!response.ok) {
    throw new Error('Failed to load marketplace products.')
  }
  return response.json()
}

export async function fetchMarketplaceVendors(): Promise<MarketplaceVendorsResponse> {
  const response = await fetch(`${API_BASE_URL}/marketplace/vendors`)
  if (!response.ok) {
    throw new Error('Failed to load marketplace vendor shops.')
  }
  return response.json()
}

export async function fetchShopBySlug(slug: string): Promise<ShopBySlugResponse> {
  const response = await fetch(`${API_BASE_URL}/shops/${encodeURIComponent(slug)}`)
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to load vendor storefront.')
  }
  return data
}
