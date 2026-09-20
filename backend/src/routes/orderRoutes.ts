import { Router } from 'express'
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController'
import { requireAuth } from '../middleware/authMiddleware'

export const orderRouter = Router()

// POST /api/orders - Authenticated customer order creation
orderRouter.post('/', requireAuth, createOrder)

// GET /api/orders/my-orders - Authenticated customer order history (MUST be before /:orderId)
orderRouter.get('/my-orders', requireAuth, getMyOrders)

// GET /api/orders/:orderId - Authenticated order details with ownership verification
orderRouter.get('/:orderId', requireAuth, getOrderById)

export default orderRouter
