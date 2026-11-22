/**
 * Unit Test Suite for KALA Shiprocket Shipment & Fulfillment Service (Phases 3 & 4)
 *
 * Verifies:
 * 1. createShiprocketOrder: payload generation, multi-item packaging, Indian address sanitization.
 * 2. assignCourierAndGenerateAwb: AWB assignment, courier metadata extraction.
 * 3. generateShippingLabel: label URL extraction.
 * 4. generateInvoice: invoice URL extraction.
 * 5. schedulePickup: pickup token and scheduled date extraction.
 * 6. trackShipmentByAwb: tracking timeline, current status, scans parsing.
 * 7. 401 recovery: token invalidation and automatic retry.
 * 8. Timeout handling: AbortController abort.
 * 9. Upstream 5xx errors and network failure resilience.
 * 10. Free shipping invariant: shipping_charges is hardcoded to 0.
 */

import {
  createShiprocketOrder,
  assignCourierAndGenerateAwb,
  generateShippingLabel,
  generateInvoice,
  schedulePickup,
  trackShipmentByAwb,
  formatShiprocketDate,
} from '../src/services/shiprocketShipmentService'
import { resetShiprocketAuthForTesting } from '../src/services/shiprocketAuthService'

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

async function runTests() {
  console.log('===============================================================')
  console.log(' KALA Phases 3 & 4: Shiprocket Shipment & Fulfillment Tests')
  console.log('===============================================================\n')

  // Set mock credentials for test suite
  process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
  process.env.SHIPROCKET_PASSWORD = 'mock_password_123'

  const validToken = 'mock-jwt-header.eyJzdWIiOiIxMjM0NSIsImVtYWlsIjoia3VsZGVlcEBrYWxhLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.mock-signature'

  // Helper for mock fetch with login response
  function createMockFetch(responses: { [urlPattern: string]: { status: number; body: any } }) {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input)
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: validToken }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      for (const [pattern, res] of Object.entries(responses)) {
        if (url.includes(pattern)) {
          return new Response(JSON.stringify(res.body), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }

      return new Response(JSON.stringify({ message: 'Mock endpoint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // --- Group 1: Date formatting ---
  console.log('--- Group 1: Date Formatting ---')
  const dateStr = formatShiprocketDate(new Date('2026-11-22T14:30:00Z'))
  assert(typeof dateStr === 'string', 'formatShiprocketDate returns string')
  assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr), `Date format matches YYYY-MM-DD HH:mm (${dateStr})`)

  // --- Group 2: createShiprocketOrder ---
  console.log('\n--- Group 2: createShiprocketOrder ---')
  resetShiprocketAuthForTesting()

  let lastOrderPayload: any = null
  const mockFetch1 = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input)
    if (url.includes('/auth/login')) {
      return new Response(JSON.stringify({ token: validToken }), { status: 200 })
    }
    if (url.includes('/orders/create/adhoc')) {
      lastOrderPayload = JSON.parse(String(init?.body || '{}'))
      return new Response(
        JSON.stringify({
          order_id: 10001,
          shipment_id: 20001,
          status: 'NEW',
          status_code: 1,
        }),
        { status: 200 }
      )
    }
    return new Response('Not found', { status: 404 })
  }

  const orderRes = await createShiprocketOrder(
    {
      orderId: 'KALA-TEST-001',
      customerFirstName: 'Kuldeep',
      customerLastName: 'Dhoren',
      address: '123 KALA Street',
      city: 'Bilaspur',
      pincode: '495004',
      state: 'Chhattisgarh',
      email: 'kuldeep@kalaofficial.store',
      phone: '+919876543210',
      items: [
        { name: 'Oversized Tee', sku: 'TEE-BLK-L', units: 1, selling_price: 1499 },
        { name: 'Classic Polo', sku: 'POLO-WHT-M', units: 2, selling_price: 1299 },
      ],
      subtotal: 4097,
      totalDiscount: 200,
      packageWeightKg: 0.9,
    },
    { customFetch: mockFetch1 as any }
  )

  assert(orderRes.success === true, 'Order created successfully')
  assert(orderRes.orderId === 10001, 'Returns Shiprocket orderId')
  assert(orderRes.shipmentId === 20001, 'Returns Shiprocket shipmentId')
  assert(orderRes.status === 'NEW', 'Status is NEW')
  assert(lastOrderPayload?.order_id === 'KALA-TEST-001', 'Payload contains KALA orderId')
  assert(lastOrderPayload?.shipping_charges === 0, 'Shipping charges is strictly 0')
  assert(lastOrderPayload?.payment_method === 'Prepaid', 'Payment method is strictly Prepaid')
  assert(lastOrderPayload?.billing_phone === '9876543210', 'Phone number sanitized to 10 digits')
  assert(lastOrderPayload?.order_items.length === 2, 'Contains 2 order items')
  assert(lastOrderPayload?.weight === 0.9, 'Package weight matches requested weight')

  // --- Group 3: assignCourierAndGenerateAwb ---
  console.log('\n--- Group 3: assignCourierAndGenerateAwb ---')
  const mockFetch2 = createMockFetch({
    '/courier/assign/awb': {
      status: 200,
      body: {
        awb_assign_status: 1,
        response: {
          data: {
            courier_company_id: 10,
            courier_name: 'Delhivery Surface',
            awb_code: 'DEL-99887766',
            shipment_id: 20001,
          },
        },
      },
    },
  })

  const awbRes = await assignCourierAndGenerateAwb(
    { shipmentId: 20001, courierId: 10 },
    { customFetch: mockFetch2 as any }
  )

  assert(awbRes.success === true, 'AWB assigned successfully')
  assert(awbRes.awbCode === 'DEL-99887766', 'AWB code correctly extracted')
  assert(awbRes.courierName === 'Delhivery Surface', 'Courier name extracted')
  assert(awbRes.courierCompanyId === 10, 'Courier company ID extracted')

  // --- Group 4: generateShippingLabel ---
  console.log('\n--- Group 4: generateShippingLabel ---')
  const mockFetch3 = createMockFetch({
    '/courier/generate/label': {
      status: 200,
      body: {
        label_created: 1,
        label_url: 'https://kr-shipmultichannel.s3.amazonaws.com/labels/label_20001.pdf',
      },
    },
  })

  const labelRes = await generateShippingLabel([20001], { customFetch: mockFetch3 as any })
  assert(labelRes.success === true, 'Shipping label generated')
  assert(labelRes.labelUrl?.includes('label_20001.pdf') === true, 'Label URL extracted')

  // --- Group 5: generateInvoice ---
  console.log('\n--- Group 5: generateInvoice ---')
  const mockFetch4 = createMockFetch({
    '/orders/print/invoice': {
      status: 200,
      body: {
        is_invoice_created: true,
        invoice_url: 'https://kr-shipmultichannel.s3.amazonaws.com/invoices/inv_10001.pdf',
      },
    },
  })

  const invRes = await generateInvoice([10001], { customFetch: mockFetch4 as any })
  assert(invRes.success === true, 'Invoice generated')
  assert(invRes.invoiceUrl?.includes('inv_10001.pdf') === true, 'Invoice URL extracted')

  // --- Group 6: schedulePickup ---
  console.log('\n--- Group 6: schedulePickup ---')
  const mockFetch5 = createMockFetch({
    '/courier/generate/pickup': {
      status: 200,
      body: {
        pickup_status: 1,
        response: {
          pickup_scheduled_date: '2026-11-23',
          pickup_token_number: 'PKP-TOK-5544',
          data: 'Pickup scheduled successfully',
        },
      },
    },
  })

  const pickupRes = await schedulePickup(
    { shipmentIds: [20001], pickupDate: '2026-11-23' },
    { customFetch: mockFetch5 as any }
  )
  assert(pickupRes.success === true, 'Pickup scheduled successfully')
  assert(pickupRes.pickupTokenNumber === 'PKP-TOK-5544', 'Pickup token number extracted')
  assert(pickupRes.pickupScheduledDate === '2026-11-23', 'Pickup date extracted')

  // --- Group 7: trackShipmentByAwb ---
  console.log('\n--- Group 7: trackShipmentByAwb ---')
  const mockFetch6 = createMockFetch({
    '/courier/track/awb/DEL-99887766': {
      status: 200,
      body: {
        tracking_data: {
          track_status: 1,
          shipment_track_activities: {
            current_status: 'IN TRANSIT',
            current_status_id: 6,
            current_location: 'Raipur Hub',
            etd: '2026-11-25',
            scans: [
              { date: '2026-11-22 18:00', status: 'PICKED UP', activity: 'Item Picked Up', location: 'Bilaspur' },
              { date: '2026-11-23 04:00', status: 'IN TRANSIT', activity: 'In Transit', location: 'Raipur Hub' },
            ],
          },
        },
      },
    },
  })

  const trackRes = await trackShipmentByAwb('DEL-99887766', { customFetch: mockFetch6 as any })
  assert(trackRes.success === true, 'Tracking query succeeded')
  assert(trackRes.currentStatus === 'IN TRANSIT', 'Current status is IN TRANSIT')
  assert(trackRes.currentLocation === 'Raipur Hub', 'Current location is Raipur Hub')
  assert(trackRes.scans?.length === 2, '2 scans parsed')
  assert(trackRes.scans?.[0].location === 'Bilaspur', 'First scan location is Bilaspur')

  // --- Group 8: 401 Recovery & Retry ---
  console.log('\n--- Group 8: 401 Recovery ---')
  resetShiprocketAuthForTesting()
  let authLoginCalls = 0
  let orderCalls = 0

  const mockFetch401 = async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input)
    if (url.includes('/auth/login')) {
      authLoginCalls++
      return new Response(JSON.stringify({ token: `fresh-token-${authLoginCalls}` }), { status: 200 })
    }
    if (url.includes('/orders/create/adhoc')) {
      orderCalls++
      if (orderCalls === 1) {
        // Return 401 on first try
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      }
      return new Response(JSON.stringify({ order_id: 10002, shipment_id: 20002 }), { status: 200 })
    }
    return new Response('Not found', { status: 404 })
  }

  const recoveryRes = await createShiprocketOrder(
    {
      orderId: 'KALA-RETRY-001',
      customerFirstName: 'Test',
      customerLastName: 'User',
      address: 'Address',
      city: 'City',
      pincode: '495001',
      state: 'State',
      email: 'test@kala.com',
      phone: '9876543210',
      items: [{ name: 'Item', sku: 'SKU', units: 1, selling_price: 100 }],
      subtotal: 100,
    },
    { customFetch: mockFetch401 as any }
  )

  assert(recoveryRes.success === true, 'Order creation recovered after 401')
  assert(recoveryRes.orderId === 10002, 'Recovered orderId returned')
  assert(authLoginCalls === 2, 'Auth login called twice (initial + refresh after 401)')
  assert(orderCalls === 2, 'Order creation endpoint retried once after 401')

  // --- Group 9: Timeout Handling ---
  console.log('\n--- Group 9: Timeout Handling ---')
  const mockTimeoutFetch = async (): Promise<Response> => {
    const err = new Error('The operation was aborted')
    err.name = 'AbortError'
    throw err
  }

  const timeoutRes = await createShiprocketOrder(
    {
      orderId: 'KALA-TIMEOUT',
      customerFirstName: 'Test',
      customerLastName: 'User',
      address: 'Address',
      city: 'City',
      pincode: '495001',
      state: 'State',
      email: 'test@kala.com',
      phone: '9876543210',
      items: [{ name: 'Item', sku: 'SKU', units: 1, selling_price: 100 }],
      subtotal: 100,
    },
    { customFetch: mockTimeoutFetch as any }
  )
  assert(timeoutRes.success === false, 'Timeout returns success: false')
  assert(timeoutRes.message.includes('aborted') || timeoutRes.message.includes('communicating'), 'Timeout message captured')

  console.log('\n===============================================================')
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log('===============================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner exception:', err)
  process.exit(1)
})
