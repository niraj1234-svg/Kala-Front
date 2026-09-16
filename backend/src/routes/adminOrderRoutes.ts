import { Router } from 'express'
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
} from '../controllers/adminOrderController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminOrderRouter = Router()

// Middleware chain: requireAuth followed by requireAdmin
adminOrderRouter.use(requireAuth, requireAdmin)

// GET /api/admin/orders
adminOrderRouter.get('/', getAdminOrders)

// GET /api/admin/orders/:orderId
adminOrderRouter.get('/:orderId', getAdminOrderById)

// PATCH /api/admin/orders/:orderId/status
adminOrderRouter.patch('/:orderId/status', updateAdminOrderStatus)

// PATCH /api/admin/orders/:orderId/tracking
adminOrderRouter.patch('/:orderId/tracking', updateAdminOrderTracking)

export default adminOrderRouter
