import { Router } from 'express'
import {
  getAdminCustomRequests,
  getAdminCustomRequestById,
  updateAdminCustomRequestStatus,
  getAdminBusinessRequests,
  getAdminBusinessRequestById,
  updateAdminBusinessRequestStatus,
} from '../controllers/adminRequestController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

// =========================================================================
// CUSTOM APPAREL REQUESTS ROUTER
// =========================================================================
export const adminCustomRequestRouter = Router()

// All routes require authentication and admin role
adminCustomRequestRouter.use(requireAuth, requireAdmin)

// GET /api/admin/custom-requests
adminCustomRequestRouter.get('/', getAdminCustomRequests)

// GET /api/admin/custom-requests/:requestId
adminCustomRequestRouter.get('/:requestId', getAdminCustomRequestById)

// PATCH /api/admin/custom-requests/:requestId/status
adminCustomRequestRouter.patch('/:requestId/status', updateAdminCustomRequestStatus)

// =========================================================================
// BUSINESS BRANDING REQUESTS ROUTER
// =========================================================================
export const adminBusinessRequestRouter = Router()

// All routes require authentication and admin role
adminBusinessRequestRouter.use(requireAuth, requireAdmin)

// GET /api/admin/business-requests
adminBusinessRequestRouter.get('/', getAdminBusinessRequests)

// GET /api/admin/business-requests/:requestId
adminBusinessRequestRouter.get('/:requestId', getAdminBusinessRequestById)

// PATCH /api/admin/business-requests/:requestId/status
adminBusinessRequestRouter.patch('/:requestId/status', updateAdminBusinessRequestStatus)
