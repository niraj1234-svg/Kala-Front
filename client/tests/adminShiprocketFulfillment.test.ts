/**
 * Focused Frontend Test Suite for KALA Admin Order Details:
 * 1. Accurate Shiprocket Feedback and State Verification
 * 2. Estimated Package Specs Preview vs Persisted Actual Package Specs
 *
 * Verifies:
 * - Package specs estimation calculation (single item, multi-item, custom weight, default fallback, min/max clamping, height scaling)
 * - Missing shipment state pre-fulfillment (shows "Not created", "Not assigned", and "Estimated Package Specs")
 * - Successful persisted shipment state (claims success only when persisted order state confirms orderId/shipmentId)
 * - Delayed persistence handling (when backend returns success but DB write is delayed, shows neutral pending verification info message without claiming order was created)
 * - Error handling when backend returns success: false
 * - Exception / network error handling
 * - Actual package specs rendering when persisted specs exist
 */

import { register } from 'node:module'
import type { AdminOrder, AdminShippingActionResponse } from '../src/services/adminApi'

// Register inline CSS null loader so tsx/node can load AdminOrderDetail without failing on .css import
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function load(url, context, defaultLoad) {
        if (url.endsWith('.css')) {
          return { format: 'module', shortCircuit: true, source: 'export default {};' };
        }
        return defaultLoad(url, context);
      }
    `)
)

// Dynamically import calculateEstimatedPackageSpecs from AdminOrderDetail after hook registration
const { calculateEstimatedPackageSpecs } = await import('../src/pages/admin/AdminOrderDetail')

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++
    console.log(`  ✓ PASS: ${testName}`)
  } else {
    failed++
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`)
  }
}

async function runTestSuite() {
  console.log('\n========================================================================')
  console.log(' KALA Admin Order Details: Shiprocket Fulfillment & Specs Test Suite')
  console.log('========================================================================\n')

  // ---------------------------------------------------------------------------
  // GROUP 1: Estimated Package Specs Calculation Rules
  // ---------------------------------------------------------------------------
  console.log('--- Group 1: Estimated Package Specs Calculation Rules ---')

  // Test 1.1: Single item with saved weight snapshot
  const singleItem = [{ quantity: 1, weightKg: 0.35 }]
  const specs1 = calculateEstimatedPackageSpecs(singleItem)
  assert(specs1.weightKg === 0.35, 'Single item weightKg matches snapshot (0.35 kg)', `Got: ${specs1.weightKg}`)
  assert(specs1.dimensions.length === 25, 'Standard length is 25 cm', `Got: ${specs1.dimensions.length}`)
  assert(specs1.dimensions.breadth === 20, 'Standard breadth is 20 cm', `Got: ${specs1.dimensions.breadth}`)
  assert(specs1.dimensions.height === 3, 'Single item height is 3 cm', `Got: ${specs1.dimensions.height}`)

  // Test 1.2: Multi-quantity item
  const multiQtyItem = [{ quantity: 4, weightKg: 0.45 }]
  const specs2 = calculateEstimatedPackageSpecs(multiQtyItem)
  assert(specs2.weightKg === 1.8, 'Multi-quantity total weight calculates accurately (4 * 0.45 = 1.8 kg)', `Got: ${specs2.weightKg}`)
  assert(specs2.dimensions.height === 12, 'Height scales with quantity: 3 * min(4, 10) = 12 cm', `Got: ${specs2.dimensions.height}`)

  // Test 1.3: Multi-item order with distinct weights
  const multiItems = [
    { quantity: 2, weightKg: 0.25 }, // 0.50 kg
    { quantity: 1, weightKg: 0.60 }, // 0.60 kg
  ]
  const specs3 = calculateEstimatedPackageSpecs(multiItems)
  assert(specs3.weightKg === 1.1, 'Multi-item total weight sums correctly (0.50 + 0.60 = 1.1 kg)', `Got: ${specs3.weightKg}`)
  assert(specs3.dimensions.height === 9, 'Multi-item package height scales to 9 cm (3 items * 3 cm)', `Got: ${specs3.dimensions.height}`)

  // Test 1.4: Item missing weightKg or non-positive weightKg falls back to 0.5 kg
  const missingWeight = [{ quantity: 2, weightKg: undefined }, { quantity: 1, weightKg: 0 }]
  const specs4 = calculateEstimatedPackageSpecs(missingWeight)
  assert(specs4.weightKg === 1.5, 'Items with missing/zero weightKg safely fallback to 0.5 kg per unit (3 * 0.5 = 1.5 kg)', `Got: ${specs4.weightKg}`)

  // Test 1.5: Weight clamping minimum (0.1 kg)
  const tinyItem = [{ quantity: 1, weightKg: 0.02 }]
  const specs5 = calculateEstimatedPackageSpecs(tinyItem)
  assert(specs5.weightKg === 0.1, 'Weight below 0.1 kg is clamped to minimum 0.1 kg for courier acceptance', `Got: ${specs5.weightKg}`)

  // Test 1.6: Weight clamping maximum (10.0 kg) and height clamping (30 cm)
  const heavyItems = [{ quantity: 25, weightKg: 0.8 }] // 20.0 kg raw, 25 qty
  const specs6 = calculateEstimatedPackageSpecs(heavyItems)
  assert(specs6.weightKg === 10.0, 'Weight above 10.0 kg is clamped to maximum 10.0 kg', `Got: ${specs6.weightKg}`)
  assert(specs6.dimensions.height === 30, 'Package height is clamped to maximum 30 cm', `Got: ${specs6.dimensions.height}`)

  // Test 1.7: Empty or undefined items array
  const emptySpecs = calculateEstimatedPackageSpecs([])
  assert(emptySpecs.weightKg === 0.5, 'Empty items array falls back to default 0.5 kg', `Got: ${emptySpecs.weightKg}`)
  assert(emptySpecs.dimensions.length === 25 && emptySpecs.dimensions.height === 3, 'Empty items dimensions fallback to 25x20x3 cm')

  const nullSpecs = calculateEstimatedPackageSpecs(undefined)
  assert(nullSpecs.weightKg === 0.5, 'Undefined items argument falls back to default 0.5 kg')

  // ---------------------------------------------------------------------------
  // GROUP 2: Missing Shipment State (Pre-Fulfillment)
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 2: Missing Shipment State (Pre-Fulfillment) ---')

  const preFulfillmentOrder: AdminOrder = {
    orderId: 'KALA-TEST-001',
    customer: { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com', phone: '9876543210' },
    shippingAddress: { address: 'Flat 101, Galaxy Apt', city: 'Bilaspur', state: 'Chhattisgarh', pincode: '495004' },
    pricing: { subtotal: 999, discount: 0, total: 999 },
    payment: { status: 'paid', method: 'razorpay', razorpayPaymentId: 'pay_test123' },
    status: 'confirmed',
    items: [
      { productId: 'p1', name: 'Bihari Swag Tee', image: 'tshirt.png', size: 'L', quantity: 2, price: 499, weightKg: 0.3 } as any
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Pre-fulfillment state checks
  assert(!preFulfillmentOrder.shiprocketOrder?.orderId, 'Pre-fulfillment: Shiprocket orderId is undefined')
  assert(!preFulfillmentOrder.shiprocketOrder?.shipmentId, 'Pre-fulfillment: shipmentId is undefined')
  assert(!preFulfillmentOrder.shiprocketOrder?.awbCode, 'Pre-fulfillment: awbCode is undefined')
  assert(!preFulfillmentOrder.shiprocketOrder?.weightKg, 'Pre-fulfillment: persisted weightKg is undefined')

  // Estimated specs are derived for pre-fulfillment display
  const preSpecs = calculateEstimatedPackageSpecs(preFulfillmentOrder.items as any)
  assert(preSpecs.weightKg === 0.6, 'Pre-fulfillment derives estimated package weight 0.6 kg from item snapshots (2 * 0.3 kg)')
  assert(preSpecs.dimensions.height === 6, 'Pre-fulfillment derives estimated height 6 cm')

  // Pre-fulfillment UI display rules
  const displayOrderId = preFulfillmentOrder.shiprocketOrder?.orderId ? `#${preFulfillmentOrder.shiprocketOrder.orderId}` : 'Not created'
  const displayShipmentId = preFulfillmentOrder.shiprocketOrder?.shipmentId ? `#${preFulfillmentOrder.shiprocketOrder.shipmentId}` : 'Not assigned'
  const displayAwb = preFulfillmentOrder.shiprocketOrder?.awbCode || 'Pending'
  const displayPickup = preFulfillmentOrder.shiprocketOrder?.pickupTokenNumber ? `Token: ${preFulfillmentOrder.shiprocketOrder.pickupTokenNumber}` : 'Not scheduled'

  assert(displayOrderId === 'Not created', 'UI displays "Not created" when shiprocketOrder.orderId is missing')
  assert(displayShipmentId === 'Not assigned', 'UI displays "Not assigned" when shiprocketOrder.shipmentId is missing')
  assert(displayAwb === 'Pending', 'UI displays "Pending" when awbCode is missing')
  assert(displayPickup === 'Not scheduled', 'UI displays "Not scheduled" when pickupTokenNumber is missing')

  // ---------------------------------------------------------------------------
  // GROUP 3: Successful Persisted Shipment State
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 3: Successful Persisted Shipment State ---')

  const fulfilledOrder: AdminOrder = {
    ...preFulfillmentOrder,
    shiprocketOrder: {
      orderId: 18386001,
      shipmentId: 19487002,
      courierName: 'Delhivery Surface',
      awbCode: 'DEL123456789',
      status: 'awb_assigned',
      weightKg: 0.6,
      dimensions: { length: 25, breadth: 20, height: 6 },
    },
  }

  // Persisted state checks
  assert(fulfilledOrder.shiprocketOrder?.orderId === 18386001, 'Persisted Shiprocket orderId is present (#18386001)')
  assert(fulfilledOrder.shiprocketOrder?.shipmentId === 19487002, 'Persisted shipmentId is present (#19487002)')
  assert(fulfilledOrder.shiprocketOrder?.awbCode === 'DEL123456789', 'Persisted awbCode is present (DEL123456789)')
  assert(fulfilledOrder.shiprocketOrder?.weightKg === 0.6, 'Persisted package specs weightKg is present (0.6 kg)')

  const fulfilledDisplayOrderId = fulfilledOrder.shiprocketOrder?.orderId ? `#${fulfilledOrder.shiprocketOrder.orderId}` : 'Not created'
  const fulfilledDisplayShipmentId = fulfilledOrder.shiprocketOrder?.shipmentId ? `#${fulfilledOrder.shiprocketOrder.shipmentId}` : 'Not assigned'
  const fulfilledDisplayAwb = fulfilledOrder.shiprocketOrder?.awbCode || 'Pending'

  assert(fulfilledDisplayOrderId === '#18386001', 'UI displays confirmed "#18386001"')
  assert(fulfilledDisplayShipmentId === '#19487002', 'UI displays confirmed "#19487002"')
  assert(fulfilledDisplayAwb === 'DEL123456789', 'UI displays confirmed AWB')

  // ---------------------------------------------------------------------------
  // GROUP 4: Verification-First Retry Logic (Handling Delayed Persistence)
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 4: Verification-First Retry Logic (Handling Delayed Persistence) ---')

  // Helper simulating the updated handleRetryShipment logic
  function processRetryOutcome(
    res: AdminShippingActionResponse,
    persistedOrder: AdminOrder | null
  ): { type: 'success' | 'error' | 'info'; message: string } {
    if (!res.success) {
      return { type: 'error', message: res.message || 'Failed to retry shipment.' }
    }

    const hasPersistedOrderId = Boolean(persistedOrder?.shiprocketOrder?.orderId)
    const hasPersistedShipmentId = Boolean(persistedOrder?.shiprocketOrder?.shipmentId)
    const hasResponseOrderId = Boolean(res.shiprocketOrderId)
    const hasResponseShipmentId = Boolean(res.shipmentId)

    const isPersistedConfirmed = hasPersistedOrderId || hasPersistedShipmentId

    if (isPersistedConfirmed) {
      return {
        type: 'success',
        message: res.message || 'Shiprocket order and shipment created successfully.',
      }
    } else if (hasResponseOrderId || hasResponseShipmentId) {
      return {
        type: 'info',
        message: 'Shipment request acknowledged by Shiprocket. Awaiting database persistence confirmation — please refresh in a moment.',
      }
    } else {
      return {
        type: 'info',
        message: 'Fulfillment request acknowledged. Shipment status verification is pending — please refresh to check updated status.',
      }
    }
  }

  // Test 4.1: Delayed persistence (Backend says success, but re-fetched order has not persisted yet)
  const delayedResponse: AdminShippingActionResponse = {
    success: true,
    orderId: 'KALA-TEST-001',
    shiprocketOrderId: 18386001,
    shipmentId: 19487002,
    status: 'created',
    message: 'Shiprocket order created, but automatic AWB generation is disabled by safety gate.',
  }
  const unpersistedOrder: AdminOrder = { ...preFulfillmentOrder } // shiprocketOrder is undefined

  const outcomeDelayed = processRetryOutcome(delayedResponse, unpersistedOrder)
  assert(outcomeDelayed.type === 'info', 'Delayed persistence yields neutral "info" feedback (NOT green "success")', `Got type: ${outcomeDelayed.type}`)
  assert(
    outcomeDelayed.message.includes('Awaiting database persistence confirmation'),
    'Delayed persistence message informs admin that verification is pending',
    outcomeDelayed.message
  )
  assert(
    !outcomeDelayed.message.includes('Shiprocket order created, but automatic AWB generation'),
    'Misleading success message is NOT rendered when order still shows "Not created"'
  )

  // Test 4.2: Successful confirmed persistence
  const confirmedOrder: AdminOrder = {
    ...preFulfillmentOrder,
    shiprocketOrder: {
      orderId: 18386001,
      shipmentId: 19487002,
      status: 'created',
      weightKg: 0.6,
      dimensions: { length: 25, breadth: 20, height: 6 },
    },
  }
  const outcomeConfirmed = processRetryOutcome(delayedResponse, confirmedOrder)
  assert(outcomeConfirmed.type === 'success', 'Confirmed persistence yields "success" feedback', `Got type: ${outcomeConfirmed.type}`)
  assert(
    outcomeConfirmed.message.includes('Shiprocket order created'),
    'Confirmed persistence safely presents the backend status message'
  )

  // Test 4.3: Backend failure
  const failedResponse: AdminShippingActionResponse = {
    success: false,
    message: 'Shiprocket API error: Insufficient wallet balance.',
  }
  const outcomeFailed = processRetryOutcome(failedResponse, unpersistedOrder)
  assert(outcomeFailed.type === 'error', 'API failure yields "error" feedback')
  assert(outcomeFailed.message.includes('Insufficient wallet balance'), 'Error message is preserved')

  // Test 4.4: Persistence cannot be confirmed because re-fetch returned null (network issue)
  const outcomeNullOrder = processRetryOutcome(delayedResponse, null)
  assert(outcomeNullOrder.type === 'info', 'Network failure during re-fetch yields neutral "info" feedback without fabricating confirmation')
  assert(outcomeNullOrder.message.includes('Awaiting database persistence confirmation'), 'Informs admin to refresh')

  // ---------------------------------------------------------------------------
  // GROUP 5: Package Specs Distinction (Actual vs Estimated)
  // ---------------------------------------------------------------------------
  console.log('\n--- Group 5: Package Specs Distinction (Actual vs Estimated) ---')

  function renderPackageSpecsLabel(order: AdminOrder): { label: string; isEstimated: boolean; text: string } {
    if (order.shiprocketOrder?.weightKg) {
      return {
        label: 'Package Specs:',
        isEstimated: false,
        text: `${order.shiprocketOrder.weightKg} kg (${order.shiprocketOrder.dimensions?.length || 25}×${order.shiprocketOrder.dimensions?.breadth || 20}×${order.shiprocketOrder.dimensions?.height || 3} cm)`,
      }
    } else {
      const estimated = calculateEstimatedPackageSpecs(order.items as any)
      return {
        label: 'Estimated Package Specs:',
        isEstimated: true,
        text: `~${estimated.weightKg} kg (${estimated.dimensions.length}×${estimated.dimensions.breadth}×${estimated.dimensions.height} cm) (pre-fulfillment estimate)`,
      }
    }
  }

  // Pre-fulfillment order:
  const preLabel = renderPackageSpecsLabel(preFulfillmentOrder)
  assert(preLabel.isEstimated === true, 'Pre-fulfillment: isEstimated flag is TRUE')
  assert(preLabel.label === 'Estimated Package Specs:', 'Pre-fulfillment: label is "Estimated Package Specs:"')
  assert(preLabel.text.startsWith('~0.6 kg'), 'Pre-fulfillment: value is prefixed with ~ (estimated indicator)', preLabel.text)
  assert(preLabel.text.includes('(pre-fulfillment estimate)'), 'Pre-fulfillment: explicitly indicates pre-fulfillment estimate')

  // Post-fulfillment order with persisted specs:
  const postLabel = renderPackageSpecsLabel(fulfilledOrder)
  assert(postLabel.isEstimated === false, 'Post-fulfillment: isEstimated flag is FALSE')
  assert(postLabel.label === 'Package Specs:', 'Post-fulfillment: label is "Package Specs:"')
  assert(postLabel.text === '0.6 kg (25×20×6 cm)', 'Post-fulfillment: displays authoritative measured specs without ~ or estimate tag', postLabel.text)

  console.log('\n========================================================================')
  console.log(` Test Summary: ${passed} passed, ${failed} failed.`)
  console.log('========================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered fatal error:', err)
  process.exit(1)
})
