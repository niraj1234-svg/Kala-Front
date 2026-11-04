import { Router } from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  requestReturn,
} from '../controllers/orderController'
import { requireAuth } from '../middleware/authMiddleware'

export const orderRouter = Router()

// POST /api/orders - Authenticated customer order creation
orderRouter.post('/', requireAuth, createOrder)

// GET /api/orders/my-orders - Authenticated customer order history (MUST be before /:orderId)
orderRouter.get('/my-orders', requireAuth, getMyOrders)

// PUT /api/orders/:orderId/cancel - Cancel eligible order and restore stock
orderRouter.put('/:orderId/cancel', requireAuth, cancelMyOrder)

// POST /api/orders/:orderId/return - Request return or refund
orderRouter.post('/:orderId/return', requireAuth, requestReturn)

// GET /api/orders/:orderId - Authenticated order details with ownership verification
orderRouter.get('/:orderId', requireAuth, getOrderById)

export default orderRouter
