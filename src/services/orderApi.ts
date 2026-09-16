import { getAuthToken } from './authApi'

const API_BASE_URL = 'http://localhost:5000/api'

export interface OrderItemInput {
  productId: string
  size: string
  quantity: number
}

export interface ValidateCouponPayload {
  code: string
  items: OrderItemInput[]
}

export interface ValidateCouponResponse {
  success: boolean
  coupon: {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
  }
  pricing: {
    subtotal: number
    discount: number
    shipping: number
    total: number
  }
  message?: string
}

export interface CreateOrderPayload {
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    pincode: string
  }
  items: OrderItemInput[]
  couponCode?: string
}

export interface BackendOrderItem {
  productId: string
  name: string
  image: string
  size: string
  quantity: number
  price: number
}

export interface BackendOrder {
  orderId: string
  userId?: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    pincode: string
  }
  items: BackendOrderItem[]
  pricing: {
    subtotal: number
    discount?: number
    shipping: number
    total: number
  }
  coupon?: {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountAmount: number
  }
  status: string
  createdAt: string
  updatedAt?: string
}

export interface CreateOrderResponse {
  success: boolean
  orderId: string
  order: BackendOrder
  message: string
}

export interface MyOrdersResponse {
  success: boolean
  count: number
  orders: BackendOrder[]
  message?: string
}

/**
 * Sends order creation request to backend Express API (backed by MongoDB Atlas)
 */
export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || 'Unable to place your order right now. Please try again.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Order placement timed out. Please check your connection and try again.')
    }
    // Clean user-friendly message, no leaked secrets or raw Mongo errors
    throw new Error(err.message || 'Unable to place your order right now. Please try again.')
  }
}

/**
 * Validates a coupon code against cart items using backend API.
 * Uses customer token (kala_auth_token) if authenticated; allows guests.
 * Does NOT use admin token.
 */
export async function validateCoupon(
  payload: ValidateCouponPayload
): Promise<ValidateCouponResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || 'Invalid coupon code.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Coupon validation timed out. Please try again.')
    }
    throw new Error(err.message || 'Unable to validate coupon.')
  }
}

/**
 * Fetches order history for the currently authenticated customer from backend Express API
 */
export async function fetchMyOrders(): Promise<BackendOrder[]> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required to view orders.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data: MyOrdersResponse = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || `Failed to retrieve orders (${response.status})`
      throw new Error(errorMessage)
    }

    return Array.isArray(data.orders) ? data.orders : []
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Orders request timed out. Please check your connection and try again.')
    }
    throw new Error(err.message || 'Unable to retrieve your orders. Please try again.')
  }
}

/**
 * Fetches order by orderId from backend Express API
 */
export async function fetchOrderById(orderId: string): Promise<BackendOrder | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.status === 404) {
      const err: any = new Error(`Order not found with ID '${orderId}'`)
      err.status = 404
      throw err
    }

    if (response.status === 403) {
      const err: any = new Error('Access denied: You do not have permission to view this order.')
      err.status = 403
      throw err
    }

    if (response.status === 401) {
      const err: any = new Error('Authentication required.')
      err.status = 401
      throw err
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.message || `Failed to fetch order details (${response.status})`
      const err: any = new Error(errorMessage)
      err.status = response.status
      throw err
    }

    const data = await response.json()
    if (data.success && data.order) {
      return data.order
    }

    return null
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      const timeoutErr: any = new Error('Order lookup timed out. Please check your connection.')
      timeoutErr.status = 408
      throw timeoutErr
    }
    if (err.status) {
      throw err
    }
    console.warn(`[OrderApi] Could not fetch order ${orderId}:`, err.message)
    throw err
  }
}
