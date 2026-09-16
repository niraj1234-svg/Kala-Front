import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../controllers/adminProductController'

export const adminProductRouter = Router()

// All administrative product management endpoints require authentication & admin role
adminProductRouter.use(requireAuth, requireAdmin)

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
