import { Order, IOrder, ShiprocketShipmentStatus } from '../models/Order'
import {
  createShiprocketOrder,
  assignCourierAndGenerateAwb,
  generateShippingLabel,
  generateInvoice,
  schedulePickup,
  ShiprocketApiOptions,
  formatShiprocketDate,
} from './shiprocketShipmentService'
import {
  checkCourierServiceability,
} from './shiprocketServiceabilityService'
import {
  DEFAULT_PACKAGE_DIMENSIONS,
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_SHIPMENT_WEIGHT_KG,
  MAX_SHIPMENT_WEIGHT_KG,
  isShiprocketAutoFulfillmentEnabled,
  isShiprocketAutoAwbEnabled,
  isShiprocketAutoPickupEnabled,
} from '../config/shiprocketConfig'

export interface AutomationOptions extends ShiprocketApiOptions {
  autoGenerateLabel?: boolean
  autoGenerateInvoice?: boolean
  autoSchedulePickup?: boolean
  preferredCourierId?: number
  force?: boolean
  forceAwb?: boolean
  forcePickup?: boolean
}

export interface ShipmentWorkflowResult {
  success: boolean
  kalaOrderId: string
  shiprocketOrderId?: number | string
  shipmentId?: number | string
  awbCode?: string
  courierName?: string
  labelUrl?: string
  invoiceUrl?: string
  pickupTokenNumber?: string
  status: ShiprocketShipmentStatus
  message: string
}

// In-memory re-entrancy / single-flight lock for in-progress order shipment workflows
const inFlightWorkflows = new Map<string, Promise<ShipmentWorkflowResult>>()

/**
 * Calculates total shipment package weight and mailer bag dimensions based on items in order.
 * - Minimum single apparel item: 0.1kg - 0.5kg
 * - Scales safely with multi-item orders
 * - Bounded within safe shipping limits (0.1kg to 10.0kg)
 */
export function calculateOrderPackageSpecs(items: IOrder['items']): {
  weightKg: number
  dimensions: { length: number; breadth: number; height: number }
} {
  let totalWeight = 0
  let totalUnits = 0

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1)
    totalUnits += qty
    // Default single shirt weight is 0.5kg (500g)
    totalWeight += qty * DEFAULT_SHIPMENT_WEIGHT_KG
  }

  // Safe clamping: minimum 0.1kg, maximum 10kg
  const clampedWeight = Math.max(MIN_SHIPMENT_WEIGHT_KG, Math.min(totalWeight, 10.0))

  // Dimensions: single mailer bag is 25x20x3 cm; scale height for multiple items
  const length = DEFAULT_PACKAGE_DIMENSIONS.length
  const breadth = DEFAULT_PACKAGE_DIMENSIONS.breadth
  const height = Math.min(30, Math.max(3, totalUnits * 3))

  return {
    weightKg: Number(clampedWeight.toFixed(2)),
    dimensions: { length, breadth, height },
  }
}

/**
 * Triggers the automatic end-to-end shipment creation workflow for a verified paid order.
 *
 * Execution Steps:
 * 1. Concurrency & Idempotency Guard: Prevents duplicate creations from webhook retries.
 * 2. Payment Verification Check: ONLY proceeds if payment status is 'paid' or status is 'confirmed'.
 * 3. Step 1 (Phase 3): Create Shiprocket order (POST /orders/create/adhoc).
 * 4. Step 2 (Phase 3): Select best courier & generate AWB (POST /courier/assign/awb).
 * 5. Step 3 (Phase 4): Generate shipping label (POST /courier/generate/label).
 * 6. Step 4 (Phase 4): Generate invoice (POST /orders/print/invoice).
 * 7. Step 5 (Phase 4): Schedule courier pickup (POST /courier/generate/pickup).
 * 8. Error Isolation: Failures in logistics NEVER touch, reverse, or duplicate the payment.
 */
export async function triggerShipmentWorkflow(
  kalaOrderId: string,
  options: AutomationOptions = {}
): Promise<ShipmentWorkflowResult> {
  const cleanOrderId = kalaOrderId.trim()

  // Concurrency lock check: coalesce duplicate in-flight requests for the same order
  const existingInFlight = inFlightWorkflows.get(cleanOrderId)
  if (existingInFlight) {
    return existingInFlight
  }

  const workflowPromise = executeShipmentWorkflow(cleanOrderId, options).finally(() => {
    inFlightWorkflows.delete(cleanOrderId)
  })

  inFlightWorkflows.set(cleanOrderId, workflowPromise)
  return workflowPromise
}

async function executeShipmentWorkflow(
  cleanOrderId: string,
  options: AutomationOptions
): Promise<ShipmentWorkflowResult> {
  const order = await Order.findOne({ orderId: cleanOrderId })

  if (!order) {
    return {
      success: false,
      kalaOrderId: cleanOrderId,
      status: 'failed',
      message: `Order not found with ID '${cleanOrderId}'.`,
    }
  }

  // 1. Strict Payment Check: Shipment MUST NEVER be created before verified payment
  const isPaid = order.payment?.status === 'paid' || order.status === 'confirmed' || order.status === 'processing'
  if (!isPaid) {
    return {
      success: false,
      kalaOrderId: cleanOrderId,
      status: order.shiprocketOrder?.status || 'pending',
      message: 'Payment not verified: Shipment creation is only permitted for paid orders.',
    }
  }

  // 2. Strict Idempotency: If shipment already has AWB generated and is active, do not recreate
  if (
    order.shiprocketOrder?.shipmentId &&
    order.shiprocketOrder?.awbCode &&
    order.shiprocketOrder.status !== 'failed' &&
    order.shiprocketOrder.status !== 'pending'
  ) {
    return {
      success: true,
      kalaOrderId: cleanOrderId,
      shiprocketOrderId: order.shiprocketOrder.orderId,
      shipmentId: order.shiprocketOrder.shipmentId,
      awbCode: order.shiprocketOrder.awbCode,
      courierName: order.shiprocketOrder.courierName,
      labelUrl: order.shiprocketOrder.labelUrl,
      invoiceUrl: order.shiprocketOrder.invoiceUrl,
      pickupTokenNumber: order.shiprocketOrder.pickupTokenNumber,
      status: order.shiprocketOrder.status,
      message: 'Shipment already exists and is active for this order.',
    }
  }

  // 3. Production Safety Gate: Automatic shipment creation is disabled by default unless explicitly enabled
  const isAutoFulfillmentEnabled = isShiprocketAutoFulfillmentEnabled()
  if (!isAutoFulfillmentEnabled && !options.force) {
    console.log(
      `[ShipmentAutomation] Safety Gate: Automatic shipment creation is disabled (SHIPROCKET_AUTO_FULFILLMENT_ENABLED != 'true'). Order ${cleanOrderId} will remain in confirmed state for manual fulfillment.`
    )
    return {
      success: true,
      kalaOrderId: cleanOrderId,
      status: order.shiprocketOrder?.status || 'pending',
      message:
        'Shipment automation is disabled by default safety gate (SHIPROCKET_AUTO_FULFILLMENT_ENABLED is not enabled).',
    }
  }

  // Calculate specs
  const { weightKg, dimensions } = calculateOrderPackageSpecs(order.items)

  // Initialize or update shiprocketOrder record
  if (!order.shiprocketOrder) {
    order.shiprocketOrder = {
      status: 'pending',
      channelOrderId: cleanOrderId,
      retryCount: 0,
      weightKg,
      dimensions,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  order.shiprocketOrder.lastAttemptAt = new Date()
  order.shiprocketOrder.weightKg = weightKg
  order.shiprocketOrder.dimensions = dimensions

  try {
    // =========================================================================
    // STEP 1: CREATE SHIPROCKET ORDER (If not already created)
    // =========================================================================
    let shiprocketOrderId = order.shiprocketOrder.orderId
    let shipmentId = order.shiprocketOrder.shipmentId

    if (!shiprocketOrderId || !shipmentId) {
      const createResult = await createShiprocketOrder(
        {
          orderId: cleanOrderId,
          orderDate: formatShiprocketDate(order.createdAt || new Date()),
          customerFirstName: order.customer.firstName,
          customerLastName: order.customer.lastName,
          address: order.shippingAddress.address,
          address2: order.shippingAddress.landmark,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.pincode,
          email: order.customer.email,
          phone: order.customer.phone,
          items: order.items.map((it) => ({
            name: it.name,
            sku: `${it.productId}-${it.size || 'STD'}`,
            units: it.quantity,
            selling_price: it.price,
          })),
          subtotal: order.pricing.subtotal,
          totalDiscount: order.pricing.discount || 0,
          packageWeightKg: weightKg,
          packageDimensions: dimensions,
        },
        options
      )

      if (!createResult.success || !createResult.shipmentId) {
        order.shiprocketOrder.status = 'failed'
        order.shiprocketOrder.lastError = createResult.message
        order.shiprocketOrder.retryCount = (order.shiprocketOrder.retryCount || 0) + 1
        order.shiprocketOrder.updatedAt = new Date()
        await order.save()

        return {
          success: false,
          kalaOrderId: cleanOrderId,
          status: 'failed',
          message: `Shiprocket order creation failed: ${createResult.message}`,
        }
      }

      shiprocketOrderId = createResult.orderId
      shipmentId = createResult.shipmentId
      order.shiprocketOrder.orderId = shiprocketOrderId
      order.shiprocketOrder.shipmentId = shipmentId
      order.shiprocketOrder.status = 'created'
      order.shiprocketOrder.lastError = undefined
      order.shiprocketOrder.updatedAt = new Date()
      await order.save()
    }

    // =========================================================================
    // STEP 2: ASSIGN COURIER & GENERATE AWB
    // =========================================================================
    let awbCode = order.shiprocketOrder.awbCode
    let courierName = order.shiprocketOrder.courierName

    const isAwbEnabled = isShiprocketAutoAwbEnabled() || Boolean(options.forceAwb || options.force)

    if (!awbCode && !isAwbEnabled) {
      console.log(
        `[ShipmentAutomation] Safety Gate: Automatic AWB generation is disabled (SHIPROCKET_AUTO_AWB_ENABLED != 'true'). Order ${cleanOrderId} remains in 'created' state.`
      )
      return {
        success: true,
        kalaOrderId: cleanOrderId,
        shiprocketOrderId,
        shipmentId,
        status: 'created',
        message: 'Shiprocket order created, but automatic AWB generation is disabled by safety gate.',
      }
    }

    if (!awbCode) {
      let selectedCourierId = options.preferredCourierId

      // If no explicit courier preferred, query serviceability to find cheapest/fastest
      if (!selectedCourierId) {
        try {
          const serviceability = await checkCourierServiceability(
            order.shippingAddress.pincode,
            weightKg,
            {
              customFetch: options.customFetch,
              baseUrl: options.baseUrl,
            }
          )
          if (serviceability.success && serviceability.cheapestCourier) {
            selectedCourierId = serviceability.cheapestCourier.courierCompanyId
          }
        } catch {
          // Fall back to Shiprocket's automatic courier assignment
        }
      }

      const awbResult = await assignCourierAndGenerateAwb(
        {
          shipmentId: shipmentId!,
          courierId: selectedCourierId,
        },
        options
      )

      if (awbResult.success && awbResult.awbCode) {
        awbCode = awbResult.awbCode
        courierName = awbResult.courierName
        order.shiprocketOrder.awbCode = awbCode
        order.shiprocketOrder.courierName = courierName
        order.shiprocketOrder.courierId = awbResult.courierCompanyId
        order.shiprocketOrder.awbAssignedAt = new Date()
        order.shiprocketOrder.status = 'awb_assigned'

        // Synchronize tracking fields on root Order
        if (!order.tracking) {
          order.tracking = {}
        }
        order.tracking.trackingNumber = awbCode
        order.tracking.carrier = courierName
        order.tracking.updatedAt = new Date()

        // Move order to processing / packed if still confirmed
        if (order.status === 'confirmed') {
          order.status = 'processing'
        }

        if (!order.statusHistory) {
          order.statusHistory = []
        }
        order.statusHistory.push({
          status: order.status,
          changedAt: new Date(),
          changedBy: 'Shiprocket Automation',
          note: `AWB generated (${awbCode}) via ${courierName || 'Shiprocket'}`,
        })

        order.shiprocketOrder.updatedAt = new Date()
        await order.save()
      } else {
        order.shiprocketOrder.lastError = awbResult.message
        order.shiprocketOrder.updatedAt = new Date()
        await order.save()
        // Return partial success with 'created' state so retry can resume at AWB
        return {
          success: false,
          kalaOrderId: cleanOrderId,
          shiprocketOrderId,
          shipmentId,
          status: 'created',
          message: `Order created, but AWB generation failed: ${awbResult.message}`,
        }
      }
    }

    // =========================================================================
    // STEP 3: GENERATE SHIPPING LABEL (Phase 4)
    // =========================================================================
    const autoLabel = options.autoGenerateLabel !== false
    if (autoLabel && shipmentId && !order.shiprocketOrder.labelUrl) {
      try {
        const labelResult = await generateShippingLabel([shipmentId], options)
        if (labelResult.success && labelResult.labelUrl) {
          order.shiprocketOrder.labelUrl = labelResult.labelUrl
          order.shiprocketOrder.labelGeneratedAt = new Date()
          order.shiprocketOrder.status = 'label_generated'
          order.shiprocketOrder.updatedAt = new Date()
          await order.save()
        }
      } catch (err: any) {
        console.warn(`[ShipmentAutomation] Label generation skipped: ${err?.message}`)
      }
    }

    // =========================================================================
    // STEP 4: GENERATE INVOICE (Phase 4)
    // =========================================================================
    const autoInvoice = options.autoGenerateInvoice !== false
    if (autoInvoice && shiprocketOrderId && !order.shiprocketOrder.invoiceUrl) {
      try {
        const invoiceResult = await generateInvoice([shiprocketOrderId], options)
        if (invoiceResult.success && invoiceResult.invoiceUrl) {
          order.shiprocketOrder.invoiceUrl = invoiceResult.invoiceUrl
          order.shiprocketOrder.invoiceGeneratedAt = new Date()
          order.shiprocketOrder.updatedAt = new Date()
          await order.save()
        }
      } catch (err: any) {
        console.warn(`[ShipmentAutomation] Invoice generation skipped: ${err?.message}`)
      }
    }

    // =========================================================================
    // STEP 5: SCHEDULE PICKUP (Phase 4)
    // =========================================================================
    const isPickupEnabled = isShiprocketAutoPickupEnabled() || Boolean(options.forcePickup || options.force)
    const autoPickup = options.autoSchedulePickup !== false && isPickupEnabled
    if (autoPickup && shipmentId && !order.shiprocketOrder.pickupTokenNumber) {
      try {
        const pickupResult = await schedulePickup({ shipmentIds: [shipmentId] }, options)
        if (pickupResult.success) {
          order.shiprocketOrder.pickupTokenNumber = pickupResult.pickupTokenNumber || 'SCHEDULED'
          order.shiprocketOrder.pickupScheduledDate = pickupResult.pickupScheduledDate
          order.shiprocketOrder.pickupGeneratedAt = new Date()
          order.shiprocketOrder.status = 'pickup_scheduled'

          if (!order.statusHistory) {
            order.statusHistory = []
          }
          order.statusHistory.push({
            status: order.status,
            changedAt: new Date(),
            changedBy: 'Shiprocket Automation',
            note: `Pickup scheduled (${pickupResult.pickupTokenNumber || 'Token assigned'}) for ${pickupResult.pickupScheduledDate || 'tomorrow'}`,
          })

          order.shiprocketOrder.updatedAt = new Date()
          await order.save()
        }
      } catch (err: any) {
        console.warn(`[ShipmentAutomation] Pickup scheduling skipped: ${err?.message}`)
      }
    }

    return {
      success: true,
      kalaOrderId: cleanOrderId,
      shiprocketOrderId,
      shipmentId,
      awbCode: order.shiprocketOrder.awbCode,
      courierName: order.shiprocketOrder.courierName,
      labelUrl: order.shiprocketOrder.labelUrl,
      invoiceUrl: order.shiprocketOrder.invoiceUrl,
      pickupTokenNumber: order.shiprocketOrder.pickupTokenNumber,
      status: order.shiprocketOrder.status,
      message: 'Shipment workflow executed successfully.',
    }
  } catch (err: any) {
    order.shiprocketOrder.status = 'failed'
    order.shiprocketOrder.lastError = err?.message || 'Unexpected exception during shipment workflow.'
    order.shiprocketOrder.retryCount = (order.shiprocketOrder.retryCount || 0) + 1
    order.shiprocketOrder.updatedAt = new Date()
    await order.save()

    return {
      success: false,
      kalaOrderId: cleanOrderId,
      status: 'failed',
      message: `Unexpected shipment workflow error: ${err?.message}`,
    }
  }
}

/**
 * Retries a failed or partially completed shipment workflow for an existing paid order.
 * - If order already exists in Shiprocket, resumes directly at AWB assignment, Label, or Pickup.
 * - Does NOT duplicate the Shiprocket order.
 */
export async function retryShipmentWorkflow(
  kalaOrderId: string,
  options: AutomationOptions = {}
): Promise<ShipmentWorkflowResult> {
  const cleanOrderId = kalaOrderId.trim()
  const order = await Order.findOne({ orderId: cleanOrderId })

  if (!order) {
    return {
      success: false,
      kalaOrderId: cleanOrderId,
      status: 'failed',
      message: `Order not found with ID '${cleanOrderId}'.`,
    }
  }

  // Clear previous failed status flag to permit retry
  if (order.shiprocketOrder && order.shiprocketOrder.status === 'failed') {
    order.shiprocketOrder.status = order.shiprocketOrder.shipmentId ? 'created' : 'pending'
    await order.save()
  }

  return triggerShipmentWorkflow(cleanOrderId, options)
}
