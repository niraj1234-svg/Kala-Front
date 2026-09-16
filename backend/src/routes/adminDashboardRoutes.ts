import { Router } from 'express'
import { getAdminDashboardSummary } from '../controllers/adminDashboardController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminDashboardRouter = Router()

// All administrative command center endpoints require authentication & admin role
adminDashboardRouter.use(requireAuth, requireAdmin)

// GET /api/admin/dashboard/summary — Real-time operational overview for Admin Command Center
adminDashboardRouter.get('/summary', getAdminDashboardSummary)

export default adminDashboardRouter
