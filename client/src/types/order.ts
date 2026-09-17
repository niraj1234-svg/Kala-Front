export interface CustomerInformation {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ShippingAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pinCode: string
}

export interface OrderItem {
  productId: string
  name: string
  size: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  orderId: string
  createdAt: string
  customer: CustomerInformation
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: 'confirmed' | 'processing'
}

const ORDERS_STORAGE_KEY = 'kala_orders'

export function getSavedOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to retrieve orders from localStorage:', err)
  }
  return []
}

export function saveOrder(order: Order): void {
  try {
    const orders = getSavedOrders()
    // Append order to array without overwriting previous orders
    const updated = [order, ...orders.filter((o) => o.orderId !== order.orderId)]
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save order to localStorage:', err)
  }
}

export function getOrderById(orderId: string): Order | undefined {
  const orders = getSavedOrders()
  return orders.find((o) => o.orderId.toUpperCase() === orderId.toUpperCase())
}

export function generateOrderId(): string {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-2026-${randomStr}`
}
