import {
  SHIPROCKET_API_BASE_URL,
  SHIPROCKET_PICKUP_POSTCODE,
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_SHIPMENT_WEIGHT_KG,
  MAX_SHIPMENT_WEIGHT_KG,
  DEFAULT_PACKAGE_DIMENSIONS,
  PackageDimensions,
  isShiprocketConfigured,
} from '../config/shiprocketConfig'
import {
  getShiprocketToken,
  invalidateToken,
} from './shiprocketAuthService'

export type ServiceabilityStatus =
  | 'serviceable'
  | 'unserviceable'
  | 'temporarily_unavailable'
  | 'invalid_input'

export interface CourierOptionSummary {
  courierName: string
  courierCompanyId?: number
  rate: number // Internal courier cost to KALA in INR
  etd: string   // Estimated time of delivery string or date
  estimatedDeliveryDays?: number
  isAir?: boolean
}

export interface CourierServiceabilityResult {
  success: boolean
  status: ServiceabilityStatus
  serviceable: boolean
  pincode: string
  city?: string
  state?: string
  customerShippingCharge: number // Always 0 (KALA free shipping policy)
  minEstimatedDays?: number
  maxEstimatedDays?: number
  estimatedDeliveryDate?: string
  cheapestCourier?: CourierOptionSummary
  fastestCourier?: CourierOptionSummary
  availableCouriersCount: number
  message?: string
}

export interface ServiceabilityOptions {
  timeoutMs?: number
  baseUrl?: string
  customFetch?: typeof fetch
  pickupPostcode?: string
  dimensions?: PackageDimensions
}

// 8 seconds request timeout as specified
export const SERVICEABILITY_TIMEOUT_MS = 8_000

// Indian Postal Code validation regex (exact 6 digits)
const PINCODE_REGEX = /^\d{6}$/

/**
 * Validates delivery pincode against standard Indian 6-digit postal code pattern.
 */
export function isValidPincode(pincode?: string | null): boolean {
  if (!pincode || typeof pincode !== 'string') return false
  return PINCODE_REGEX.test(pincode.trim())
}

/**
 * Validates and normalizes shipment weight in kilograms.
 * Clamps within [MIN_SHIPMENT_WEIGHT_KG, MAX_SHIPMENT_WEIGHT_KG].
 * Returns null if weight is invalid or outside permitted bounds.
 */
export function validateShipmentWeight(weight?: number | null): { valid: boolean; weight: number } {
  if (weight === undefined || weight === null) {
    return { valid: true, weight: DEFAULT_SHIPMENT_WEIGHT_KG }
  }

  if (typeof weight !== 'number' || isNaN(weight)) {
    return { valid: false, weight: DEFAULT_SHIPMENT_WEIGHT_KG }
  }

  const rounded = Math.round(weight * 100) / 100

  if (rounded < MIN_SHIPMENT_WEIGHT_KG || rounded > MAX_SHIPMENT_WEIGHT_KG) {
    return { valid: false, weight: rounded }
  }

  return { valid: true, weight: rounded }
}

/**
 * Sanitizes and extracts public courier summaries from raw Shiprocket courier entries.
 * Never leaks raw routing headers, internal vendor tokens, or raw request/response metadata.
 */
function sanitizeCourierCompanies(rawCouriers: any[]): {
  couriers: CourierOptionSummary[]
  city?: string
  state?: string
} {
  const couriers: CourierOptionSummary[] = []
  let detectedCity: string | undefined
  let detectedState: string | undefined

  for (const c of rawCouriers) {
    if (!c || typeof c !== 'object') continue

    const name = String(c.courier_name || c.name || '').trim()
    if (!name) continue

    // Rate validation: must be a valid, finite, positive number
    if (c.rate === undefined || c.rate === null) continue

    let rateNum: number
    if (typeof c.rate === 'number') {
      rateNum = c.rate
    } else if (typeof c.rate === 'string' && c.rate.trim()) {
      rateNum = Number(c.rate.trim())
    } else {
      continue
    }

    if (!Number.isFinite(rateNum) || rateNum <= 0) {
      continue
    }

    const rate = Math.round(rateNum * 100) / 100

    let estimatedDeliveryDays: number | undefined
    if (
      typeof c.estimated_delivery_days === 'number' &&
      Number.isFinite(c.estimated_delivery_days) &&
      c.estimated_delivery_days > 0
    ) {
      estimatedDeliveryDays = Math.round(c.estimated_delivery_days)
    } else if (typeof c.estimated_delivery_days === 'string' && c.estimated_delivery_days.trim()) {
      const parsed = parseInt(c.estimated_delivery_days.trim(), 10)
      if (!isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) {
        estimatedDeliveryDays = parsed
      }
    }

    const etd = String(c.etd || (estimatedDeliveryDays ? `${estimatedDeliveryDays} days` : '')).trim()
    const isAir = c.is_surface === false || /air/i.test(name)

    if (!detectedCity && c.city && typeof c.city === 'string' && c.city.trim()) {
      detectedCity = c.city.trim()
    }
    if (!detectedState && c.state && typeof c.state === 'string' && c.state.trim()) {
      detectedState = c.state.trim()
    }

    couriers.push({
      courierName: name,
      courierCompanyId: typeof c.courier_company_id === 'number' ? c.courier_company_id : undefined,
      rate,
      etd,
      estimatedDeliveryDays,
      isAir,
    })
  }

  return { couriers, city: detectedCity, state: detectedState }
}

/**
 * Internal worker performing the HTTP GET /v1/external/courier/serviceability/ request.
 * Supports token invalidation and single retry on HTTP 401 Unauthorized.
 */
async function performServiceabilityRequest(
  deliveryPincode: string,
  weight: number,
  options?: ServiceabilityOptions,
  isRetry = false
): Promise<CourierServiceabilityResult> {
  const timeoutMs = options?.timeoutMs ?? SERVICEABILITY_TIMEOUT_MS
  const baseUrl = (options?.baseUrl || SHIPROCKET_API_BASE_URL).replace(/\/+$/, '')
  const fetchFn = options?.customFetch || fetch
  const pickupPostcode = options?.pickupPostcode || SHIPROCKET_PICKUP_POSTCODE
  const dimensions = options?.dimensions || DEFAULT_PACKAGE_DIMENSIONS

  let token: string
  try {
    token = await getShiprocketToken({
      customFetch: fetchFn,
      baseUrl,
      timeoutMs,
      forceRefresh: isRetry,
    })
  } catch {
    // If authentication service fails or credentials unconfigured
    return {
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      pincode: deliveryPincode,
      customerShippingCharge: 0,
      availableCouriersCount: 0,
      message: 'Shipping serviceability service is temporarily unavailable.',
    }
  }

  // Construct query parameters matching Shiprocket specifications
  const serviceabilityUrl = new URL(`${baseUrl}/courier/serviceability/`)
  serviceabilityUrl.searchParams.set('pickup_postcode', pickupPostcode)
  serviceabilityUrl.searchParams.set('delivery_postcode', deliveryPincode)
  serviceabilityUrl.searchParams.set('weight', String(weight))
  serviceabilityUrl.searchParams.set('cod', '0') // Prepaid only
  serviceabilityUrl.searchParams.set('length', String(dimensions.length))
  serviceabilityUrl.searchParams.set('breadth', String(dimensions.breadth))
  serviceabilityUrl.searchParams.set('height', String(dimensions.height))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchFn(serviceabilityUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    // 401 Unauthorized handling: invalidate token and retry exactly once
    if (response.status === 401 || response.status === 403) {
      if (!isRetry) {
        invalidateToken()
        return await performServiceabilityRequest(deliveryPincode, weight, options, true)
      }

      return {
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Shipping serviceability service is temporarily unavailable.',
      }
    }

    // 404 or 422: Typically unserviceable destination or invalid routing from Shiprocket
    if (response.status === 404 || response.status === 422) {
      return {
        success: true,
        status: 'unserviceable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Delivery is currently unavailable for this pincode.',
      }
    }

    // 5xx Upstream Server Errors
    if (response.status >= 500) {
      return {
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Shipping serviceability service is temporarily unavailable.',
      }
    }

    if (!response.ok) {
      return {
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Shipping serviceability service is temporarily unavailable.',
      }
    }

    let responseData: any
    try {
      responseData = await response.json()
    } catch {
      return {
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Shipping serviceability service is temporarily unavailable.',
      }
    }

    const rawCouriers = responseData?.data?.available_courier_companies
    if (!Array.isArray(rawCouriers) || rawCouriers.length === 0) {
      return {
        success: true,
        status: 'unserviceable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Delivery is currently unavailable for this pincode.',
      }
    }

    const { couriers, city, state } = sanitizeCourierCompanies(rawCouriers)
    if (couriers.length === 0) {
      return {
        success: true,
        status: 'unserviceable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Delivery is currently unavailable for this pincode.',
      }
    }

    // Determine cheapest available courier (from couriers with valid positive rates)
    const sortedByRate = [...couriers].sort((a, b) => a.rate - b.rate)
    const cheapestCourier = sortedByRate[0]

    // Determine fastest available courier (strictly from couriers with valid positive estimatedDeliveryDays)
    const couriersWithDays = couriers.filter(
      (c) => typeof c.estimatedDeliveryDays === 'number' && Number.isFinite(c.estimatedDeliveryDays) && c.estimatedDeliveryDays > 0
    )
    const fastestCourier =
      couriersWithDays.length > 0
        ? [...couriersWithDays].sort((a, b) => a.estimatedDeliveryDays! - b.estimatedDeliveryDays!)[0]
        : undefined

    // Calculate delivery day bounds only if valid ETA exists
    let minEstimatedDays: number | undefined
    let maxEstimatedDays: number | undefined
    let estimatedDeliveryDate: string | undefined

    if (couriersWithDays.length > 0) {
      const days = couriersWithDays.map((c) => c.estimatedDeliveryDays!)
      minEstimatedDays = Math.min(...days)
      maxEstimatedDays = Math.max(...days)
      const targetDate = new Date(Date.now() + minEstimatedDays * 24 * 60 * 60 * 1000)
      estimatedDeliveryDate = targetDate.toISOString().split('T')[0]
    }

    return {
      success: true,
      status: 'serviceable',
      serviceable: true,
      pincode: deliveryPincode,
      city,
      state,
      customerShippingCharge: 0, // Always ₹0 under KALA policy
      minEstimatedDays,
      maxEstimatedDays,
      estimatedDeliveryDate,
      cheapestCourier,
      fastestCourier,
      availableCouriersCount: couriers.length,
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return {
        success: false,
        status: 'temporarily_unavailable',
        serviceable: false,
        pincode: deliveryPincode,
        customerShippingCharge: 0,
        availableCouriersCount: 0,
        message: 'Shipping serviceability check timed out. Please try again shortly.',
      }
    }

    return {
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      pincode: deliveryPincode,
      customerShippingCharge: 0,
      availableCouriersCount: 0,
      message: 'Shipping serviceability service is temporarily unavailable.',
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Checks courier serviceability and estimated delivery times for a given destination pincode.
 *
 * Guarantees:
 * 1. Strict validation: Accepts only valid 6-digit Indian PIN codes and weights between 0.1kg and 1.0kg.
 * 2. 401 recovery: In case of unexpected token expiration, invalidates token and retries authentication once.
 * 3. 8-second timeout: Requests automatically abort after 8 seconds.
 * 4. Safe failure mode: NEVER returns `serviceable=true` during an outage or error.
 * 5. Zero-leakage: Raw Shiprocket responses, internal routing metadata, headers, and tokens are never exposed.
 * 6. Free shipping invariant: `customerShippingCharge` is guaranteed to be 0 (order pricing unaffected).
 */
export async function checkCourierServiceability(
  deliveryPincode: string,
  weightKg?: number,
  options?: ServiceabilityOptions
): Promise<CourierServiceabilityResult> {
  const cleanPincode = typeof deliveryPincode === 'string' ? deliveryPincode.trim() : ''

  // 1. Validate destination postal code
  if (!isValidPincode(cleanPincode)) {
    return {
      success: false,
      status: 'invalid_input',
      serviceable: false,
      pincode: cleanPincode,
      customerShippingCharge: 0,
      availableCouriersCount: 0,
      message: 'Invalid delivery pincode: A valid 6-digit Indian PIN code is required.',
    }
  }

  // 2. Validate shipment weight
  const weightResult = validateShipmentWeight(weightKg)
  if (!weightResult.valid) {
    return {
      success: false,
      status: 'invalid_input',
      serviceable: false,
      pincode: cleanPincode,
      customerShippingCharge: 0,
      availableCouriersCount: 0,
      message: `Invalid shipment weight: Weight must be between ${MIN_SHIPMENT_WEIGHT_KG}kg and ${MAX_SHIPMENT_WEIGHT_KG}kg.`,
    }
  }

  // 3. Check configuration guard
  if (!isShiprocketConfigured()) {
    return {
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      pincode: cleanPincode,
      customerShippingCharge: 0,
      availableCouriersCount: 0,
      message: 'Shipping serviceability service is temporarily unavailable.',
    }
  }

  // 4. Execute request with retry and timeout protections
  return performServiceabilityRequest(cleanPincode, weightResult.weight, options)
}
