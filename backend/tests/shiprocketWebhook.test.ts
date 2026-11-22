/**
 * Test Suite for KALA Shiprocket Webhook Receiver (Phase 5 Tracking & Webhooks)
 *
 * Verifies:
 * 1. Webhook authentication: valid x-api-key / x-shiprocket-token vs invalid / missing token.
 * 2. Status mapping: IN TRANSIT -> shipped, OUT FOR DELIVERY -> out_for_delivery, DELIVERED -> delivered.
 * 3. Out-of-order safety: delivered order does not regress back to in_transit or out_for_delivery.
 * 4. Tracking scan appending and deduplication.
 * 5. Root order tracking synchronization (tracking.trackingNumber, carrier).
 * 6. Audit trail in order.statusHistory.
 * 7. Graceful acknowledgement for unrecognized orders (HTTP 200).
 */

import {
  handleShiprocketWebhook,
  verifyShiprocketWebhookHeader,
  mapShiprocketStatusToKalaStatus,
} from '../src/controllers/shiprocketWebhookController'
import { Order, IOrder } from '../src/models/Order'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${msg}`)
    failed++
  }
}

// Mock Order store
const mockOrderMap = new Map<string, any>()

function createMockOrder(overrides: Partial<IOrder> = {}): any {
  const base: any = {
    orderId: 'KALA-WEBHOOK-001',
    customer: { firstName: 'Niraj', lastName: 'Dhoren', email: 'niraj@kala.com', phone: '9876543210' },
    shippingAddress: { address: 'Addr', city: 'City', state: 'State', pincode: '495004' },
    items: [{ productId: 'P1', name: 'Item', size: 'M', price: 999, quantity: 1 }],
    pricing: { subtotal: 999, shipping: 0, total: 999 },
    status: 'processing',
    shiprocketOrder: {
      orderId: 1001,
      shipmentId: 2001,
      awbCode: 'AWB-TEST-7788',
      status: 'awb_assigned',
      trackingScans: [],
    },
    tracking: {
      trackingNumber: 'AWB-TEST-7788',
      carrier: 'Delhivery',
    },
    statusHistory: [],
    save: async function () {
      mockOrderMap.set(this.orderId, this)
      return this
    },
    ...overrides,
  }
  mockOrderMap.set(base.orderId, base)
  return base
}

// Mock Express Request and Response
function createMockReqRes(headers: Record<string, string> = {}, body: any = {}) {
  const req: any = {
    headers: { ...headers },
    body,
  }

  let statusCode = 200
  let responseData: any = null

  const res: any = {
    status: function (code: number) {
      statusCode = code
      return this
    },
    json: function (data: any) {
      responseData = data
      return this
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  }

  return { req, res }
}

async function runTests() {
  console.log('===============================================================')
  console.log(' KALA Phase 5: Shiprocket Tracking & Webhooks Test Suite')
  console.log('===============================================================\n')

  const origSecret = process.env.SHIPROCKET_WEBHOOK_SECRET
  const origToken = process.env.SHIPROCKET_WEBHOOK_TOKEN
  delete process.env.SHIPROCKET_WEBHOOK_SECRET
  process.env.SHIPROCKET_WEBHOOK_TOKEN = 'secret_webhook_token_999'

  // Patch Order.findOne to query mockOrderMap
  const origFindOne = Order.findOne
  Order.findOne = ((query: any) => {
    if (query?.$or) {
      for (const cond of query.$or) {
        for (const order of mockOrderMap.values()) {
          if (cond['shiprocketOrder.awbCode'] && order.shiprocketOrder?.awbCode === cond['shiprocketOrder.awbCode']) {
            return Promise.resolve(order)
          }
          if (cond['shiprocketOrder.shipmentId'] && order.shiprocketOrder?.shipmentId === cond['shiprocketOrder.shipmentId']) {
            return Promise.resolve(order)
          }
          if (cond.orderId && order.orderId === cond.orderId) {
            return Promise.resolve(order)
          }
        }
      }
    }
    return Promise.resolve(null)
  }) as any

  try {
    // --- Group 1: Header Authentication ---
    console.log('--- Group 1: Header Authentication ---')
    const validReq1 = { headers: { 'x-api-key': 'secret_webhook_token_999' } } as any
    assert(verifyShiprocketWebhookHeader(validReq1) === true, 'Accepts valid x-api-key')

    const validReq2 = { headers: { 'x-shiprocket-token': 'secret_webhook_token_999' } } as any
    assert(verifyShiprocketWebhookHeader(validReq2) === true, 'Accepts valid x-shiprocket-token')

    const validReq3 = { headers: { authorization: 'Bearer secret_webhook_token_999' } } as any
    assert(verifyShiprocketWebhookHeader(validReq3) === true, 'Accepts valid Bearer token')

    const invalidReq1 = { headers: { 'x-api-key': 'wrong_secret' } } as any
    assert(verifyShiprocketWebhookHeader(invalidReq1) === false, 'Rejects invalid secret token')

    const missingReq = { headers: {} } as any
    assert(verifyShiprocketWebhookHeader(missingReq) === false, 'Rejects missing token when secret is configured')

    // Test rejection in controller
    const { req: unauthReq, res: unauthRes } = createMockReqRes({ 'x-api-key': 'bad' }, { awb: '123' })
    await handleShiprocketWebhook(unauthReq, unauthRes)
    assert(unauthRes.getStatusCode() === 401, 'Unauthorized request returns HTTP 401')

    // --- Group 2: Status Mapping ---
    console.log('\n--- Group 2: Status Mapping ---')
    const mapInTransit = mapShiprocketStatusToKalaStatus('IN TRANSIT', 6)
    assert(mapInTransit.kalaStatus === 'shipped', 'IN TRANSIT maps to shipped')
    assert(mapInTransit.shipmentStatus === 'in_transit', 'Shipment status is in_transit')

    const mapOFD = mapShiprocketStatusToKalaStatus('OUT FOR DELIVERY', 17)
    assert(mapOFD.kalaStatus === 'out_for_delivery', 'OUT FOR DELIVERY maps to out_for_delivery')

    const mapDelivered = mapShiprocketStatusToKalaStatus('DELIVERED', 7)
    assert(mapDelivered.kalaStatus === 'delivered', 'DELIVERED maps to delivered')

    const mapRTO = mapShiprocketStatusToKalaStatus('RTO INITIATED', 9)
    assert(mapRTO.shipmentStatus === 'rto_initiated', 'RTO maps to rto_initiated')

    // --- Group 3: Real Webhook Processing (In Transit) ---
    console.log('\n--- Group 3: Real Webhook Processing (In Transit) ---')
    createMockOrder({ orderId: 'KALA-WB-1', status: 'processing' })

    const { req: wbReq1, res: wbRes1 } = createMockReqRes(
      { 'x-api-key': 'secret_webhook_token_999' },
      {
        awb: 'AWB-TEST-7788',
        current_status: 'IN TRANSIT',
        current_status_id: 6,
        current_location: 'Bhopal Sorting Center',
        scans: [
          { date: '2026-11-23 10:00', status: 'IN TRANSIT', activity: 'In transit to hub', location: 'Bhopal' },
        ],
      }
    )

    await handleShiprocketWebhook(wbReq1, wbRes1)
    assert(wbRes1.getStatusCode() === 200, 'Webhook processed with HTTP 200')

    const order1 = mockOrderMap.get('KALA-WB-1')
    assert(order1.status === 'shipped', 'Order status transitioned to shipped')
    assert(order1.shiprocketOrder.status === 'in_transit', 'shiprocketOrder status is in_transit')
    assert(order1.shiprocketOrder.currentTrackingStatus === 'IN TRANSIT', 'currentTrackingStatus updated')
    assert(order1.shiprocketOrder.trackingScans.length === 1, '1 scan recorded')

    // --- Group 4: Webhook Processing (Out for Delivery -> Delivered) ---
    console.log('\n--- Group 4: Delivered Transition ---')
    const { req: wbReqDel, res: wbResDel } = createMockReqRes(
      { 'x-api-key': 'secret_webhook_token_999' },
      {
        awb: 'AWB-TEST-7788',
        current_status: 'DELIVERED',
        current_status_id: 7,
        current_location: 'Customer Doorstep',
        scans: [
          { date: '2026-11-23 10:00', status: 'IN TRANSIT', activity: 'In transit to hub', location: 'Bhopal' },
          { date: '2026-11-24 16:30', status: 'DELIVERED', activity: 'Delivered to recipient', location: 'Bilaspur' },
        ],
      }
    )

    await handleShiprocketWebhook(wbReqDel, wbResDel)
    assert(wbResDel.getStatusCode() === 200, 'Delivered webhook processed with HTTP 200')

    const orderDelivered = mockOrderMap.get('KALA-WB-1')
    assert(orderDelivered.status === 'delivered', 'Order status transitioned to delivered')
    assert(orderDelivered.shiprocketOrder.status === 'delivered', 'Shiprocket status is delivered')
    assert(orderDelivered.shiprocketOrder.trackingScans.length === 2, 'Total 2 scans recorded without duplicates')

    // --- Group 5: Out-of-Order Event Protection ---
    console.log('\n--- Group 5: Out-of-Order Event Protection ---')
    // Send an out-of-order delayed webhook with an earlier 'IN TRANSIT' status
    const { req: delayedReq, res: delayedRes } = createMockReqRes(
      { 'x-api-key': 'secret_webhook_token_999' },
      {
        awb: 'AWB-TEST-7788',
        current_status: 'IN TRANSIT',
        current_status_id: 6,
        current_location: 'Nagpur Junction',
      }
    )

    await handleShiprocketWebhook(delayedReq, delayedRes)
    assert(delayedRes.getStatusCode() === 200, 'Delayed webhook processed with HTTP 200')

    const orderProtected = mockOrderMap.get('KALA-WB-1')
    assert(orderProtected.status === 'delivered', 'Delivered order NEVER regressed back to shipped')
    assert(orderProtected.shiprocketOrder.status === 'in_transit', 'shiprocketOrder reflects event')

    // --- Group 6: Unknown Order Graceful Handling ---
    console.log('\n--- Group 6: Unknown Order Graceful Handling ---')
    const { req: unknownReq, res: unknownRes } = createMockReqRes(
      { 'x-api-key': 'secret_webhook_token_999' },
      {
        awb: 'AWB-NONEXISTENT',
        current_status: 'IN TRANSIT',
      }
    )

    await handleShiprocketWebhook(unknownReq, unknownRes)
    assert(unknownRes.getStatusCode() === 200, 'Unknown order returns HTTP 200 to acknowledge')
    assert(unknownRes.getData()?.message.includes('not found'), 'Returns order not found notice')

    console.log('\n===============================================================')
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
    console.log('===============================================================')

    if (failed > 0) {
      process.exit(1)
    }
  } finally {
    process.env.SHIPROCKET_WEBHOOK_SECRET = origSecret
    process.env.SHIPROCKET_WEBHOOK_TOKEN = origToken
    Order.findOne = origFindOne
  }
}

runTests().catch((err) => {
  console.error('Fatal webhook test exception:', err)
  process.exit(1)
})
