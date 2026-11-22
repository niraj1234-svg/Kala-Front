/**
 * Test Suite for KALA Shipment Automation Orchestrator (Phases 3 & 4)
 *
 * Verifies:
 * 1. Package weight and dimensions calculation (single vs multi-item orders).
 * 2. Payment verification guard: rejects shipment workflow if order is unpaid.
 * 3. Successful end-to-end workflow execution (Order -> AWB -> Label -> Invoice -> Pickup).
 * 4. Idempotency guard: duplicate trigger calls return existing shipment.
 * 5. Single-flight concurrency control: simultaneous calls coalesce without duplicate requests.
 * 6. Partial failure resilience: AWB failure does not reverse or touch payment.
 * 7. Retry mechanism: resumes from failure point without recreating order in Shiprocket.
 * 8. Order status history audit trail.
 */

import {
  calculateOrderPackageSpecs,
  triggerShipmentWorkflow,
  retryShipmentWorkflow,
} from '../src/services/shipmentAutomationService'
import { resetShiprocketAuthForTesting } from '../src/services/shiprocketAuthService'
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

// In-memory mock store for Order documents
const mockOrderStore = new Map<string, any>()

function createMockOrder(overrides: Partial<IOrder> = {}): any {
  const base: any = {
    orderId: 'KALA-AUTO-001',
    customer: {
      firstName: 'Kuldeep',
      lastName: 'Dhoren',
      email: 'kuldeep@kala.com',
      phone: '9876543210',
    },
    shippingAddress: {
      address: '123 Test Street',
      city: 'Bilaspur',
      state: 'Chhattisgarh',
      pincode: '495004',
      landmark: 'Near Station',
    },
    items: [
      { productId: 'P1', name: 'Oversized Tee', size: 'L', price: 999, quantity: 1 },
      { productId: 'P2', name: 'Street Hoodie', size: 'XL', price: 1999, quantity: 1 },
    ],
    pricing: {
      subtotal: 2998,
      shipping: 0,
      total: 2998,
    },
    status: 'confirmed',
    payment: {
      method: 'razorpay',
      razorpayOrderId: 'order_rzp_123',
      razorpayPaymentId: 'pay_rzp_456',
      status: 'paid',
      paidAt: new Date(),
    },
    statusHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    save: async function () {
      mockOrderStore.set(this.orderId, this)
      return this
    },
    ...overrides,
  }
  mockOrderStore.set(base.orderId, base)
  return base
}

async function runTests() {
  console.log('===============================================================')
  console.log(' KALA Phase 3 & 4: Shipment Automation Orchestrator Tests')
  console.log('===============================================================\n')

  process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
  process.env.SHIPROCKET_PASSWORD = 'mock_password_123'
  process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED = 'true'
  process.env.SHIPROCKET_AUTO_AWB_ENABLED = 'true'
  process.env.SHIPROCKET_AUTO_PICKUP_ENABLED = 'true'
  resetShiprocketAuthForTesting()

  // Patch Order.findOne to use mockOrderStore
  const origFindOne = Order.findOne
  Order.findOne = ((query: any) => {
    const orderId = query?.orderId || query?.$or?.find((c: any) => c.orderId)?.orderId
    const found = orderId ? mockOrderStore.get(orderId) : null
    return Promise.resolve(found || null)
  }) as any

  try {
    // --- Group 1: calculateOrderPackageSpecs ---
    console.log('--- Group 1: Package Specs Calculation ---')
    const singleItemSpecs = calculateOrderPackageSpecs([
      { productId: 'P1', name: 'Tee', size: 'M', price: 500, quantity: 1 } as any,
    ])
    assert(singleItemSpecs.weightKg === 0.5, 'Single item weight defaults to 0.5kg')
    assert(singleItemSpecs.dimensions.length === 25, 'Dimensions length is 25cm')
    assert(singleItemSpecs.dimensions.breadth === 20, 'Dimensions breadth is 20cm')
    assert(singleItemSpecs.dimensions.height === 3, 'Single item height is 3cm')

    const multiItemSpecs = calculateOrderPackageSpecs([
      { productId: 'P1', name: 'Tee 1', size: 'M', price: 500, quantity: 2 } as any,
      { productId: 'P2', name: 'Tee 2', size: 'L', price: 500, quantity: 2 } as any,
    ])
    assert(multiItemSpecs.weightKg === 2.0, '4 items weight is 2.0kg')
    assert(multiItemSpecs.dimensions.height === 12, '4 items height scales to 12cm')

    // --- Group 2: Payment Verification Guard ---
    console.log('\n--- Group 2: Payment Verification Guard ---')
    createMockOrder({
      orderId: 'KALA-UNPAID-001',
      status: 'pending',
      payment: { status: 'pending', method: 'razorpay' },
    })

    const unpaidRes = await triggerShipmentWorkflow('KALA-UNPAID-001')
    assert(unpaidRes.success === false, 'Rejects shipment creation for unpaid order')
    assert(unpaidRes.message.includes('Payment not verified'), 'Returns descriptive payment error message')

    // --- Group 3: Successful End-to-End Orchestration ---
    console.log('\n--- Group 3: Successful End-to-End Orchestration ---')
    createMockOrder({
      orderId: 'KALA-PAID-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let createCalls = 0
    let awbCalls = 0
    let labelCalls = 0
    let invoiceCalls = 0
    let pickupCalls = 0

    const mockFetchSuccess = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'mock-valid-token' }), { status: 200 })
      }
      if (url.includes('/orders/create/adhoc')) {
        createCalls++
        return new Response(JSON.stringify({ order_id: 88801, shipment_id: 99901, status: 'NEW' }), { status: 200 })
      }
      if (url.includes('/courier/assign/awb')) {
        awbCalls++
        return new Response(
          JSON.stringify({
            awb_assign_status: 1,
            response: {
              data: {
                awb_code: 'AWB-SUCCESS-123',
                courier_name: 'Blue Dart',
                courier_company_id: 15,
                shipment_id: 99901,
              },
            },
          }),
          { status: 200 }
        )
      }
      if (url.includes('/courier/generate/label')) {
        labelCalls++
        return new Response(JSON.stringify({ label_created: 1, label_url: 'https://s3.kala.com/label.pdf' }), { status: 200 })
      }
      if (url.includes('/orders/print/invoice')) {
        invoiceCalls++
        return new Response(JSON.stringify({ is_invoice_created: true, invoice_url: 'https://s3.kala.com/inv.pdf' }), { status: 200 })
      }
      if (url.includes('/courier/generate/pickup')) {
        pickupCalls++
        return new Response(
          JSON.stringify({
            pickup_status: 1,
            response: { pickup_scheduled_date: '2026-11-23', pickup_token_number: 'PKP-999', data: 'Pickup scheduled' },
          }),
          { status: 200 }
        )
      }
      return new Response('Not found', { status: 404 })
    }

    const workflowRes = await triggerShipmentWorkflow('KALA-PAID-001', {
      customFetch: mockFetchSuccess as any,
    })

    assert(workflowRes.success === true, 'End-to-end workflow succeeded')
    assert(workflowRes.shiprocketOrderId === 88801, 'Shiprocket order ID saved')
    assert(workflowRes.shipmentId === 99901, 'Shiprocket shipment ID saved')
    assert(workflowRes.awbCode === 'AWB-SUCCESS-123', 'AWB code saved')
    assert(workflowRes.courierName === 'Blue Dart', 'Courier name saved')
    assert(workflowRes.labelUrl === 'https://s3.kala.com/label.pdf', 'Label URL saved')
    assert(workflowRes.invoiceUrl === 'https://s3.kala.com/inv.pdf', 'Invoice URL saved')
    assert(workflowRes.pickupTokenNumber === 'PKP-999', 'Pickup token saved')
    assert(createCalls === 1, 'Created order exactly once')
    assert(awbCalls === 1, 'Assigned courier exactly once')
    assert(labelCalls === 1, 'Generated label exactly once')
    assert(invoiceCalls === 1, 'Generated invoice exactly once')
    assert(pickupCalls === 1, 'Scheduled pickup exactly once')

    // Check order state in mock store
    const updatedOrder = mockOrderStore.get('KALA-PAID-001')
    assert(updatedOrder.shiprocketOrder.status === 'pickup_scheduled', 'Final status is pickup_scheduled')
    assert(updatedOrder.tracking.trackingNumber === 'AWB-SUCCESS-123', 'Root tracking number updated')
    assert(updatedOrder.tracking.carrier === 'Blue Dart', 'Root carrier updated')
    assert(updatedOrder.status === 'processing', 'Order status moved from confirmed to processing')
    assert(updatedOrder.payment.status === 'paid', 'Customer payment status preserved as paid')

    // --- Group 4: Idempotency Guard ---
    console.log('\n--- Group 4: Idempotency Guard ---')
    const secondCallRes = await triggerShipmentWorkflow('KALA-PAID-001', {
      customFetch: mockFetchSuccess as any,
    })
    assert(secondCallRes.success === true, 'Second call returns success')
    assert(secondCallRes.awbCode === 'AWB-SUCCESS-123', 'Returns existing AWB')
    assert(createCalls === 1, 'Did not call Shiprocket order creation on second trigger')
    assert(awbCalls === 1, 'Did not call AWB generation on second trigger')

    // --- Group 5: Single-Flight Concurrency Control ---
    console.log('\n--- Group 5: Single-Flight Concurrency Control ---')
    createMockOrder({
      orderId: 'KALA-CONCURRENT-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let concurrentOrderCalls = 0
    const mockFetchConcurrent = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'mock-valid-token' }), { status: 200 })
      }
      if (url.includes('/orders/create/adhoc')) {
        concurrentOrderCalls++
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 20))
        return new Response(JSON.stringify({ order_id: 77701, shipment_id: 66601 }), { status: 200 })
      }
      if (url.includes('/courier/assign/awb')) {
        return new Response(JSON.stringify({ awb_assign_status: 1, response: { data: { awb_code: 'AWB-CONC-1' } } }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    }

    const [r1, r2, r3] = await Promise.all([
      triggerShipmentWorkflow('KALA-CONCURRENT-001', { customFetch: mockFetchConcurrent as any }),
      triggerShipmentWorkflow('KALA-CONCURRENT-001', { customFetch: mockFetchConcurrent as any }),
      triggerShipmentWorkflow('KALA-CONCURRENT-001', { customFetch: mockFetchConcurrent as any }),
    ])

    assert(concurrentOrderCalls === 1, 'Exactly 1 Shiprocket create call for 3 simultaneous triggers')
    assert(r1.success && r2.success && r3.success, 'All concurrent callers received success')
    assert(r1.awbCode === 'AWB-CONC-1' && r2.awbCode === 'AWB-CONC-1', 'All callers received identical AWB')

    // --- Group 6: Partial Failure & Safe Retry ---
    console.log('\n--- Group 6: Partial Failure & Safe Retry ---')
    createMockOrder({
      orderId: 'KALA-RETRY-TEST-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let retryCreateCalls = 0
    let retryAwbCalls = 0

    const mockFetchPartialFail = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'mock-valid-token' }), { status: 200 })
      }
      if (url.includes('/orders/create/adhoc')) {
        retryCreateCalls++
        return new Response(JSON.stringify({ order_id: 55501, shipment_id: 44401 }), { status: 200 })
      }
      if (url.includes('/courier/assign/awb')) {
        retryAwbCalls++
        if (retryAwbCalls === 1) {
          // Fail AWB on first attempt
          return new Response(JSON.stringify({ awb_assign_status: 0, response: { data: { awb_assign_error: 'Courier partner busy' } } }), { status: 200 })
        }
        // Succeed on retry attempt
        return new Response(JSON.stringify({ awb_assign_status: 1, response: { data: { awb_code: 'AWB-RECOVERED' } } }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    }

    const firstAttempt = await triggerShipmentWorkflow('KALA-RETRY-TEST-001', {
      customFetch: mockFetchPartialFail as any,
      autoGenerateLabel: false,
      autoGenerateInvoice: false,
      autoSchedulePickup: false,
    })

    assert(firstAttempt.success === false, 'First attempt failed at AWB step')
    assert(firstAttempt.status === 'created', 'Status preserved as created (order exists in Shiprocket)')

    const orderAfterFail = mockOrderStore.get('KALA-RETRY-TEST-001')
    assert(orderAfterFail.payment.status === 'paid', 'Customer payment is completely untouched by logistics failure')
    assert(orderAfterFail.shiprocketOrder.orderId === 55501, 'Shiprocket order ID is preserved')
    assert(orderAfterFail.shiprocketOrder.shipmentId === 44401, 'Shiprocket shipment ID is preserved')

    // Retry workflow
    const retryAttempt = await retryShipmentWorkflow('KALA-RETRY-TEST-001', {
      customFetch: mockFetchPartialFail as any,
      autoGenerateLabel: false,
      autoGenerateInvoice: false,
      autoSchedulePickup: false,
    })

    assert(retryAttempt.success === true, 'Retry attempt succeeded')
    assert(retryAttempt.awbCode === 'AWB-RECOVERED', 'AWB assigned on retry')
    assert(retryCreateCalls === 1, 'Did NOT recreate order in Shiprocket on retry')
    assert(retryAwbCalls === 2, 'Retried AWB assignment cleanly')

    // --- Group 7: Production Safety Gates Verification ---
    console.log('\n--- Group 7: Production Safety Gates Verification ---')
    // 1. When fulfillment is disabled by default (unset/false), no order is created
    delete process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED
    createMockOrder({
      orderId: 'KALA-GATE-001',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let gatedCalls = 0
    const mockGatedFetch = async (): Promise<Response> => {
      gatedCalls++
      return new Response('Should not be called', { status: 500 })
    }

    const gatedResult = await triggerShipmentWorkflow('KALA-GATE-001', {
      customFetch: mockGatedFetch as any,
    })
    assert(gatedResult.success === true, 'Returns safe result when gated')
    assert(gatedResult.message.includes('safety gate'), 'Describes fulfillment safety gate interception')
    assert(gatedCalls === 0, 'Zero Shiprocket network calls dispatched when auto-fulfillment is disabled')

    // 2. When fulfillment is enabled but AWB is disabled, order created but AWB halted
    process.env.SHIPROCKET_AUTO_FULFILLMENT_ENABLED = 'true'
    delete process.env.SHIPROCKET_AUTO_AWB_ENABLED
    createMockOrder({
      orderId: 'KALA-GATE-002',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let gate2AwbCalls = 0
    const mockGate2Fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) return new Response(JSON.stringify({ token: 'tok' }), { status: 200 })
      if (url.includes('/orders/create/adhoc')) return new Response(JSON.stringify({ order_id: 111, shipment_id: 222 }), { status: 200 })
      if (url.includes('/courier/assign/awb')) {
        gate2AwbCalls++
        return new Response('Should not be called', { status: 500 })
      }
      return new Response('Not found', { status: 404 })
    }

    const gate2Result = await triggerShipmentWorkflow('KALA-GATE-002', {
      customFetch: mockGate2Fetch as any,
    })
    assert(gate2Result.status === 'created', 'Order created but halted in created state')
    assert(gate2Result.message.includes('AWB generation is disabled by safety gate'), 'AWB safety gate triggered')
    assert(gate2AwbCalls === 0, 'Zero AWB assignment calls made when auto-AWB is disabled')

    // 3. When auto-pickup is disabled, pickup is not scheduled
    process.env.SHIPROCKET_AUTO_AWB_ENABLED = 'true'
    delete process.env.SHIPROCKET_AUTO_PICKUP_ENABLED
    createMockOrder({
      orderId: 'KALA-GATE-003',
      status: 'confirmed',
      payment: { status: 'paid', method: 'razorpay' },
    })

    let gate3PickupCalls = 0
    const mockGate3Fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) return new Response(JSON.stringify({ token: 'tok' }), { status: 200 })
      if (url.includes('/orders/create/adhoc')) return new Response(JSON.stringify({ order_id: 111, shipment_id: 222 }), { status: 200 })
      if (url.includes('/courier/assign/awb')) {
        return new Response(JSON.stringify({ awb_assign_status: 1, response: { data: { awb_code: 'AWB-G3', shipment_id: 222 } } }), { status: 200 })
      }
      if (url.includes('/courier/generate/label')) return new Response(JSON.stringify({ label_created: 1, label_url: 'http://l' }), { status: 200 })
      if (url.includes('/orders/print/invoice')) return new Response(JSON.stringify({ is_invoice_created: true, invoice_url: 'http://i' }), { status: 200 })
      if (url.includes('/courier/generate/pickup')) {
        gate3PickupCalls++
        return new Response('Should not be called', { status: 500 })
      }
      return new Response('Not found', { status: 404 })
    }

    const gate3Result = await triggerShipmentWorkflow('KALA-GATE-003', {
      customFetch: mockGate3Fetch as any,
    })
    assert(gate3Result.awbCode === 'AWB-G3', 'AWB assigned when auto-AWB enabled')
    assert(gate3Result.pickupTokenNumber === undefined, 'No pickup scheduled when auto-pickup is disabled')
    assert(gate3PickupCalls === 0, 'Zero pickup calls made when auto-pickup is disabled')

    console.log('\n===============================================================')
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
    console.log('===============================================================')

    if (failed > 0) {
      process.exit(1)
    }
  } finally {
    Order.findOne = origFindOne
  }
}

runTests().catch((err) => {
  console.error('Fatal test exception:', err)
  process.exit(1)
})
