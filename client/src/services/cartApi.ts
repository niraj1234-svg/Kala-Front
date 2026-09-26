import { API_BASE_URL } from '../config/api'
import { getAuthToken } from './authApi'

export interface ServerCartItem {
  _id?: string
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
  customization?: {
    backText?: string
    price?: number
  }
}

export interface ServerCartResponse {
  success: boolean
  message?: string
  cart: {
    items: ServerCartItem[]
    count: number
    subtotal: number
  }
}

/**
 * Fetches the authenticated customer's cart from GET /api/cart
 */
export async function fetchServerCart(): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      if (res.status === 401) return null
      throw new Error(`Failed to fetch cart: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:fetchServerCart] Error:', err)
    return null
  }
}

/**
 * Adds an item to the authenticated customer's cart via POST /api/cart/items
 */
export async function addServerCartItem(item: {
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
  customization?: {
    backText?: string
    price?: number
  }
}): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    })

    if (!res.ok) {
      throw new Error(`Failed to add cart item: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:addServerCartItem] Error:', err)
    return null
  }
}

/**
 * Updates the quantity of an item via PATCH /api/cart/items/:itemId
 */
export async function updateServerCartItemQty(
  productId: string,
  size: string,
  quantity: number,
  backText?: string
): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const compositeId = backText ? `${productId}:${size}:${backText}` : `${productId}:${size}`
    const res = await fetch(`${API_BASE_URL}/cart/items/${encodeURIComponent(compositeId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity, size, backText }),
    })

    if (!res.ok) {
      throw new Error(`Failed to update cart item: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:updateServerCartItemQty] Error:', err)
    return null
  }
}

/**
 * Removes an item from the cart via DELETE /api/cart/items/:itemId
 */
export async function removeServerCartItem(
  productId: string,
  size: string,
  backText?: string
): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const compositeId = backText ? `${productId}:${size}:${backText}` : `${productId}:${size}`
    const queryParams = new URLSearchParams({ size })
    if (backText) queryParams.set('backText', backText)

    const res = await fetch(
      `${API_BASE_URL}/cart/items/${encodeURIComponent(compositeId)}?${queryParams.toString()}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to remove cart item: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:removeServerCartItem] Error:', err)
    return null
  }
}

/**
 * Clears the entire customer cart via DELETE /api/cart
 */
export async function clearServerCart(): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to clear cart: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:clearServerCart] Error:', err)
    return null
  }
}

/**
 * Replaces the cart on the server via PUT /api/cart
 */
export async function syncServerCart(
  items: ServerCartItem[]
): Promise<ServerCartResponse | null> {
  const token = getAuthToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    })

    if (!res.ok) {
      throw new Error(`Failed to sync cart: HTTP ${res.status}`)
    }

    const data: ServerCartResponse = await res.json()
    return data
  } catch (err) {
    console.warn('[cartApi:syncServerCart] Error:', err)
    return null
  }
}
