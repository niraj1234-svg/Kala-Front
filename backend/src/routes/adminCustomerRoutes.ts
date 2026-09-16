import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  getAdminCustomers,
  getAdminCustomerById,
  getAdminCustomerOrders,
  updateAdminCustomer,
} from '../controllers/adminCustomerController'

export const adminCustomerRouter = Router()

// All administrative customer management endpoints require authentication & admin role
adminCustomerRouter.use(requireAuth, requireAdmin)

// GET /api/admin/customers — List customers with search, pagination, and order counts
adminCustomerRouter.get('/', getAdminCustomers)

// GET /api/admin/customers/:userId — Customer profile details & summary
adminCustomerRouter.get('/:userId', getAdminCustomerById)

// GET /api/admin/customers/:userId/orders — Customer order history for admin review
adminCustomerRouter.get('/:userId/orders', getAdminCustomerOrders)

// PATCH /api/admin/customers/:userId — Safe customer profile updates (name, phone)
adminCustomerRouter.patch('/:userId', updateAdminCustomer)

export default adminCustomerRouter
