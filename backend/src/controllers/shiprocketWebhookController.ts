import { Request, Response } from 'express'
import crypto from 'crypto'
import { Order, IShiprocketTrackingScan, OrderStatus, ShiprocketShipmentStatus } from '../models/Order'
import { getShiprocketWebhookSecret } from '../config/shiprocketConfig'

/**
 * Validates the authenticity of an incoming Shiprocket webhook.
 * - Checks x-api-key or x-shiprocket-token header against SHIPROCKET_WEBHOOK_TOKEN.
 * - Uses timing-safe cryptographic comparison to prevent side-channel timing attacks.
 * - If no secret is configured on server, permits requests (with warning) for staging/dev.
 */
export function verifyShiprocketWebhookHeader(req: Request): boolean {
  const configuredSecret = getShiprocketWebhookSecret()
  if (!configuredSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ShiprocketWebhook] CRITICAL: Webhook secret token is not configured in production. Rejecting request.')
      return false
    }
    return true // Unconfigured secret mode for development/staging only
  }

  const incomingToken =
    (req.headers['x-api-key'] as string | undefined) ||
    (req.headers['x-shiprocket-token'] as string | undefined) ||
    (req.headers['authorization'] as string | undefined)?.replace(/^Bearer\s+/i, '')

  if (!incomingToken) {
    return false
  }

  const bufIncoming = Buffer.from(incomingToken.trim())
  const bufConfigured = Buffer.from(configuredSecret.trim())

  if (bufIncoming.length !== bufConfigured.length) {
    return false
  }

  return crypto.timingSafeEqual(bufIncoming, bufConfigured)
}

/**
 * Status hierarchy order to detect and prevent out-of-order regression.
 * Higher number indicates a later phase in the shipment lifecycle.
 */
const STATUS_PRECEDENCE: Record<string, number> = {
  pending: 1,
  created: 2,
  awb_assigned: 3,
  label_generated: 4,
  pickup_scheduled: 5,
  pickup_completed: 6,
  in_transit: 7,
  shipped: 7,
  out_for_delivery: 8,
  delivered: 10,
  rto_initiated: 9,
  rto_delivered: 10,
  cancelled: 10,
}

/**
 * Maps Shiprocket webhook status strings and status codes to internal KALA OrderStatus.
 */
export function mapShiprocketStatusToKalaStatus(
  srStatus?: string,
  statusCode?: number
): { kalaStatus?: OrderStatus; shipmentStatus: ShiprocketShipmentStatus } {
  const norm = (srStatus || '').trim().toUpperCase()

  // 1. Delivered
  if (statusCode === 7 || norm.includes('DELIVERED') && !norm.includes('RTO')) {
    return { kalaStatus: 'delivered', shipmentStatus: 'delivered' }
  }

  // 2. Out For Delivery
  if (statusCode === 17 || statusCode === 19 || norm.includes('OUT FOR DELIVERY')) {
    return { kalaStatus: 'out_for_delivery', shipmentStatus: 'out_for_delivery' }
  }

  // 3. In Transit / Picked Up
  if (
    statusCode === 6 ||
    statusCode === 18 ||
    norm.includes('IN TRANSIT') ||
    norm.includes('PICKED UP') ||
    norm.includes('SHIPPED') ||
    norm.includes('REACHED AT DESTINATION')
  ) {
    return { kalaStatus: 'shipped', shipmentStatus: 'in_transit' }
  }

  // 4. Pickup Scheduled / Pickup Generated
  if (norm.includes('PICKUP GENERATED') || norm.includes('PICKUP SCHEDULED')) {
    return { shipmentStatus: 'pickup_scheduled' }
  }

  // 5. RTO / Undelivered
  if (statusCode === 9 || norm.includes('RTO INITIATED')) {
    return { shipmentStatus: 'rto_initiated' }
  }
  if (statusCode === 10 || norm.includes('RTO DELIVERED')) {
    return { shipmentStatus: 'rto_delivered' }
  }

  // 6. Canceled
  if (statusCode === 8 || norm.includes('CANCELED') || norm.includes('CANCELLED')) {
    return { kalaStatus: 'cancelled', shipmentStatus: 'cancelled' }
  }

  return { shipmentStatus: 'in_transit' }
}

/**
 * POST /api/shipping/webhook
 *
 * Secure Shiprocket Webhook Receiver:
 * - Authenticates incoming webhook using x-api-key / token header
 * - Idempotently processes shipment tracking updates
 * - Prevents out-of-order status regressions (e.g., delivered -> in transit)
 * - Updates tracking scan history and KALA order state
 */
export const handleShiprocketWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Authenticate webhook request
    if (!verifyShiprocketWebhookHeader(req)) {
      console.warn('[ShiprocketWebhook] Rejected unauthenticated webhook request.')
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid webhook secret token.' })
      return
    }

    const payload = req.body || {}
    const rawAwb = payload.awb || payload.awb_code || payload.tracking_number
    const rawShipmentId = payload.shipment_id
    const rawOrderId = payload.order_id
    const srStatus = payload.current_status || payload.status
    const statusCode = payload.current_status_id || payload.status_id
    const currentLocation = payload.current_location || payload.location
    const scans = payload.scans || []

    if (!rawAwb && !rawShipmentId && !rawOrderId) {
      res.status(400).json({ success: false, message: 'Invalid payload: Missing awb, shipment_id, or order_id.' })
      return
    }

    const cleanAwb = rawAwb ? String(rawAwb).trim() : ''

    // 2. Locate KALA order by awbCode, shipmentId, or orderId
    const queryConditions: any[] = []
    if (cleanAwb) {
      queryConditions.push({ 'shiprocketOrder.awbCode': cleanAwb })
    }
    if (rawShipmentId) {
      queryConditions.push({ 'shiprocketOrder.shipmentId': rawShipmentId })
    }
    if (rawOrderId) {
      queryConditions.push({ 'shiprocketOrder.orderId': rawOrderId })
      queryConditions.push({ orderId: String(rawOrderId).trim() })
    }

    const order = await Order.findOne({ $or: queryConditions })

    if (!order) {
      // Return 200 to acknowledge webhook so Shiprocket does not re-send indefinitely
      console.warn(`[ShiprocketWebhook] Order not found for AWB: '${cleanAwb}', shipmentId: '${rawShipmentId}'`)
      res.status(200).json({ success: true, message: 'Order not found in KALA database; webhook acknowledged.' })
      return
    }

    // 3. Map status and apply out-of-order protection
    const { kalaStatus, shipmentStatus } = mapShiprocketStatusToKalaStatus(srStatus, statusCode)

    const currentPrecedence = STATUS_PRECEDENCE[order.status] || 0
    const targetPrecedence = kalaStatus ? (STATUS_PRECEDENCE[kalaStatus] || 0) : 0

    // Only progress KALA status forward; do not regress a delivered or out_for_delivery order
    const shouldUpdateKalaStatus = Boolean(
      kalaStatus &&
      targetPrecedence >= currentPrecedence &&
      order.status !== 'delivered' &&
      order.status !== 'cancelled'
    )

    if (shouldUpdateKalaStatus && kalaStatus) {
      order.status = kalaStatus
    }

    // Update shiprocketOrder tracking subdocument
    if (!order.shiprocketOrder) {
      order.shiprocketOrder = {
        status: shipmentStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else {
      order.shiprocketOrder.status = shipmentStatus
      order.shiprocketOrder.updatedAt = new Date()
    }

    order.shiprocketOrder.currentTrackingStatus = srStatus
    order.shiprocketOrder.lastTrackingSyncAt = new Date()

    if (cleanAwb && !order.shiprocketOrder.awbCode) {
      order.shiprocketOrder.awbCode = cleanAwb
    }

    // Append new scans idempotently
    if (Array.isArray(scans) && scans.length > 0) {
      const existingScans = order.shiprocketOrder.trackingScans || []
      const existingScanKeys = new Set(
        existingScans.map((s) => `${s.date}|${s.activity}|${s.location}`)
      )

      for (const s of scans) {
        const key = `${s.date || ''}|${s.activity || ''}|${s.location || ''}`
        if (!existingScanKeys.has(key)) {
          existingScans.push({
            date: s.date || new Date().toISOString(),
            status: s.status || '',
            activity: s.activity || '',
            location: s.location || '',
            srStatus: s['sr-status'] || '',
          })
          existingScanKeys.add(key)
        }
      }
      order.shiprocketOrder.trackingScans = existingScans
    }

    // Synchronize root tracking number
    if (cleanAwb && (!order.tracking || !order.tracking.trackingNumber)) {
      if (!order.tracking) order.tracking = {}
      order.tracking.trackingNumber = cleanAwb
      order.tracking.updatedAt = new Date()
    }

    // Add status history entry
    if (!order.statusHistory) {
      order.statusHistory = []
    }
    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: 'Shiprocket Webhook',
      note: `Tracking status: ${srStatus || shipmentStatus}${currentLocation ? ` at ${currentLocation}` : ''} (AWB: ${cleanAwb || order.shiprocketOrder.awbCode || 'N/A'})`,
    })

    await order.save()

    console.log(`[ShiprocketWebhook] Order ${order.orderId} updated to status '${order.status}' via AWB '${cleanAwb}'.`)

    res.status(200).json({
      success: true,
      message: 'Shiprocket webhook processed successfully.',
      orderId: order.orderId,
      status: order.status,
      shipmentStatus,
    })
  } catch (error: any) {
    console.error('[ShiprocketWebhook] Webhook processing exception:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error processing webhook.' })
  }
}
