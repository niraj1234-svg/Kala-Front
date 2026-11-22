import { Router } from 'express'
import { handleShiprocketWebhook } from '../controllers/shiprocketWebhookController'

const router = Router()

/**
 * POST /api/shipping/webhook
 * Primary Shiprocket webhook receiver for tracking and fulfillment updates.
 */
router.post('/', handleShiprocketWebhook)
router.post('/shiprocket', handleShiprocketWebhook)
router.post('/tracking', handleShiprocketWebhook)

export default router
