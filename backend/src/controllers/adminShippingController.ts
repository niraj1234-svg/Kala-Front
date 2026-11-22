import { Request, Response } from 'express'
import { Order } from '../models/Order'
import {
  retryShipmentWorkflow,
} from '../services/shipmentAutomationService'
import {
  trackShipmentByAwb,
  generateShippingLabel,
  generateInvoice,
  schedulePickup,
} from '../services/shiprocketShipmentService'
import {
  isShiprocketAutoFulfillmentEnabled,
  isShiprocketAutoPickupEnabled,
} from '../config/shiprocketConfig'

/**
 * POST /api/admin/shipping/retry/:orderId
 * Retries shipment creation, AWB assignment, or fulfillment for an existing paid order.
 * Protected by SHIPROCKET_AUTO_FULFILLMENT_ENABLED safety gate.
 */
export const retryOrderShipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Missing orderId parameter.' })
      return
    }

    const order = await Order.findOne({ orderId })
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' })
      return
    }

    // If already fulfilled with AWB, return active status safely
    if (order.shiprocketOrder?.shipmentId && order.shiprocketOrder?.awbCode) {
      res.status(200).json({
        success: true,
        orderId: order.orderId,
        shiprocketOrderId: order.shiprocketOrder.orderId,
        shipmentId: order.shiprocketOrder.shipmentId,
        awbCode: order.shiprocketOrder.awbCode,
        status: order.shiprocketOrder.status,
        message: 'Shipment already exists and is active for this order.',
      })
      return
    }

    // Production Safety Gate: Disallow live fulfillment if safety flag is disabled
    if (!isShiprocketAutoFulfillmentEnabled()) {
      res.status(200).json({
        success: false,
        orderId: order.orderId,
        status: order.shiprocketOrder?.status || 'pending',
        message:
          'Shiprocket live fulfillment is disabled by safety flag (SHIPROCKET_AUTO_FULFILLMENT_ENABLED !== true). Enable the environment flag in Render to permit live order creation.',
      })
      return
    }

    const result = await retryShipmentWorkflow(orderId)

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      orderId: result.kalaOrderId,
      shiprocketOrderId: result.shiprocketOrderId,
      shipmentId: result.shipmentId,
      awbCode: result.awbCode,
      status: result.status,
      message: result.message,
    })
  } catch (error: any) {
    console.error('[AdminShippingController] retryOrderShipment error:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error retrying shipment.' })
  }
}

/**
 * GET /api/admin/shipping/track/:orderId
 * Queries real-time tracking information from Shiprocket using the order's AWB.
 */
export const trackOrderShipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    const order = await Order.findOne({ orderId })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' })
      return
    }

    const awb = order.shiprocketOrder?.awbCode || order.tracking?.trackingNumber
    if (!awb) {
      res.status(400).json({
        success: false,
        message: 'No AWB assigned to this order yet. Please generate AWB first.',
      })
      return
    }

    const trackResult = await trackShipmentByAwb(awb)

    // Update tracking cache on order
    if (trackResult.success) {
      if (!order.shiprocketOrder) {
        order.shiprocketOrder = { status: 'in_transit' }
      }
      order.shiprocketOrder.currentTrackingStatus = trackResult.currentStatus
      order.shiprocketOrder.lastTrackingSyncAt = new Date()
      if (trackResult.scans && trackResult.scans.length > 0) {
        order.shiprocketOrder.trackingScans = trackResult.scans
      }
      await order.save()
    }

    res.status(trackResult.success ? 200 : 502).json({
      success: trackResult.success,
      orderId: order.orderId,
      awbCode: awb,
      currentStatus: trackResult.currentStatus,
      currentLocation: trackResult.currentLocation,
      etd: trackResult.etd,
      scans: trackResult.scans || [],
      message: trackResult.message,
    })
  } catch (error: any) {
    console.error('[AdminShippingController] trackOrderShipment error:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error querying tracking.' })
  }
}

/**
 * GET /api/admin/shipping/label/:orderId
 * Retrieves or regenerates shipping label URL for an order.
 */
export const getOrderShippingLabel = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    const order = await Order.findOne({ orderId })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' })
      return
    }

    // If label URL already stored, return directly
    if (order.shiprocketOrder?.labelUrl) {
      res.status(200).json({
        success: true,
        orderId: order.orderId,
        labelUrl: order.shiprocketOrder.labelUrl,
      })
      return
    }

    const shipmentId = order.shiprocketOrder?.shipmentId
    if (!shipmentId) {
      res.status(400).json({
        success: false,
        message: 'No shipment created for this order yet. Cannot generate label.',
      })
      return
    }

    const labelResult = await generateShippingLabel([shipmentId])
    if (labelResult.success && labelResult.labelUrl) {
      if (!order.shiprocketOrder) {
        order.shiprocketOrder = { status: 'created' }
      }
      order.shiprocketOrder.labelUrl = labelResult.labelUrl
      order.shiprocketOrder.labelGeneratedAt = new Date()
      await order.save()

      res.status(200).json({
        success: true,
        orderId: order.orderId,
        labelUrl: labelResult.labelUrl,
      })
      return
    }

    res.status(502).json({
      success: false,
      message: labelResult.message || 'Failed to generate shipping label from Shiprocket.',
    })
  } catch (error: any) {
    console.error('[AdminShippingController] getOrderShippingLabel error:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error generating label.' })
  }
}

/**
 * GET /api/admin/shipping/invoice/:orderId
 * Retrieves or regenerates invoice URL for an order.
 */
export const getOrderInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    const order = await Order.findOne({ orderId })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' })
      return
    }

    if (order.shiprocketOrder?.invoiceUrl) {
      res.status(200).json({
        success: true,
        orderId: order.orderId,
        invoiceUrl: order.shiprocketOrder.invoiceUrl,
      })
      return
    }

    const shiprocketOrderId = order.shiprocketOrder?.orderId
    if (!shiprocketOrderId) {
      res.status(400).json({
        success: false,
        message: 'No Shiprocket order ID associated with this order.',
      })
      return
    }

    const invResult = await generateInvoice([shiprocketOrderId])
    if (invResult.success && invResult.invoiceUrl) {
      if (!order.shiprocketOrder) {
        order.shiprocketOrder = { status: 'created' }
      }
      order.shiprocketOrder.invoiceUrl = invResult.invoiceUrl
      order.shiprocketOrder.invoiceGeneratedAt = new Date()
      await order.save()

      res.status(200).json({
        success: true,
        orderId: order.orderId,
        invoiceUrl: invResult.invoiceUrl,
      })
      return
    }

    res.status(502).json({
      success: false,
      message: invResult.message || 'Failed to generate invoice from Shiprocket.',
    })
  } catch (error: any) {
    console.error('[AdminShippingController] getOrderInvoice error:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error generating invoice.' })
  }
}

/**
 * POST /api/admin/shipping/pickup/:orderId
 * Schedules or reschedules courier pickup for an order.
 */
export const scheduleOrderPickup = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = String(req.params.orderId || '').trim()
    const { pickupDate } = req.body
    const order = await Order.findOne({ orderId })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' })
      return
    }

    const shipmentId = order.shiprocketOrder?.shipmentId
    if (!shipmentId) {
      res.status(400).json({
        success: false,
        message: 'No shipment created for this order. Cannot schedule pickup.',
      })
      return
    }

    // Production Safety Gate: Disallow live pickup scheduling if safety flag is disabled
    if (!isShiprocketAutoPickupEnabled()) {
      res.status(200).json({
        success: false,
        orderId: order.orderId,
        message:
          'Courier pickup scheduling is disabled by safety flag (SHIPROCKET_AUTO_PICKUP_ENABLED !== true). Enable the environment flag in Render to permit live pickup requests.',
      })
      return
    }

    const pickupResult = await schedulePickup({
      shipmentIds: [shipmentId],
      pickupDate,
    })

    if (pickupResult.success) {
      if (!order.shiprocketOrder) {
        order.shiprocketOrder = { status: 'created' }
      }
      order.shiprocketOrder.pickupTokenNumber = pickupResult.pickupTokenNumber || 'SCHEDULED'
      order.shiprocketOrder.pickupScheduledDate = pickupResult.pickupScheduledDate
      order.shiprocketOrder.pickupGeneratedAt = new Date()
      order.shiprocketOrder.status = 'pickup_scheduled'
      await order.save()

      res.status(200).json({
        success: true,
        orderId: order.orderId,
        pickupStatus: pickupResult.pickupStatus,
        pickupTokenNumber: pickupResult.pickupTokenNumber,
        pickupScheduledDate: pickupResult.pickupScheduledDate,
        message: pickupResult.message,
      })
      return
    }

    res.status(502).json({
      success: false,
      message: pickupResult.message || 'Failed to schedule pickup with Shiprocket.',
    })
  } catch (error: any) {
    console.error('[AdminShippingController] scheduleOrderPickup error:', error)
    res.status(500).json({ success: false, message: error?.message || 'Server error scheduling pickup.' })
  }
}
