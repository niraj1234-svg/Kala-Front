import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import {
  retryOrderShipment,
  trackOrderShipment,
  getOrderShippingLabel,
  getOrderInvoice,
  scheduleOrderPickup,
} from '../controllers/adminShippingController'

const router = Router()

// All admin shipping routes are protected by authentication and admin authorization
router.use(requireAuth, requireAdmin)

/**
 * POST /api/admin/shipping/retry/:orderId
 * Manually retries failed or incomplete shipment workflow for an order.
 */
router.post('/retry/:orderId', retryOrderShipment)

/**
 * GET /api/admin/shipping/track/:orderId
 * Fetches real-time tracking from Shiprocket.
 */
router.get('/track/:orderId', trackOrderShipment)

/**
 * GET /api/admin/shipping/label/:orderId
 * Retrieves or regenerates shipping label URL.
 */
router.get('/label/:orderId', getOrderShippingLabel)

/**
 * GET /api/admin/shipping/invoice/:orderId
 * Retrieves or regenerates invoice URL.
 */
router.get('/invoice/:orderId', getOrderInvoice)

/**
 * POST /api/admin/shipping/pickup/:orderId
 * Schedules or reschedules courier pickup.
 */
router.post('/pickup/:orderId', scheduleOrderPickup)

export default router
