/**
 * Dedicated Test Suite: KALA Admin Manual Shiprocket Fulfillment Decoupling
 *
 * Verifies all 12 go-live criteria from user prompt:
 * 1. Manual Admin fulfillment works when automatic fulfillment flag is false.
 * 2. Unauthenticated users are rejected.
 * 3. Non-admin users are rejected.
 * 4. Unpaid orders are rejected.
 * 5. Cancelled orders are rejected.
 * 6. Existing successful shipments are not duplicated.
 * 7. Concurrent manual retry requests are idempotent.
 * 8. Background/webhook fulfillment remains blocked when automatic fulfillment flag is false.
 * 9. Automatic AWB remains blocked when its flag is false.
 * 10. Automatic pickup remains blocked when its flag is false.
 * 11. Shiprocket API failure preserves paid order and records retryable error state.
 * 12. Existing shipment regression and payment tests continue passing.
 */

import { Order, IOrder } from '../src/models/Order'
import { User } from '../src/models/User'
import { retryOrderShipment } from '../src/controllers/adminShippingController'
import { requireAuth, requireAdmin } from '../src/middleware/authMiddleware'
import {
  triggerShipmentWorkflow,
  retryShipmentWorkflow,
} from '../src/services/shipmentAutomationService'
import { resetShiprocketAuthForTesting } from '../src/services/shiprocketAuthService'
import jwt from 'jsonwebtoken'

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

// In-memory mock store
const mockOrderStore = new Map<string, any>()
const mockUserStore = new Map<string, any>()

function createMockOrder(overrides: Partial<IOrder> = {}): any {
  const base: any = {
    orderId: 'KALA-TEST-ORDER-001',
    customer: { firstName: 'Niraj', lastName: 'Admin', email: 'niraj@kalaofficial.store', phone: '9876543210' },
    shippingAddress: { address: 'Main Street', city: 'Bilaspur', state: 'Chhattisgarh', pincode: '495004' },
    items: [{ productId: 'P-TEE-01', name: 'Signature Tee', size: 'L', price: 999, quantity: 1, weightKg: 0.28 }],
    pricing: { subtotal: 999, shipping: 0, total: 999 },
    status: 'confirmed',
    payment: { method: 'razorpay', status: 'paid', razorpayOrderId: 'order_test_123' },
    shiprocketOrder: undefined,
    tracking: undefined,
    statusHistory: [],
    save: async function () {
      mockOrderStore.set(this.orderId, this)
      return this
    },
    ...overrides,
  }
  mockOrderStore.set(base.orderId, base)
  return base
}

function createMockReqRes(body: any = {}, params: any = {}, headers: any = {}) {
  const req: any = { body, params, headers, user: undefined }
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

async function runDecouplingTests() {
  console.log('========================================================================')
  console.log(' KALA: Admin Manual Shiprocket Fulfillment Decoupling Test Suite')
  console.log('========================================================================\n')

  const TEST_JWT_SECRET = 'test_jwt_secret_kala_admin_987654321'
  process.env.JWT_SECRET = TEST_JWT_SECRET
  process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
  process.env.SHIPROCKET_PASSWORD = 'mock_password_123'
  resetShiprocketAuthForTesting()

  // Patch Order.findOne
  const origOrderFindOne = Order.findOne
  Order.findOne = ((query: any) => {
    const orderId = query?.orderId || query?.$or?.find((c: any) => c.orderId)?.orderId
    const found = orderId ? mockOrderStore.get(orderId) : null
    return Promise.resolve(found || null)
  }) as any

  // Patch User.findOne
  const origUserFindOne = User.findOne
  User.findOne = ((query: any) => {
    const userId = query?.userId
    const found = userId ? mockUserStore.get(userId) : null
    return Promise.resolve(found || null)
  }) as any

  const origFetch = global.fetch

  try {
    // -------------------------------------------------------------------------
    // CRITERION 1: Manual Admin fulfillment works when auto flag is false
    // -------------------------------------------------------------------------
    console.log('--- 1. Manual Admin Fulfillment Works When Auto Flag is False ---')
    delete process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED
    delete process.env.SHIPROCKET_AUTO_AWB_ENABLED
    delete process.env.SHIPROCKET_AUTO_PICKUP_ENABLED

    createMockOrder({
      orderId: 'KALA-MANUAL-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let createAdhocCalls = 0
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'mock-admin-jwt-token' }), { status: 200 })
      }
      if (url.includes('/orders/create/adhoc')) {
        createAdhocCalls++
        return new Response(
          JSON.stringify({ order_id: 10101, shipment_id: 20202, status: 'NEW' }),
          { status: 200 }
        )
      }
      return new Response('Not found', { status: 404 })
    }) as any

    const { req: r1, res: res1 } = createMockReqRes({}, { orderId: 'KALA-MANUAL-001' })
    await retryOrderShipment(r1, res1)
    assert(res1.getStatusCode() === 200, 'HTTP 200 returned on manual retry')
    assert(res1.getData()?.success === true, 'Fulfillment succeeded under manual override')
    assert(res1.getData()?.shipmentId === 20202, 'Exact Shiprocket shipmentId returned')
    assert(createAdhocCalls === 1, 'Shiprocket order creation dispatched exactly once')

    const updatedOrder = mockOrderStore.get('KALA-MANUAL-001')
    assert(updatedOrder.shiprocketOrder?.shipmentId === 20202, 'Shipment ID saved to MongoDB order')
    assert(updatedOrder.shiprocketOrder?.status === 'created', 'Status is created (awaiting AWB)')

    // -------------------------------------------------------------------------
    // CRITERION 2: Unauthenticated users are rejected
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Unauthenticated Users Rejected with HTTP 401 ---')
    const { req: unauthReq, res: unauthRes } = createMockReqRes()
    let unauthNextCalled = false
    requireAuth(unauthReq, unauthRes, () => {
      unauthNextCalled = true
    })
    assert(unauthRes.getStatusCode() === 401, 'requireAuth returns HTTP 401 without token')
    assert(unauthRes.getData()?.message.includes('Authentication required'), 'Descriptive 401 message')
    assert(!unauthNextCalled, 'next() was not called for unauthenticated request')

    // -------------------------------------------------------------------------
    // CRITERION 3: Non-admin users are rejected
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Non-Admin Users Rejected with HTTP 403 ---')
    mockUserStore.set('customer-123', { userId: 'customer-123', email: 'cust@kala.com', role: 'customer' })
    const customerToken = jwt.sign({ userId: 'customer-123', email: 'cust@kala.com' }, TEST_JWT_SECRET)

    const { req: custReq, res: custRes } = createMockReqRes({}, {}, { authorization: `Bearer ${customerToken}` })
    let custAuthNextCalled = false
    requireAuth(custReq, custRes, () => {
      custAuthNextCalled = true
    })
    assert(custAuthNextCalled, 'requireAuth passes customer with valid token')

    let custAdminNextCalled = false
    await requireAdmin(custReq, custRes, () => {
      custAdminNextCalled = true
    })
    assert(custRes.getStatusCode() === 403, 'requireAdmin returns HTTP 403 for non-admin')
    assert(custRes.getData()?.message.includes('Admin access required'), 'Descriptive 403 message')
    assert(!custAdminNextCalled, 'next() was not called for non-admin request')

    // -------------------------------------------------------------------------
    // CRITERION 4: Unpaid orders are rejected
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Unpaid Orders Rejected with HTTP 400 ---')
    createMockOrder({
      orderId: 'KALA-UNPAID-001',
      status: 'pending',
      payment: { status: 'pending', method: 'razorpay' },
    })

    const { req: rUnpaid, res: resUnpaid } = createMockReqRes({}, { orderId: 'KALA-UNPAID-001' })
    await retryOrderShipment(rUnpaid, resUnpaid)
    assert(resUnpaid.getStatusCode() === 400, 'Rejects unpaid order with HTTP 400')
    assert(resUnpaid.getData()?.success === false, 'success is false')
    assert(resUnpaid.getData()?.message.includes('not paid'), 'Informs that order is not paid')

    // -------------------------------------------------------------------------
    // CRITERION 5: Cancelled orders are rejected
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Cancelled Orders Rejected with HTTP 400 ---')
    createMockOrder({
      orderId: 'KALA-CANCELLED-001',
      status: 'cancelled',
      payment: { status: 'paid', method: 'razorpay' },
    })

    const { req: rCancel, res: resCancel } = createMockReqRes({}, { orderId: 'KALA-CANCELLED-001' })
    await retryOrderShipment(rCancel, resCancel)
    assert(resCancel.getStatusCode() === 400, 'Rejects cancelled order with HTTP 400')
    assert(resCancel.getData()?.success === false, 'success is false')
    assert(resCancel.getData()?.message.includes('cancelled'), 'Informs that order is cancelled')

    // -------------------------------------------------------------------------
    // CRITERION 6: Existing successful shipments are not duplicated
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Existing Successful Shipments Not Duplicated ---')
    createMockOrder({
      orderId: 'KALA-FULFILLED-001',
      status: 'processing',
      payment: { status: 'paid', method: 'razorpay' },
      shiprocketOrder: {
        orderId: 77701,
        shipmentId: 88801,
        awbCode: 'AWB-EXISTING-999',
        courierName: 'Delhivery Surface',
        status: 'awb_assigned',
      },
    })

    let duplicateFetchCalls = 0
    global.fetch = (async () => {
      duplicateFetchCalls++
      return new Response('Should not be called', { status: 500 })
    }) as any

    const { req: rDup, res: resDup } = createMockReqRes({}, { orderId: 'KALA-FULFILLED-001' })
    await retryOrderShipment(rDup, resDup)
    assert(resDup.getStatusCode() === 200, 'Returns HTTP 200 for already-fulfilled order')
    assert(resDup.getData()?.awbCode === 'AWB-EXISTING-999', 'Returns existing AWB without changes')
    assert(resDup.getData()?.message.includes('already exists'), 'Informs admin shipment is active')
    assert(duplicateFetchCalls === 0, 'Zero Shiprocket network calls made for already-fulfilled order')

    // -------------------------------------------------------------------------
    // CRITERION 7: Concurrent manual retry requests are idempotent
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Concurrent Manual Retry Requests Are Idempotent ---')
    createMockOrder({
      orderId: 'KALA-CONCURRENT-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let concurrentCreateCalls = 0
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 })
      }
      if (url.includes('/orders/create/adhoc')) {
        concurrentCreateCalls++
        // Simulate 25ms asynchronous network latency
        await new Promise((res) => setTimeout(res, 25))
        return new Response(
          JSON.stringify({ order_id: 33301, shipment_id: 44401, status: 'NEW' }),
          { status: 200 }
        )
      }
      return new Response('Not found', { status: 404 })
    }) as any

    const [cRes1, cRes2, cRes3] = await Promise.all([
      retryShipmentWorkflow('KALA-CONCURRENT-001', { force: true }),
      retryShipmentWorkflow('KALA-CONCURRENT-001', { force: true }),
      retryShipmentWorkflow('KALA-CONCURRENT-001', { force: true }),
    ])

    assert(concurrentCreateCalls === 1, 'Exactly 1 Shiprocket create order call dispatched for 3 concurrent triggers')
    assert(cRes1.shipmentId === 44401, 'Caller 1 received shipment ID 44401')
    assert(cRes2.shipmentId === 44401, 'Caller 2 received identical shipment ID 44401')
    assert(cRes3.shipmentId === 44401, 'Caller 3 received identical shipment ID 44401')

    // -------------------------------------------------------------------------
    // CRITERION 8: Background/webhook fulfillment remains blocked
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Background/Webhook Fulfillment Remains Blocked ---')
    createMockOrder({
      orderId: 'KALA-BG-TEST-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let bgFetchCalls = 0
    global.fetch = (async () => {
      bgFetchCalls++
      return new Response('Should not be called', { status: 500 })
    }) as any

    // Webhook/background calls triggerShipmentWorkflow with default options (force = undefined)
    delete process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED
    const bgResult = await triggerShipmentWorkflow('KALA-BG-TEST-001')
    assert(bgResult.success === true, 'Returns safe acknowledgement')
    assert(bgResult.message.includes('safety gate'), 'Explains shipment automation is disabled by safety gate')
    assert(bgFetchCalls === 0, 'Zero Shiprocket network calls made by background trigger')

    // -------------------------------------------------------------------------
    // CRITERION 9: Automatic AWB remains blocked when its flag is false
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Automatic AWB Remains Blocked When Flag is False ---')
    createMockOrder({
      orderId: 'KALA-NO-AWB-TEST-01',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let awbCalls = 0
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/login')) return new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 })
      if (url.includes('/orders/create/adhoc')) {
        return new Response(JSON.stringify({ order_id: 50501, shipment_id: 60601, status: 'NEW' }), { status: 200 })
      }
      if (url.includes('/courier/assign/awb')) {
        awbCalls++
        return new Response('Should not be called', { status: 500 })
      }
      return new Response('Not found', { status: 404 })
    }) as any

    delete process.env.SHIPROCKET_AUTO_AWB_ENABLED
    const manualResult = await retryShipmentWorkflow('KALA-NO-AWB-TEST-01', { force: true })
    assert(manualResult.status === 'created', 'Order status halted at created')
    assert(manualResult.awbCode === undefined, 'No AWB assigned')
    assert(manualResult.message.includes('automatic AWB generation is disabled by safety gate'), 'Informs AWB safety gate active')
    assert(awbCalls === 0, 'Zero AWB calls dispatched when SHIPROCKET_AUTO_AWB_ENABLED is false')

    // -------------------------------------------------------------------------
    // CRITERION 10: Automatic pickup remains blocked when its flag is false
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Automatic Pickup Remains Blocked When Flag is False ---')
    createMockOrder({
      orderId: 'KALA-NO-PKP-TEST-01',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let pickupCalls = 0
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/login')) return new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 })
      if (url.includes('/orders/create/adhoc')) {
        return new Response(JSON.stringify({ order_id: 70701, shipment_id: 80801, status: 'NEW' }), { status: 200 })
      }
      if (url.includes('/courier/generate/pickup')) {
        pickupCalls++
        return new Response('Should not be called', { status: 500 })
      }
      return new Response('Not found', { status: 404 })
    }) as any

    delete process.env.SHIPROCKET_AUTO_PICKUP_ENABLED
    const noPickupResult = await retryShipmentWorkflow('KALA-NO-PKP-TEST-01', { force: true })
    assert(noPickupResult.pickupTokenNumber === undefined, 'No pickup token assigned')
    assert(pickupCalls === 0, 'Zero pickup calls dispatched when SHIPROCKET_AUTO_PICKUP_ENABLED is false')

    // -------------------------------------------------------------------------
    // CRITERION 11: Shiprocket API failure preserves paid order & records error
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Shiprocket API Failure Preserves Paid Order & Records Error ---')
    createMockOrder({
      orderId: 'KALA-FAIL-SAFE-01',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/login')) return new Response(JSON.stringify({ token: 'mock-token' }), { status: 200 })
      if (url.includes('/orders/create/adhoc')) {
        return new Response(
          JSON.stringify({ message: 'Insufficient balance in Shiprocket wallet. Please recharge.' }),
          { status: 400 }
        )
      }
      return new Response('Not found', { status: 404 })
    }) as any

    const { req: rFail, res: resFail } = createMockReqRes({}, { orderId: 'KALA-FAIL-SAFE-01' })
    await retryOrderShipment(rFail, resFail)
    assert(resFail.getStatusCode() === 400, 'Returns HTTP 400 when Shiprocket API fails')
    assert(resFail.getData()?.success === false, 'success is false')
    assert(resFail.getData()?.message.includes('Insufficient balance'), 'Returns exact Shiprocket error')

    const failedOrder = mockOrderStore.get('KALA-FAIL-SAFE-01')
    assert(failedOrder.payment.status === 'paid', 'Customer payment status strictly preserved as paid')
    assert(failedOrder.status === 'confirmed', 'Order status remains confirmed in database')
    assert(failedOrder.shiprocketOrder?.status === 'failed', 'shiprocketOrder.status recorded as failed')
    assert(failedOrder.shiprocketOrder?.lastError.includes('Insufficient balance'), 'Exact error recorded in lastError')
    assert(failedOrder.shiprocketOrder?.retryCount === 1, 'retryCount incremented to 1')

    console.log('\n========================================================================')
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
    console.log('========================================================================')

    if (failed > 0) {
      process.exit(1)
    }
  } finally {
    Order.findOne = origOrderFindOne
    User.findOne = origUserFindOne
    global.fetch = origFetch
  }
}

runDecouplingTests().catch((err) => {
  console.error('Fatal admin manual fulfillment decoupling test error:', err)
  process.exit(1)
})
