const API_BASE_URL = 'http://localhost:5000/api'

export interface OrderItemInput {
  productId: string
  size: string
  quantity: number
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
    shipping: number
    total: number
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

/**
 * Sends order creation request to backend Express API (backed by MongoDB Atlas)
 */
export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
 * Fetches order by orderId from backend Express API
 */
export async function fetchOrderById(orderId: string): Promise<BackendOrder | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch order details (${response.status})`)
    }

    const data = await response.json()
    if (data.success && data.order) {
      return data.order
    }

    return null
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.warn(`[OrderApi] Could not fetch order ${orderId}:`, err.message)
    return null
  }
}
