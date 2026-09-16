import { Router } from 'express'
import { createOrder, getOrderById } from '../controllers/orderController'

export const orderRouter = Router()

// POST /api/orders
orderRouter.post('/', createOrder)

// GET /api/orders/:orderId
orderRouter.get('/:orderId', getOrderById)

export default orderRouter
