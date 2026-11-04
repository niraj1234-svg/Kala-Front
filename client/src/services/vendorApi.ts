import { API_BASE_URL } from '../config/api'
import { getAuthToken } from './authApi'
import type {
  VendorProfile,
  VendorShop,
  MarketplaceProduct,
  VendorStatus,
  VendorStats,
  VendorOrder,
} from '../types/marketplace'

function getHeaders(): HeadersInit {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export interface VendorRegisterPayload {
  fullName?: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  password: string
  businessName: string
  category: string
  description?: string
  businessEmail?: string
  businessPhone?: string
  city: string
  state: string
  address?: string
}

export async function registerVendor(payload: VendorRegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/vendors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Vendor registration failed.')
  }
  return data
}

export async function getVendorMe(): Promise<{
  success: boolean
  user: any
  vendorProfile: VendorProfile | null
  shop: VendorShop | null
  message?: string
}> {
  const response = await fetch(`${API_BASE_URL}/vendors/me`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch vendor profile.')
  }
  return data
}

export async function getVendorStatus(): Promise<{
  success: boolean
  status: VendorStatus
  businessName?: string
  category?: string
  message?: string
}> {
  const response = await fetch(`${API_BASE_URL}/vendors/me/status`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to check vendor status.')
  }
  return data
}

export async function updateVendorProfile(payload: Partial<VendorProfile>) {
  const response = await fetch(`${API_BASE_URL}/vendors/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update vendor profile.')
  }
  return data
}

export async function createVendorShop(payload: Partial<VendorShop>) {
  const response = await fetch(`${API_BASE_URL}/vendor/shop`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create shop.')
  }
  return data
}

export async function getVendorShop(): Promise<{
  success: boolean
  shop: VendorShop
  message?: string
}> {
  const response = await fetch(`${API_BASE_URL}/vendor/shop`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve shop.')
  }
  return data
}

export async function updateVendorShop(payload: Partial<VendorShop>) {
  const response = await fetch(`${API_BASE_URL}/vendor/shop`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update shop.')
  }
  return data
}

export async function getVendorProducts(): Promise<{
  success: boolean
  products: MarketplaceProduct[]
  count: number
  message?: string
}> {
  const response = await fetch(`${API_BASE_URL}/vendor/products`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve vendor products.')
  }
  return data
}

export async function createVendorProduct(payload: Partial<MarketplaceProduct>) {
  const response = await fetch(`${API_BASE_URL}/vendor/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create product.')
  }
  return data
}

export async function updateVendorProduct(id: string, payload: Partial<MarketplaceProduct>) {
  const response = await fetch(`${API_BASE_URL}/vendor/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update product.')
  }
  return data
}

export async function deleteVendorProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/vendor/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete product.')
  }
  return data
}

export async function getVendorStats(): Promise<{
  success: boolean
  stats: VendorStats
  recentOrders?: any[]
  message?: string
}> {
  const response = await fetch(`${API_BASE_URL}/vendor/stats`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve vendor stats.')
  }
  return data
}

export async function getVendorOrders(params?: { status?: string; search?: string }): Promise<{
  success: boolean
  orders: VendorOrder[]
  count: number
  message?: string
}> {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  if (params?.search) query.append('search', params.search)
  const queryString = query.toString() ? `?${query.toString()}` : ''

  const response = await fetch(`${API_BASE_URL}/vendor/orders${queryString}`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve vendor orders.')
  }
  return data
}

export async function updateVendorOrderStatus(
  orderId: string,
  payload: { status?: string; trackingNumber?: string; carrier?: string }
) {
  const response = await fetch(`${API_BASE_URL}/vendor/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update order status.')
  }
  return data
}

export async function toggleVendorProductStatus(id: string) {
  const response = await fetch(`${API_BASE_URL}/vendor/products/${encodeURIComponent(id)}/toggle-status`, {
    method: 'PUT',
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to toggle product status.')
  }
  return data
}

export async function getVendorAnalytics(params?: { period?: string; startDate?: string; endDate?: string }): Promise<{
  success: boolean
  timeline: any[]
  bestSellers: any[]
  recentTransactions: any[]
  summary: {
    grossSales: number
    netEarnings: number
    ordersCount: number
    productsSold: number
    commissionRate: number
  }
}> {
  const query = new URLSearchParams()
  if (params?.period) query.append('period', params.period)
  if (params?.startDate) query.append('startDate', params.startDate)
  if (params?.endDate) query.append('endDate', params.endDate)
  const qs = query.toString() ? `?${query.toString()}` : ''

  const response = await fetch(`${API_BASE_URL}/vendor/analytics${qs}`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve vendor analytics.')
  }
  return data
}

export async function getVendorTransactions(params?: { type?: string; limit?: number }) {
  const query = new URLSearchParams()
  if (params?.type) query.append('type', params.type)
  if (params?.limit) query.append('limit', String(params.limit))
  const qs = query.toString() ? `?${query.toString()}` : ''

  const response = await fetch(`${API_BASE_URL}/vendor/transactions${qs}`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve transactions.')
  }
  return data
}

export async function getVendorPayouts() {
  const response = await fetch(`${API_BASE_URL}/vendor/payouts`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to retrieve payouts.')
  }
  return data
}

export async function requestVendorPayout(payload: { amount: number; bankDetails?: any }) {
  const response = await fetch(`${API_BASE_URL}/vendor/payouts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to request payout.')
  }
  return data
}

export async function downloadVendorSalesReport() {
  const response = await fetch(`${API_BASE_URL}/vendor/reports/download`, {
    headers: getHeaders(),
  })
  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate sales report.')
  }
  return data
}
