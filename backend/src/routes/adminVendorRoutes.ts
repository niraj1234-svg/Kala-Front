import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  getAdminVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
} from '../controllers/adminVendorController'

export const adminVendorRouter = Router()

// All administrative vendor endpoints require authentication and admin role
adminVendorRouter.use(requireAuth, requireAdmin)

adminVendorRouter.get('/', getAdminVendors)
adminVendorRouter.put('/:id/approve', approveVendor)
adminVendorRouter.put('/:id/reject', rejectVendor)
adminVendorRouter.put('/:id/suspend', suspendVendor)

export default adminVendorRouter
