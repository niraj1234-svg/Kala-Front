import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  getPlatformSettings,
  updateCommissionRate,
  getAllPayouts,
  updatePayoutStatus,
} from '../controllers/adminSettingsController'

export const adminSettingsRouter = Router()

adminSettingsRouter.use(requireAuth, requireAdmin)

// Platform settings endpoints
adminSettingsRouter.get('/', getPlatformSettings)
adminSettingsRouter.patch('/commission', updateCommissionRate)

// Payout management endpoints
adminSettingsRouter.get('/payouts', getAllPayouts)
adminSettingsRouter.patch('/payouts/:id/status', updatePayoutStatus)

export default adminSettingsRouter

