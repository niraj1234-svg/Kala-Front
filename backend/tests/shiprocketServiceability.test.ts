/**
 * Mocked Unit Test Suite for KALA Shiprocket Serviceability Service (Phase 2 Step 1 & 2)
 *
 * Verifies:
 * - Successful serviceability response (filtering, sorting fastest & cheapest)
 * - Free shipping invariant: customerShippingCharge is strictly 0
 * - Unserviceable destination pincode
 * - Empty courier list handling
 * - Pincode validation (/^\d{6}$/ Indian PIN code)
 * - Shipment weight bounds checking (0.1kg to 1.0kg)
 * - 401 Unauthorized handling: token invalidation and single retry
 * - 401 persistent failure: no infinite loop, returns temporarily_unavailable
 * - Request timeout (8-second AbortController abort)
 * - Upstream 5xx server errors
 * - Network fetch exceptions
 * - Outage guarantee: NEVER returns serviceable=true on failures or outages
 * - Zero leakage of credentials, tokens, or raw vendor payloads
 */

import {
  SHIPROCKET_PICKUP_POSTCODE,
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_SHIPMENT_WEIGHT_KG,
  MAX_SHIPMENT_WEIGHT_KG,
  DEFAULT_PACKAGE_DIMENSIONS,
} from '../src/config/shiprocketConfig'
import {
  checkCourierServiceability,
  isValidPincode,
  validateShipmentWeight,
  SERVICEABILITY_TIMEOUT_MS,
  CourierServiceabilityResult,
} from '../src/services/shiprocketServiceabilityService'
import {
  resetShiprocketAuthForTesting,
  invalidateToken,
} from '../src/services/shiprocketAuthService'

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

async function runTestSuite() {
  console.log('========================================================================')
  console.log(' KALA Phase 2: Shiprocket Courier Serviceability Test Suite')
  console.log('========================================================================\n')

  const originalEnv = { ...process.env }
  process.env.SHIPROCKET_EMAIL = 'shipping@kala.com'
  process.env.SHIPROCKET_PASSWORD = 'MockShiprocketPassword123!'

  const mockToken = createMockJwt()

  // Standard mock mock courier data for testing
  const mockCouriers = [
    {
      courier_company_id: 10,
      courier_name: 'Delhivery Surface',
      rate: 65.5,
      etd: '2026-11-26',
      estimated_delivery_days: '4',
      city: 'Bengaluru',
      state: 'Karnataka',
      is_surface: true,
      raw_internal_vendor_secret: 'SHOULD_NEVER_LEAK_1',
    },
    {
      courier_company_id: 2,
      courier_name: 'Blue Dart Air Express',
      rate: 98.0,
      etd: '2026-11-24',
      estimated_delivery_days: '2',
      city: 'Bengaluru',
      state: 'Karnataka',
      is_surface: false,
      raw_internal_vendor_secret: 'SHOULD_NEVER_LEAK_2',
    },
    {
      courier_company_id: 5,
      courier_name: 'DTDC Economy',
      rate: 55.0,
      etd: '2026-11-27',
      estimated_delivery_days: 5,
      city: 'Bengaluru',
      state: 'Karnataka',
      is_surface: true,
      raw_internal_vendor_secret: 'SHOULD_NEVER_LEAK_3',
    },
  ]

  try {
    // -------------------------------------------------------------------------
    // GROUP 1: Configuration Constants & Validation Helpers
    // -------------------------------------------------------------------------
    console.log('--- Group 1: Configuration Constants & Input Validation ---')

    assert(SHIPROCKET_PICKUP_POSTCODE === '495004', 'Pickup postcode is fixed at 495004 (Bilaspur)')
    assert(DEFAULT_SHIPMENT_WEIGHT_KG === 0.5, 'Default shipment weight is 0.5kg (500g)')
    assert(MIN_SHIPMENT_WEIGHT_KG === 0.1, 'Minimum shipment weight is 0.1kg')
    assert(MAX_SHIPMENT_WEIGHT_KG === 1.0, 'Maximum shipment weight is 1.0kg')
    assert(
      DEFAULT_PACKAGE_DIMENSIONS.length === 25 &&
        DEFAULT_PACKAGE_DIMENSIONS.breadth === 20 &&
        DEFAULT_PACKAGE_DIMENSIONS.height === 3,
      'Default package dimensions are 25x20x3 cm'
    )

    // Pincode validation tests
    assert(isValidPincode('560001') === true, 'isValidPincode accepts 560001')
    assert(isValidPincode('495004') === true, 'isValidPincode accepts 495004')
    assert(isValidPincode('110001') === true, 'isValidPincode accepts 110001')
    assert(isValidPincode(' 560001 ') === true, 'isValidPincode accepts 6 digits with surrounding whitespace')
    assert(isValidPincode('56000') === false, 'isValidPincode rejects 5 digits')
    assert(isValidPincode('5600011') === false, 'isValidPincode rejects 7 digits')
    assert(isValidPincode('56000a') === false, 'isValidPincode rejects alphanumeric')
    assert(isValidPincode('') === false, 'isValidPincode rejects empty string')
    assert(isValidPincode(null as any) === false, 'isValidPincode rejects null')
    assert(isValidPincode(undefined as any) === false, 'isValidPincode rejects undefined')

    // Weight validation tests
    assert(validateShipmentWeight(undefined).valid === true, 'validateShipmentWeight defaults undefined to valid')
    assert(validateShipmentWeight(undefined).weight === 0.5, 'validateShipmentWeight default weight is 0.5kg')
    assert(validateShipmentWeight(0.5).valid === true, 'validateShipmentWeight accepts 0.5kg')
    assert(validateShipmentWeight(0.1).valid === true, 'validateShipmentWeight accepts min 0.1kg')
    assert(validateShipmentWeight(1.0).valid === true, 'validateShipmentWeight accepts max 1.0kg')
    assert(validateShipmentWeight(0.75).valid === true, 'validateShipmentWeight accepts 0.75kg')
    assert(validateShipmentWeight(0.05).valid === false, 'validateShipmentWeight rejects < 0.1kg (0.05kg)')
    assert(validateShipmentWeight(1.05).valid === false, 'validateShipmentWeight rejects > 1.0kg (1.05kg)')
    assert(validateShipmentWeight(NaN).valid === false, 'validateShipmentWeight rejects NaN')
    assert(validateShipmentWeight('heavy' as any).valid === false, 'validateShipmentWeight rejects non-numeric string')

    // -------------------------------------------------------------------------
    // GROUP 2: Pincode and Weight Input Rejection
    // -------------------------------------------------------------------------
    console.log('\n--- Group 2: Pincode & Weight Input Rejection in Service ---')

    resetShiprocketAuthForTesting()

    const resInvalidPin = await checkCourierServiceability('12345')
    assert(resInvalidPin.success === false, 'Invalid pincode returns success: false')
    assert(resInvalidPin.status === 'invalid_input', 'Invalid pincode returns status: invalid_input')
    assert(resInvalidPin.serviceable === false, 'Invalid pincode returns serviceable: false')
    assert(resInvalidPin.customerShippingCharge === 0, 'Customer shipping charge remains 0')

    const resInvalidWeight = await checkCourierServiceability('560001', 2.5)
    assert(resInvalidWeight.success === false, 'Weight > 1.0kg returns success: false')
    assert(resInvalidWeight.status === 'invalid_input', 'Weight > 1.0kg returns status: invalid_input')
    assert(resInvalidWeight.serviceable === false, 'Weight > 1.0kg returns serviceable: false')

    const resUnderWeight = await checkCourierServiceability('560001', 0.05)
    assert(resUnderWeight.success === false, 'Weight < 0.1kg returns success: false')
    assert(resUnderWeight.status === 'invalid_input', 'Weight < 0.1kg returns status: invalid_input')

    // -------------------------------------------------------------------------
    // GROUP 3: Successful Courier Serviceability Query
    // -------------------------------------------------------------------------
    console.log('\n--- Group 3: Successful Courier Serviceability Query ---')

    resetShiprocketAuthForTesting()
    let capturedUrl: string = ''
    let capturedHeaders: any = null

    const mockFetchSuccess: typeof fetch = async (input, init) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken, expires_in: 86400 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      if (urlStr.includes('/courier/serviceability/')) {
        capturedUrl = urlStr
        capturedHeaders = init?.headers
        return new Response(
          JSON.stringify({
            status: 200,
            data: {
              shipping_company_id: 10,
              available_courier_companies: mockCouriers,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      return new Response('Not found', { status: 404 })
    }

    const successRes = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchSuccess,
    })

    assert(successRes.success === true, 'Successful check returns success: true')
    assert(successRes.status === 'serviceable', 'Successful check returns status: serviceable')
    assert(successRes.serviceable === true, 'Successful check returns serviceable: true')
    assert(successRes.pincode === '560001', 'Destination pincode matches 560001')
    assert(successRes.city === 'Bengaluru', 'Destination city parsed correctly')
    assert(successRes.state === 'Karnataka', 'Destination state parsed correctly')
    assert(successRes.customerShippingCharge === 0, 'Customer shipping charge is guaranteed 0')
    assert(successRes.availableCouriersCount === 3, 'Found 3 available couriers')

    // Courier selection: cheapest vs fastest
    assert(successRes.cheapestCourier?.courierName === 'DTDC Economy', 'Cheapest courier correctly identified (DTDC Economy @ ₹55)')
    assert(successRes.cheapestCourier?.rate === 55.0, 'Cheapest rate is 55.0')
    assert(successRes.fastestCourier?.courierName === 'Blue Dart Air Express', 'Fastest courier correctly identified (Blue Dart @ 2 days)')
    assert(successRes.fastestCourier?.estimatedDeliveryDays === 2, 'Fastest delivery days is 2')
    assert(successRes.fastestCourier?.isAir === true, 'Fastest air courier correctly flagged isAir: true')
    assert(successRes.minEstimatedDays === 2, 'minEstimatedDays is 2')
    assert(successRes.maxEstimatedDays === 5, 'maxEstimatedDays is 5')

    // Query parameters verification
    const parsedUrl = new URL(capturedUrl)
    assert(parsedUrl.searchParams.get('pickup_postcode') === '495004', 'Query param pickup_postcode is 495004')
    assert(parsedUrl.searchParams.get('delivery_postcode') === '560001', 'Query param delivery_postcode is 560001')
    assert(parsedUrl.searchParams.get('weight') === '0.5', 'Query param weight is 0.5')
    assert(parsedUrl.searchParams.get('cod') === '0', 'Query param cod is 0 (prepaid only)')
    assert(parsedUrl.searchParams.get('length') === '25', 'Query param length is 25')
    assert(parsedUrl.searchParams.get('breadth') === '20', 'Query param breadth is 20')
    assert(parsedUrl.searchParams.get('height') === '3', 'Query param height is 3')
    assert(capturedHeaders?.['Authorization'] === `Bearer ${mockToken}`, 'Authorization Bearer header is passed')

    // -------------------------------------------------------------------------
    // GROUP 4: Unserviceable Pincode & Empty Courier List
    // -------------------------------------------------------------------------
    console.log('\n--- Group 4: Unserviceable Pincode & Empty Courier List ---')

    resetShiprocketAuthForTesting()

    // 4A: Empty courier array (status 200 with available_courier_companies: [])
    const mockFetchEmptyCouriers: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: [] },
        }),
        { status: 200 }
      )
    }

    const resEmpty = await checkCourierServiceability('999999', 0.5, {
      customFetch: mockFetchEmptyCouriers,
    })
    assert(resEmpty.success === true, 'Empty courier list returns success: true')
    assert(resEmpty.status === 'unserviceable', 'Empty courier list returns status: unserviceable')
    assert(resEmpty.serviceable === false, 'Empty courier list returns serviceable: false')
    assert(resEmpty.availableCouriersCount === 0, 'availableCouriersCount is 0')
    assert(resEmpty.customerShippingCharge === 0, 'customerShippingCharge is 0')

    // 4B: HTTP 404 from Shiprocket (No courier available)
    const mockFetch404: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          status: 404,
          message: 'No courier service available for given pincodes.',
        }),
        { status: 404 }
      )
    }

    const res404 = await checkCourierServiceability('999998', 0.5, {
      customFetch: mockFetch404,
    })
    assert(res404.success === true, 'HTTP 404 returns success: true')
    assert(res404.status === 'unserviceable', 'HTTP 404 returns status: unserviceable')
    assert(res404.serviceable === false, 'HTTP 404 returns serviceable: false')

    // -------------------------------------------------------------------------
    // GROUP 5: 401 Unauthorized Recovery & Single Retry
    // -------------------------------------------------------------------------
    console.log('\n--- Group 5: 401 Unauthorized Recovery & Single Retry ---')

    resetShiprocketAuthForTesting()
    let serviceabilityAttempts = 0
    let authAttempts = 0

    const freshToken = createMockJwt()

    const mockFetch401Once: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        authAttempts++
        return new Response(JSON.stringify({ token: freshToken, expires_in: 86400 }), { status: 200 })
      }
      if (urlStr.includes('/courier/serviceability/')) {
        serviceabilityAttempts++
        if (serviceabilityAttempts === 1) {
          // First attempt fails with 401
          return new Response(JSON.stringify({ message: 'Token Expired' }), { status: 401 })
        }
        // Second attempt succeeds
        return new Response(
          JSON.stringify({
            status: 200,
            data: { available_courier_companies: mockCouriers },
          }),
          { status: 200 }
        )
      }
      return new Response('Not found', { status: 404 })
    }

    const res401Recovered = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetch401Once,
    })

    assert(serviceabilityAttempts === 2, 'Serviceability was called exactly twice (1 failure + 1 retry)')
    assert(authAttempts === 2, 'Auth was re-triggered to obtain fresh token')
    assert(res401Recovered.success === true, 'Recovered from 401 with success: true')
    assert(res401Recovered.serviceable === true, 'Recovered from 401 with serviceable: true')
    assert(res401Recovered.status === 'serviceable', 'Status is serviceable after successful retry')

    // -------------------------------------------------------------------------
    // GROUP 6: 401 Persistent Failure (Stops Retrying, No Infinite Loop)
    // -------------------------------------------------------------------------
    console.log('\n--- Group 6: 401 Persistent Failure (Stops Retrying) ---')

    resetShiprocketAuthForTesting()
    let persistent401Attempts = 0

    const mockFetchPersistent401: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      if (urlStr.includes('/courier/serviceability/')) {
        persistent401Attempts++
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      }
      return new Response('Not found', { status: 404 })
    }

    const resPersistent401 = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchPersistent401,
    })

    assert(persistent401Attempts === 2, 'Persistent 401 retried exactly once and halted (2 total attempts)')
    assert(resPersistent401.success === false, 'Persistent 401 returns success: false')
    assert(resPersistent401.status === 'temporarily_unavailable', 'Persistent 401 returns status: temporarily_unavailable')
    assert(resPersistent401.serviceable === false, 'Persistent 401 returns serviceable: false')

    // -------------------------------------------------------------------------
    // GROUP 7: Request Timeout & Upstream 5xx Outages
    // -------------------------------------------------------------------------
    console.log('\n--- Group 7: Timeout & Upstream Server Errors ---')

    resetShiprocketAuthForTesting()

    // 7A: Timeout
    const mockFetchTimeout: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      throw err
    }

    const resTimeout = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchTimeout,
    })
    assert(resTimeout.success === false, 'Timeout returns success: false')
    assert(resTimeout.status === 'temporarily_unavailable', 'Timeout returns status: temporarily_unavailable')
    assert(resTimeout.serviceable === false, 'Timeout returns serviceable: false (never false-promises delivery)')
    assert(resTimeout.message?.includes('timed out') === true, 'Timeout error message specifies timed out')

    // 7B: Upstream 500
    const mockFetch500: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }

    const res500 = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetch500,
    })
    assert(res500.success === false, 'HTTP 500 returns success: false')
    assert(res500.status === 'temporarily_unavailable', 'HTTP 500 returns status: temporarily_unavailable')
    assert(res500.serviceable === false, 'HTTP 500 returns serviceable: false')

    // 7C: Network Failure (fetch throw)
    const mockFetchNetworkError: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      throw new Error('Connection refused')
    }

    const resNetError = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchNetworkError,
    })
    assert(resNetError.success === false, 'Network error returns success: false')
    assert(resNetError.status === 'temporarily_unavailable', 'Network error returns status: temporarily_unavailable')
    assert(resNetError.serviceable === false, 'Network error returns serviceable: false')

    // -------------------------------------------------------------------------
    // GROUP 8: Non-Leakage & Information Security
    // -------------------------------------------------------------------------
    console.log('\n--- Group 8: Information Security & Non-Leakage ---')

    const serialized = JSON.stringify(successRes)
    assert(!serialized.includes('SHOULD_NEVER_LEAK'), 'Internal vendor secrets in response are filtered out')
    assert(!serialized.includes(mockToken), 'Bearer token is never leaked in the result object')
    assert(!serialized.includes('MockShiprocketPassword'), 'Password is never leaked in the result object')
    assert(!serialized.includes('Authorization'), 'Authorization header is never leaked in the result object')

    const serializedError = JSON.stringify(res500)
    assert(!serializedError.includes('MockShiprocketPassword'), 'Errors do not leak password')
    assert(!serializedError.includes(mockToken), 'Errors do not leak Bearer token')

    // -------------------------------------------------------------------------
    // GROUP 9: Fallback & Outage Behavior Invariant Verification
    // -------------------------------------------------------------------------
    console.log('\n--- Group 9: Outage Invariant Verification ---')

    // Verify all failure / outage cases strictly enforce serviceable: false and customerShippingCharge: 0
    const failureResults: CourierServiceabilityResult[] = [
      resInvalidPin,
      resInvalidWeight,
      resEmpty,
      res404,
      resPersistent401,
      resTimeout,
      res500,
      resNetError,
    ]

    const allFailuresSafe = failureResults.every(
      (r) => r.serviceable === false && r.customerShippingCharge === 0
    )
    assert(allFailuresSafe, 'All failure/outage responses strictly maintain serviceable=false and customerShippingCharge=0')

    // -------------------------------------------------------------------------
    // GROUP 10: Courier Rate Validation & Invalid Rate Exclusion
    // -------------------------------------------------------------------------
    console.log('\n--- Group 10: Courier Rate Validation & Invalid Rate Exclusion ---')

    resetShiprocketAuthForTesting()

    const mockCouriersWithInvalidRates = [
      { courier_name: 'Courier Zero Rate', rate: 0, estimated_delivery_days: 3 },
      { courier_name: 'Courier Negative Rate', rate: -45.0, estimated_delivery_days: 2 },
      { courier_name: 'Courier Null Rate', rate: null, estimated_delivery_days: 4 },
      { courier_name: 'Courier Missing Rate', estimated_delivery_days: 5 },
      { courier_name: 'Courier String Invalid', rate: 'not_a_number', estimated_delivery_days: 3 },
      { courier_name: 'Courier Negative String', rate: '-20.5', estimated_delivery_days: 3 },
      { courier_name: 'Courier Infinite Rate', rate: Infinity, estimated_delivery_days: 2 },
      { courier_name: 'Valid Courier Expensive', rate: 110.0, estimated_delivery_days: 2 },
      { courier_name: 'Valid Courier Cheapest', rate: 68.5, estimated_delivery_days: 4 },
    ]

    const mockFetchRateValidation: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: mockCouriersWithInvalidRates },
        }),
        { status: 200 }
      )
    }

    const resRateValidation = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchRateValidation,
    })

    assert(resRateValidation.success === true, 'Response is successful with valid couriers')
    assert(resRateValidation.serviceable === true, 'Response is serviceable')
    assert(resRateValidation.availableCouriersCount === 2, 'Only 2 valid couriers kept (7 invalid rate couriers excluded)')
    assert(
      resRateValidation.cheapestCourier?.courierName === 'Valid Courier Cheapest',
      'Cheapest courier is Valid Courier Cheapest (₹68.50)'
    )
    assert(resRateValidation.cheapestCourier?.rate === 68.5, 'Cheapest rate is 68.50')
    assert(
      resRateValidation.cheapestCourier?.courierName !== 'Courier Zero Rate',
      'Zero rate courier was NOT selected as cheapest'
    )
    assert(
      resRateValidation.cheapestCourier?.courierName !== 'Courier Negative Rate',
      'Negative rate courier was NOT selected as cheapest'
    )

    // -------------------------------------------------------------------------
    // GROUP 11: All Couriers Have Invalid Rates -> Unserviceable
    // -------------------------------------------------------------------------
    console.log('\n--- Group 11: All Couriers Have Invalid Rates ---')

    resetShiprocketAuthForTesting()

    const mockCouriersAllInvalidRates = [
      { courier_name: 'Courier A', rate: 0 },
      { courier_name: 'Courier B', rate: -10 },
      { courier_name: 'Courier C', rate: null },
      { courier_name: 'Courier D', rate: 'invalid' },
      { courier_name: 'Courier E' },
    ]

    const mockFetchAllInvalidRates: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: mockCouriersAllInvalidRates },
        }),
        { status: 200 }
      )
    }

    const resAllInvalidRates = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchAllInvalidRates,
    })

    assert(resAllInvalidRates.success === true, 'All invalid rates returns success: true')
    assert(resAllInvalidRates.status === 'unserviceable', 'All invalid rates returns status: unserviceable')
    assert(resAllInvalidRates.serviceable === false, 'All invalid rates returns serviceable: false')
    assert(resAllInvalidRates.availableCouriersCount === 0, 'availableCouriersCount is 0 when all rates invalid')
    assert(resAllInvalidRates.cheapestCourier === undefined, 'cheapestCourier is undefined when all rates invalid')
    assert(resAllInvalidRates.fastestCourier === undefined, 'fastestCourier is undefined when all rates invalid')

    // -------------------------------------------------------------------------
    // GROUP 12: Independent Fastest Courier Logic (Missing / Invalid ETA)
    // -------------------------------------------------------------------------
    console.log('\n--- Group 12: Independent Fastest Courier Logic (Missing/Invalid ETA) ---')

    resetShiprocketAuthForTesting()

    const mockCouriersMissingETA = [
      { courier_name: 'Courier Alpha', rate: 70.0, estimated_delivery_days: null, etd: '' },
      { courier_name: 'Courier Beta', rate: 85.0, estimated_delivery_days: 0, etd: '' },
      { courier_name: 'Courier Gamma', rate: 60.0, estimated_delivery_days: -2, etd: '' },
      { courier_name: 'Courier Delta', rate: 95.0, estimated_delivery_days: 'invalid_days', etd: '' },
    ]

    const mockFetchMissingETA: typeof fetch = async (input) => {
      const urlStr = String(input)
      if (urlStr.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: mockToken }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          status: 200,
          data: { available_courier_companies: mockCouriersMissingETA },
        }),
        { status: 200 }
      )
    }

    const resMissingETA = await checkCourierServiceability('560001', 0.5, {
      customFetch: mockFetchMissingETA,
    })

    assert(resMissingETA.success === true, 'Valid rate response with missing ETA returns success: true')
    assert(resMissingETA.serviceable === true, 'Valid rate response with missing ETA returns serviceable: true')
    assert(resMissingETA.availableCouriersCount === 4, 'All 4 couriers with valid rates are preserved')
    assert(resMissingETA.cheapestCourier?.courierName === 'Courier Gamma', 'Cheapest courier is Courier Gamma (₹60.0)')
    assert(resMissingETA.cheapestCourier?.rate === 60.0, 'Cheapest rate is 60.0')
    assert(resMissingETA.fastestCourier === undefined, 'fastestCourier is strictly undefined (never fell back to cheapestCourier)')
    assert(resMissingETA.minEstimatedDays === undefined, 'minEstimatedDays is undefined when no valid ETA exists')
    assert(resMissingETA.maxEstimatedDays === undefined, 'maxEstimatedDays is undefined when no valid ETA exists')
    assert(resMissingETA.estimatedDeliveryDate === undefined, 'estimatedDeliveryDate is undefined when no valid ETA exists')
    assert(resMissingETA.customerShippingCharge === 0, 'customerShippingCharge remains 0')

  } finally {
    process.env = originalEnv
    resetShiprocketAuthForTesting()
  }

  console.log('\n========================================================================')
  console.log(` Test Summary: ${passedTests} passed, ${failedTests} failed.`)
  console.log('========================================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled test suite error:', err)
  process.exit(1)
})
