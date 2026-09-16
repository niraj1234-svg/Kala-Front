import { Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import { Order, IOrder, OrderStatus } from '../models/Order'

const ALLOWED_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

/**
 * GET /api/admin/orders
 * Retrieves all orders with pagination, status filtering, and search.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : ''
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const filter: FilterQuery<IOrder> = {}

    // Status filter
    if (statusQuery && ALLOWED_ORDER_STATUSES.includes(statusQuery as OrderStatus)) {
      filter.status = statusQuery as OrderStatus
    }

    // Search query across orderId and customer details
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { orderId: regex },
        { 'customer.email': regex },
        { 'customer.phone': regex },
        { 'customer.firstName': regex },
        { 'customer.lastName': regex },
      ]
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminOrderController] getAdminOrders error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving administrative order list.',
    })
  }
}

/**
 * GET /api/admin/orders/:orderId
 * Retrieves any single order by orderId without customer ownership restriction.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Order ID is required.',
      })
      return
    }

    const order = await Order.findOne({ orderId: orderId.trim() })

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminOrderController] getAdminOrderById error:',
      error instanceof Error ? error.message : 'Unknown lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving order details.',
    })
  }
}

/**
 * PATCH /api/admin/orders/:orderId/status
 * Updates the order lifecycle status.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Order ID is required.',
      })
      return
    }

    if (!status || typeof status !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Status is required.',
      })
      return
    }

    const normalizedStatus = status.trim().toLowerCase()
    if (!ALLOWED_ORDER_STATUSES.includes(normalizedStatus as OrderStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
      })
      return
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId.trim() },
      { $set: { status: normalizedStatus as OrderStatus } },
      { new: true }
    )

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminOrderController] updateAdminOrderStatus error:',
      error instanceof Error ? error.message : 'Unknown status update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status.',
    })
  }
}

/**
 * PATCH /api/admin/orders/:orderId/tracking
 * Updates carrier and tracking number for an order.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { trackingNumber, carrier } = req.body

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Order ID is required.',
      })
      return
    }

    const cleanTrackingNumber = typeof trackingNumber === 'string' ? trackingNumber.trim() : ''
    const cleanCarrier = typeof carrier === 'string' ? carrier.trim() : ''

    if (cleanTrackingNumber.length > 100 || cleanCarrier.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Tracking details exceed maximum allowed length.',
      })
      return
    }

    const tracking = {
      trackingNumber: cleanTrackingNumber,
      carrier: cleanCarrier,
      updatedAt: new Date(),
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderId.trim() },
      { $set: { tracking } },
      { new: true }
    )

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Tracking information updated successfully.',
      order: updatedOrder,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminOrderController] updateAdminOrderTracking error:',
      error instanceof Error ? error.message : 'Unknown tracking update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating order tracking.',
    })
  }
}
