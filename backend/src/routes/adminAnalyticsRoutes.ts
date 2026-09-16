import { Router } from 'express'
import { getAdminAnalyticsOverview } from '../controllers/adminAnalyticsController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminAnalyticsRouter = Router()

// All administrative analytics endpoints require authentication & admin role
adminAnalyticsRouter.use(requireAuth, requireAdmin)

// GET /api/admin/analytics/overview — Comprehensive real-time business statistics
adminAnalyticsRouter.get('/overview', getAdminAnalyticsOverview)

export default adminAnalyticsRouter
