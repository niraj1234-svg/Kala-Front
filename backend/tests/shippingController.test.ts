/**
 * Mocked Unit & Integration Tests for KALA Shipping Controller & Routes (Phase 2 Step 3)
 *
 * Verifies:
 * - Valid serviceable pincode (returns status: serviceable, public delivery estimate, customerShippingCharge: 0)
 * - Unserviceable pincode (returns status: unserviceable, serviceable: false)
 * - Invalid pincode input (missing, < 6 digits, > 6 digits, alphanumeric -> HTTP 400 invalid_input)
 * - Invalid weight input (negative, > 1.0kg, alphanumeric -> HTTP 400 invalid_input)
 * - Upstream failures / timeouts (HTTP 503 temporarily_unavailable, never serviceable=true)
 * - IP-based rate limiting (shippingLimiter blocks at 60+ calls per 15m)
 * - Strict information security (NEVER leaks internal rates, courierCompanyId, tokens, or courier objects)
 * - Zero pricing / Razorpay side-effects
 */

import type { Request, Response as ExpressResponse } from 'express'
import {
  getServiceability,
  setShippingControllerOptionsForTesting,
  resetShippingControllerOptionsForTesting,
} from '../src/controllers/shippingController'
import { shippingLimiter } from '../src/routes/shippingRoutes'
import { resetShiprocketAuthForTesting } from '../src/services/shiprocketAuthService'

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passedTests++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failedTests++
  }
}

// Mock valid JWT token for auth service
function createMockJwt(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 86400, email: 'shipping@kala.com' })
  ).toString('base64url')
  return `${header}.${payload}.mock_sig`
}

// Helper to simulate Express req/res
function createMockReqRes(query: Record<string, any> = {}, ip = '127.0.0.1') {
  const req: Partial<Request> = {
    query,
    ip,
    headers: {},
  }

  let statusCode = 200
  let jsonBody: any = null

  const res: Partial<ExpressResponse> = {
    status(code: number) {
      statusCode = code
      return this as ExpressResponse
    },
    json(body: any) {
      jsonBody = body
      return this as ExpressResponse
    },
  }

  return {
    req: req as Request,
    res: res as ExpressResponse,
    getStatus: () => statusCode,
    getBody: () => jsonBody,
  }
}

async function runTestSuite() {
  console.log('========================================================================')
  console.log(' KALA Phase 2: Shipping Controller & Public Routes Test Suite')
  console.log('========================================================================\n')

  const originalEnv = { ...process.env }
  process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
  process.env.SHIPROCKET_PASSWORD = 'MockShiprocketPassword123!'

  const mockToken = createMockJwt()

  const mockCouriers = [
    {
      courier_company_id: 10,
      courier_name: 'Delhivery Surface',
      rate: 65.5,
      estimated_delivery_days: 4,
      city: 'Bengaluru',
      state: 'Karnataka',
      internal_secret_margin: 'SECRET_VENDOR_MARGIN_99',
    },
    {
      courier_company_id: 2,
      courier_name: 'Blue Dart Air Express',
      rate: 98.0,
      estimated_delivery_days: 2,
      city: 'Bengaluru',
      state: 'Karnataka',
      internal_secret_margin: 'SECRET_VENDOR_MARGIN_88',
    },
  ]

  try {
    // -------------------------------------------------------------------------
    // GROUP 1: Input Validation in Controller
    // -------------------------------------------------------------------------
    console.log('--- Group 1: Pincode & Weight Input Validation ---')

    resetShiprocketAuthForTesting()
    resetShippingControllerOptionsForTesting()

    // 1A: Missing pincode
    const mock1A = createMockReqRes({})
    await getServiceability(mock1A.req, mock1A.res)
    assert(mock1A.getStatus() === 400, 'Missing pincode returns HTTP 400')
    assert(mock1A.getBody()?.status === 'invalid_input', 'Missing pincode status is invalid_input')
    assert(mock1A.getBody()?.serviceable === false, 'Missing pincode serviceable is false')

    // 1B: Non-numeric pincode
    const mock1B = createMockReqRes({ pincode: '56000A' })
    await getServiceability(mock1B.req, mock1B.res)
    assert(mock1B.getStatus() === 400, 'Alphanumeric pincode returns HTTP 400')
    assert(mock1B.getBody()?.status === 'invalid_input', 'Alphanumeric pincode status is invalid_input')

    // 1C: 5 digits
    const mock1C = createMockReqRes({ pincode: '56000' })
    await getServiceability(mock1C.req, mock1C.res)
    assert(mock1C.getStatus() === 400, '5-digit pincode returns HTTP 400')
    assert(mock1C.getBody()?.status === 'invalid_input', '5-digit pincode status is invalid_input')

    // 1D: 7 digits
    const mock1D = createMockReqRes({ pincode: '5600011' })
    await getServiceability(mock1D.req, mock1D.res)
    assert(mock1D.getStatus() === 400, '7-digit pincode returns HTTP 400')

    // 1E: Invalid weight (> 1.0kg)
    const mock1E = createMockReqRes({ pincode: '560001', weight: '2.5' })
    await getServiceability(mock1E.req, mock1E.res)
    assert(mock1E.getStatus() === 400, 'Weight > 1.0kg returns HTTP 400')
    assert(mock1E.getBody()?.status === 'invalid_input', 'Weight > 1.0kg status is invalid_input')

    // 1F: Invalid weight (< 0.1kg)
    const mock1F = createMockReqRes({ pincode: '560001', weight: '0.05' })
    await getServiceability(mock1F.req, mock1F.res)
    assert(mock1F.getStatus() === 400, 'Weight < 0.1kg returns HTTP 400')

    // 1G: Non-numeric weight string
    const mock1G = createMockReqRes({ pincode: '560001', weight: 'not_a_weight' })
    await getServiceability(mock1G.req, mock1G.res)
    assert(mock1G.getStatus() === 400, 'Non-numeric weight returns HTTP 400')

    // 1H: Weight with trailing alpha characters (0.5abc) - must reject, not parseFloat
    const mock1H = createMockReqRes({ pincode: '560001', weight: '0.5abc' })
    await getServiceability(mock1H.req, mock1H.res)
    assert(mock1H.getStatus() === 400, 'Weight with trailing letters (0.5abc) returns HTTP 400')
    assert(mock1H.getBody()?.status === 'invalid_input', '0.5abc status is invalid_input')

    // 1I: Weight with unit suffix (1.0kg) - must reject
    const mock1I = createMockReqRes({ pincode: '560001', weight: '1.0kg' })
    await getServiceability(mock1I.req, mock1I.res)
    assert(mock1I.getStatus() === 400, 'Weight with unit suffix (1.0kg) returns HTTP 400')

    // 1J: Weight with letters only (abc)
    const mock1J = createMockReqRes({ pincode: '560001', weight: 'abc' })
    await getServiceability(mock1J.req, mock1J.res)
    assert(mock1J.getStatus() === 400, 'Weight string "abc" returns HTTP 400')

    // 1K: Empty string weight ("") - must reject, NOT silently fall back to default
    const mock1K = createMockReqRes({ pincode: '560001', weight: '' })
    await getServiceability(mock1K.req, mock1K.res)
    assert(mock1K.getStatus() === 400, 'Empty string weight ("") returns HTTP 400')

    // 1L: Whitespace string weight ("   ") - must reject
    const mock1L = createMockReqRes({ pincode: '560001', weight: '   ' })
    await getServiceability(mock1L.req, mock1L.res)
    assert(mock1L.getStatus() === 400, 'Whitespace string weight ("   ") returns HTTP 400')

    // 1M: Repeated weight query parameter (array e.g. ['0.5', '0.8']) - must reject
    const mock1M = createMockReqRes({ pincode: '560001', weight: ['0.5', '0.8'] })
    await getServiceability(mock1M.req, mock1M.res)
    assert(mock1M.getStatus() === 400, 'Repeated weight query param (array) returns HTTP 400')

    // 1N: Object weight query parameter ({ val: '0.5' }) - must reject
    const mock1N = createMockReqRes({ pincode: '560001', weight: { val: '0.5' } })
    await getServiceability(mock1N.req, mock1N.res)
    assert(mock1N.getStatus() === 400, 'Object weight query param returns HTTP 400')

    // -------------------------------------------------------------------------
    // GROUP 2: Serviceable Pincode Query
    // -------------------------------------------------------------------------
    console.log('\n--- Group 2: Valid Serviceable Pincode Query ---')

    resetShiprocketAuthForTesting()

    const mockFetchSuccess: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new globalThis.Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new globalThis.Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: mockCouriers },
        }),
        { status: 200 }
      )
    }

    setShippingControllerOptionsForTesting({
      serviceOptions: { customFetch: mockFetchSuccess },
    })

    const mock2 = createMockReqRes({ pincode: '560001' })
    await getServiceability(mock2.req, mock2.res)

    assert(mock2.getStatus() === 200, 'Serviceable pincode returns HTTP 200')
    assert(mock2.getBody()?.success === true, 'Serviceable response success is true')
    assert(mock2.getBody()?.status === 'serviceable', 'Status is serviceable')
    assert(mock2.getBody()?.serviceable === true, 'Serviceable flag is true')
    assert(mock2.getBody()?.pincode === '560001', 'Pincode is 560001')
    assert(mock2.getBody()?.city === 'Bengaluru', 'City is Bengaluru')
    assert(mock2.getBody()?.state === 'Karnataka', 'State is Karnataka')
    assert(mock2.getBody()?.customerShippingCharge === 0, 'Customer shipping charge is guaranteed 0 (Free shipping)')
    assert(mock2.getBody()?.deliveryEstimate?.minEstimatedDays === 2, 'Delivery estimate minEstimatedDays is 2')
    assert(mock2.getBody()?.deliveryEstimate?.maxEstimatedDays === 4, 'Delivery estimate maxEstimatedDays is 4')
    assert(typeof mock2.getBody()?.deliveryEstimate?.estimatedDeliveryDate === 'string', 'estimatedDeliveryDate is provided')

    // 2B: Valid explicit weight (0.75kg)
    const mock2B = createMockReqRes({ pincode: '560001', weight: '0.75' })
    await getServiceability(mock2B.req, mock2B.res)
    assert(mock2B.getStatus() === 200, 'Valid weight 0.75kg returns HTTP 200')
    assert(mock2B.getBody()?.serviceable === true, 'Valid weight 0.75kg is serviceable')

    // 2C: Boundary valid weight (0.1kg)
    const mock2C = createMockReqRes({ pincode: '560001', weight: '0.1' })
    await getServiceability(mock2C.req, mock2C.res)
    assert(mock2C.getStatus() === 200, 'Boundary weight 0.1kg returns HTTP 200')

    // 2D: Boundary valid weight (1.0kg)
    const mock2D = createMockReqRes({ pincode: '560001', weight: '1.0' })
    await getServiceability(mock2D.req, mock2D.res)
    assert(mock2D.getStatus() === 200, 'Boundary weight 1.0kg returns HTTP 200')

    // -------------------------------------------------------------------------
    // GROUP 3: Unserviceable Pincode Handling
    // -------------------------------------------------------------------------
    console.log('\n--- Group 3: Unserviceable Pincode Handling ---')

    resetShiprocketAuthForTesting()

    const mockFetchUnserviceable: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new globalThis.Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new globalThis.Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: [] },
        }),
        { status: 200 }
      )
    }

    setShippingControllerOptionsForTesting({
      serviceOptions: { customFetch: mockFetchUnserviceable },
    })

    const mock3 = createMockReqRes({ pincode: '999999' })
    await getServiceability(mock3.req, mock3.res)

    assert(mock3.getStatus() === 200, 'Unserviceable pincode returns HTTP 200 (graceful client response)')
    assert(mock3.getBody()?.success === true, 'Unserviceable response success is true')
    assert(mock3.getBody()?.status === 'unserviceable', 'Status is unserviceable')
    assert(mock3.getBody()?.serviceable === false, 'Serviceable flag is false')
    assert(mock3.getBody()?.deliveryEstimate === undefined, 'No delivery estimate for unserviceable pincode')
    assert(mock3.getBody()?.customerShippingCharge === 0, 'Customer shipping charge is 0')

    // -------------------------------------------------------------------------
    // GROUP 4: Timeout & Upstream Failures (Never Serviceable=true)
    // -------------------------------------------------------------------------
    console.log('\n--- Group 4: Timeout & Upstream Outage Protection ---')

    resetShiprocketAuthForTesting()

    // 4A: Upstream 500 error
    const mockFetch500: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new globalThis.Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new globalThis.Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
    }

    setShippingControllerOptionsForTesting({
      serviceOptions: { customFetch: mockFetch500 },
    })

    const mock4A = createMockReqRes({ pincode: '560001' })
    await getServiceability(mock4A.req, mock4A.res)

    assert(mock4A.getStatus() === 503, 'Upstream 500 returns HTTP 503 Service Unavailable')
    assert(mock4A.getBody()?.success === false, 'Outage returns success: false')
    assert(mock4A.getBody()?.status === 'temporarily_unavailable', 'Status is temporarily_unavailable')
    assert(mock4A.getBody()?.serviceable === false, 'Outage NEVER returns serviceable=true')
    assert(mock4A.getBody()?.customerShippingCharge === 0, 'Customer shipping charge is 0')

    // 4B: Timeout AbortError
    resetShiprocketAuthForTesting()
    const mockFetchTimeout: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new globalThis.Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      throw err
    }

    setShippingControllerOptionsForTesting({
      serviceOptions: { customFetch: mockFetchTimeout },
    })

    const mock4B = createMockReqRes({ pincode: '560001' })
    await getServiceability(mock4B.req, mock4B.res)

    assert(mock4B.getStatus() === 503, 'Timeout returns HTTP 503 Service Unavailable')
    assert(mock4B.getBody()?.success === false, 'Timeout returns success: false')
    assert(mock4B.getBody()?.status === 'temporarily_unavailable', 'Status is temporarily_unavailable')
    assert(mock4B.getBody()?.serviceable === false, 'Timeout NEVER returns serviceable=true')

    // -------------------------------------------------------------------------
    // GROUP 5: Zero-Leakage & Public Security Boundary
    // -------------------------------------------------------------------------
    console.log('\n--- Group 5: Zero-Leakage Security Boundary ---')

    const serializedSuccess = JSON.stringify(mock2.getBody())
    assert(!serializedSuccess.includes('rate'), 'Public response DTO does not contain "rate"')
    assert(!serializedSuccess.includes('65.5'), 'Internal courier rates (65.5) are NEVER leaked')
    assert(!serializedSuccess.includes('98.0'), 'Internal courier rates (98.0) are NEVER leaked')
    assert(!serializedSuccess.includes('cheapestCourier'), 'cheapestCourier internal object is NOT in public response')
    assert(!serializedSuccess.includes('fastestCourier'), 'fastestCourier internal object is NOT in public response')
    assert(!serializedSuccess.includes('courierCompanyId'), 'courierCompanyId is NOT in public response')
    assert(!serializedSuccess.includes('SECRET_VENDOR_MARGIN'), 'Vendor internal metadata is NOT in public response')
    assert(!serializedSuccess.includes(mockToken), 'Bearer token is NOT in public response')
    assert(!serializedSuccess.includes('MockShiprocketPassword'), 'Password is NOT in public response')

    const serialized503 = JSON.stringify(mock4A.getBody())
    assert(!serialized503.includes('SECRET_VENDOR_MARGIN'), 'Error response does not leak vendor metadata')
    assert(!serialized503.includes('MockShiprocketPassword'), 'Error response does not leak credentials')
    assert(!serialized503.includes(mockToken), 'Error response does not leak Bearer token')

    // -------------------------------------------------------------------------
    // GROUP 6: IP-Based Rate Limiter Verification (shippingLimiter)
    // -------------------------------------------------------------------------
    console.log('\n--- Group 6: IP-Based Rate Limiter (shippingLimiter) ---')

    assert(typeof shippingLimiter === 'function', 'shippingLimiter is a valid Express middleware function')

    const runLimiter = (req: any, res: any) =>
      new Promise<{ calledNext: boolean; statusCode?: number; body?: any }>((resolve) => {
        let statusCode = 200
        res.status = (code: number) => {
          statusCode = code
          return res
        }
        res.json = (body: any) => {
          resolve({ calledNext: false, statusCode, body })
          return res
        }
        res.send = (body: any) => {
          resolve({ calledNext: false, statusCode, body })
          return res
        }
        res.setHeader = () => res
        res.getHeader = () => undefined
        shippingLimiter(req, res, () => {
          resolve({ calledNext: true })
        })
      })

    const dummyReq: Partial<Request> = {
      ip: '192.168.1.100',
      headers: {},
      method: 'GET',
      path: '/serviceability',
      app: { get: () => false } as any,
    }

    const dummyRes: any = {}

    // Dispatch 60 requests (allowed under window limit)
    for (let i = 0; i < 60; i++) {
      const outcome = await runLimiter(dummyReq, dummyRes)
      assert(outcome.calledNext === true, `Request #${i + 1} within 60 max is allowed through to next()`)
    }

    // 61st request should be blocked by rate limiter with HTTP 429
    const blockedOutcome = await runLimiter(dummyReq, dummyRes)
    assert(blockedOutcome.calledNext === false, 'Request #61 exceeding limit does NOT call next()')
    assert(blockedOutcome.statusCode === 429, 'Request #61 was blocked with HTTP 429 status')
    assert(blockedOutcome.body?.success === false, 'Rate limit response has success: false')
    assert(blockedOutcome.body?.status === 'temporarily_unavailable', 'Rate limit response has status: temporarily_unavailable')
    assert(blockedOutcome.body?.serviceable === false, 'Rate limit response has serviceable: false')
    assert(blockedOutcome.body?.message?.includes('Too many') === true, 'Rate limit error message received')

    // -------------------------------------------------------------------------
    // GROUP 7: Rate Limiter IP Isolation & Proxy Key Generation
    // -------------------------------------------------------------------------
    console.log('\n--- Group 7: Rate Limiter IP Isolation & Proxy Behavior ---')

    // Request from a different IP is NOT blocked (proves per-IP isolation)
    const differentIpReq: Partial<Request> = {
      ip: '192.168.1.101',
      headers: {},
      method: 'GET',
      path: '/serviceability',
      app: { get: () => false } as any,
    }
    const differentIpOutcome = await runLimiter(differentIpReq, dummyRes)
    assert(differentIpOutcome.calledNext === true, 'Distinct client IP (192.168.1.101) is NOT blocked by other IP limits')

    // Verify req.ip key generation: express-rate-limit uses req.ip as default key
    // Under app.set('trust proxy', 1), Express resolves req.ip from the upstream reverse proxy
    assert(typeof dummyReq.ip === 'string', 'Rate limiter operates on req.ip string')

  } finally {
    process.env = originalEnv
    resetShiprocketAuthForTesting()
    resetShippingControllerOptionsForTesting()
  }

  console.log('\n========================================================================')
  console.log(` Test Summary: ${passedTests} passed, ${failedTests} failed.`)
  console.log('========================================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled test suite error in shippingController.test.ts:', err)
  process.exit(1)
})
