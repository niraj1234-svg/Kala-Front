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
 * Updates the order lifecycle status with state transition rules and status history.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { status, note, trackingNumber, carrier } = req.body

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid Order ID is required.',
      })
      return
    }

    if (!status || typeof status !== 'string' || !status.trim()) {
      res.status(400).json({
        success: false,
        message: 'Order status is required and must be a string.',
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

    const cleanOrderId = orderId.trim()
    const order = await Order.findOne({ orderId: cleanOrderId })

    if (!order) {
      res.status(404).json({
        success: false,
        message: `Order '${cleanOrderId}' not found.`,
      })
      return
    }

    // 1. State Transition Validation Rules
    // Rule A: Cancelled orders cannot be transitioned back into active fulfillment
    if (order.status === 'cancelled' && normalizedStatus !== 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Cannot transition a cancelled order back into active fulfillment.',
      })
      return
    }

    // Rule B: Delivered orders cannot be regressed to earlier fulfillment stages
    if (
      order.status === 'delivered' &&
      normalizedStatus !== 'delivered' &&
      normalizedStatus !== 'cancelled'
    ) {
      res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be regressed to earlier fulfillment stages.',
      })
      return
    }

    // If identical status and no tracking updates, return current order cleanly
    if (order.status === normalizedStatus && !trackingNumber && !carrier) {
      res.status(200).json({
        success: true,
        message: `Order is already in '${normalizedStatus}' status.`,
        order,
      })
      return
    }

    // 2. Prepare Updates
    const updateQuery: Record<string, any> = {
      $set: {
        status: normalizedStatus as OrderStatus,
      },
    }

    // If tracking info is provided alongside status (especially when moving to shipped)
    if (trackingNumber !== undefined || carrier !== undefined) {
      if (trackingNumber !== undefined) {
        if (typeof trackingNumber !== 'string' || !trackingNumber.trim()) {
          res.status(400).json({
            success: false,
            message: 'Tracking number must be a non-empty string when provided.',
          })
          return
        }
        if (trackingNumber.trim().length > 100) {
          res.status(400).json({
            success: false,
            message: 'Tracking number cannot exceed 100 characters.',
          })
          return
        }
      }

      if (carrier !== undefined) {
        if (typeof carrier !== 'string' || !carrier.trim()) {
          res.status(400).json({
            success: false,
            message: 'Carrier must be a non-empty string when provided.',
          })
          return
        }
        if (carrier.trim().length > 100) {
          res.status(400).json({
            success: false,
            message: 'Carrier cannot exceed 100 characters.',
          })
          return
        }
      }

      updateQuery.$set.tracking = {
        trackingNumber: trackingNumber !== undefined ? trackingNumber.trim() : (order.tracking?.trackingNumber || ''),
        carrier: carrier !== undefined ? carrier.trim() : (order.tracking?.carrier || ''),
        updatedAt: new Date(),
      }
    }

    // 3. Append Status History Entry with Server Timestamp
    const historyEntry = {
      status: normalizedStatus as OrderStatus,
      changedAt: new Date(),
      note: typeof note === 'string' && note.trim() ? note.trim() : `Status updated to ${normalizedStatus}`,
    }

    updateQuery.$push = {
      statusHistory: historyEntry,
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: cleanOrderId },
      updateQuery,
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
      message: `Order status updated to '${normalizedStatus}' successfully.`,
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
 * Updates carrier and tracking number for an order with strict validation.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminOrderTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { trackingNumber, carrier } = req.body

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid Order ID is required.',
      })
      return
    }

    // 1. Validate Tracking Number
    if (trackingNumber === undefined || typeof trackingNumber !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Tracking number is required and must be a string.',
      })
      return
    }

    const cleanTrackingNumber = trackingNumber.trim()
    if (!cleanTrackingNumber) {
      res.status(400).json({
        success: false,
        message: 'Tracking number cannot be empty.',
      })
      return
    }

    if (cleanTrackingNumber.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Tracking number cannot exceed 100 characters.',
      })
      return
    }

    // 2. Validate Carrier
    if (carrier === undefined || typeof carrier !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Carrier is required and must be a string.',
      })
      return
    }

    const cleanCarrier = carrier.trim()
    if (!cleanCarrier) {
      res.status(400).json({
        success: false,
        message: 'Carrier cannot be empty.',
      })
      return
    }

    if (cleanCarrier.length > 100) {
      res.status(400).json({
        success: false,
        message: 'Carrier cannot exceed 100 characters.',
      })
      return
    }

    const cleanOrderId = orderId.trim()
    const order = await Order.findOne({ orderId: cleanOrderId })

    if (!order) {
      res.status(404).json({
        success: false,
        message: `Order '${cleanOrderId}' not found.`,
      })
      return
    }

    // 3. Save Server-Generated Timestamp
    const tracking = {
      trackingNumber: cleanTrackingNumber,
      carrier: cleanCarrier,
      updatedAt: new Date(),
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: cleanOrderId },
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
