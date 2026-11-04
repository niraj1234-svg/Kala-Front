import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getPendingAdminProducts,
  approveAdminProduct,
  rejectAdminProduct,
} from '../controllers/adminProductController'

export const adminProductRouter = Router()

// All administrative product management endpoints require authentication & admin role
adminProductRouter.use(requireAuth, requireAdmin)

// GET /api/admin/products/pending — Products awaiting review (MUST be before /:id)
adminProductRouter.get('/pending', getPendingAdminProducts)

// PATCH /api/admin/products/:id/approve — Approve vendor product
adminProductRouter.patch('/:id/approve', approveAdminProduct)

// PATCH /api/admin/products/:id/reject — Reject vendor product
adminProductRouter.patch('/:id/reject', rejectAdminProduct)

// GET /api/admin/products — List products with search, filters, pagination
adminProductRouter.get('/', getAdminProducts)

// GET /api/admin/products/:id — Product detail by slug ID or Mongo ObjectId
adminProductRouter.get('/:id', getAdminProductById)

// POST /api/admin/products — Create new product
adminProductRouter.post('/', createAdminProduct)

// PATCH /api/admin/products/:id — Update product fields
adminProductRouter.patch('/:id', updateAdminProduct)

// DELETE /api/admin/products/:id — Delete or safely deactivate product
adminProductRouter.delete('/:id', deleteAdminProduct)

export default adminProductRouter
