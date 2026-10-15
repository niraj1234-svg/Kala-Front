import { Router } from 'express'
import {
  getAdminDesignathonRegistrations,
  getAdminDesignathonRegistrationById,
  retryAdminConfirmationEmail,
  exportAdminDesignathonCsv,
  getAdminDesignathonSettings,
  updateAdminDesignathonSettings,
} from '../controllers/adminDesignathonController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminDesignathonRouter = Router()

// All routes require authentication & admin role
adminDesignathonRouter.use(requireAuth, requireAdmin)

/**
 * GET /api/admin/designathon/registrations
 * List registrations with search, status filters, date range, and pagination.
 */
adminDesignathonRouter.get('/registrations', getAdminDesignathonRegistrations)

/**
 * GET /api/admin/designathon/export-csv
 * Export registrations as CSV.
 */
adminDesignathonRouter.get('/export-csv', exportAdminDesignathonCsv)

/**
 * GET /api/admin/designathon/settings
 * View configurable event settings.
 */
adminDesignathonRouter.get('/settings', getAdminDesignathonSettings)

/**
 * PATCH /api/admin/designathon/settings
 * Update configurable event settings (venue, format, judging criteria, submission instructions).
 */
adminDesignathonRouter.patch('/settings', updateAdminDesignathonSettings)

/**
 * GET /api/admin/designathon/registrations/:registrationId
 * Detailed registration view with audit timeline.
 */
adminDesignathonRouter.get('/registrations/:registrationId', getAdminDesignathonRegistrationById)

/**
 * POST /api/admin/designathon/registrations/:registrationId/retry-email
 * Retries sending confirmation email for a confirmed registration.
 */
adminDesignathonRouter.post('/registrations/:registrationId/retry-email', retryAdminConfirmationEmail)

export default adminDesignathonRouter
