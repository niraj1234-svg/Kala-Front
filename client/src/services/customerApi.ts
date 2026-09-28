import { fetchMyOrders, fetchOrderById, type BackendOrder } from './orderApi'

/**
 * Customer Orders API wrapper for customer dashboard and order management
 */
export async function getCustomerOrders(): Promise<BackendOrder[]> {
  return await fetchMyOrders()
}

/**
 * Retrieve single customer order details by order ID
 */
export async function getCustomerOrderDetail(orderId: string): Promise<BackendOrder | null> {
  return await fetchOrderById(orderId)
}

export type { BackendOrder }
