import { API_BASE_URL } from '../config/api'

export interface PublicDeliveryEstimate {
  minEstimatedDays?: number
  maxEstimatedDays?: number
  estimatedDeliveryDate?: string
}

export interface ShippingServiceabilityResponse {
  success: boolean
  status: 'serviceable' | 'unserviceable' | 'temporarily_unavailable' | 'invalid_input'
  serviceable: boolean
  pincode?: string
  city?: string
  state?: string
  customerShippingCharge?: number
  deliveryEstimate?: PublicDeliveryEstimate
  message?: string
}

/**
 * Safely formats an estimated delivery date string into an Indian locale readable date.
 * Returns null if date is missing, malformed, or invalid (prevents rendering "Invalid Date").
 */
export function formatEstimatedDeliveryDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null
  }
  const timestamp = Date.parse(dateStr.trim())
  if (isNaN(timestamp)) {
    return null
  }
  return new Date(timestamp).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Checks courier serviceability and estimated delivery timeframe for a 6-digit Indian PIN code.
 * Calls GET /api/shipping/serviceability?pincode={cleanPin}
 *
 * Guarantees:
 * - Always returns a valid ShippingServiceabilityResponse object.
 * - Empty body, non-JSON, null, or malformed responses safely return status: 'temporarily_unavailable'.
 * - Preserves AbortError propagation for active signal cancellation.
 */
export async function checkShippingServiceability(
  pincode: string,
  signal?: AbortSignal
): Promise<ShippingServiceabilityResponse> {
  const cleanPin = pincode.trim()
  const url = `${API_BASE_URL}/shipping/serviceability?pincode=${encodeURIComponent(cleanPin)}`

  // Allow fetch to throw AbortError or network errors naturally so AbortSignal cancellation works
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  // Safe JSON extraction
  let data: any = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  // Handle HTTP error responses (non-2xx)
  if (!response.ok) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        success: Boolean(data.success),
        status: data.status === 'invalid_input' ? 'invalid_input' : 'temporarily_unavailable',
        serviceable: false,
        pincode: typeof data.pincode === 'string' ? data.pincode : cleanPin,
        message: typeof data.message === 'string' ? data.message : 'Unable to check shipping serviceability.',
      }
    }
    return {
      success: false,
      status: response.status === 400 ? 'invalid_input' : 'temporarily_unavailable',
      serviceable: false,
      pincode: cleanPin,
      message: 'Unable to check shipping serviceability at this time.',
    }
  }

  // Handle HTTP 200 with empty body, non-JSON, null, or malformed structure
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      pincode: cleanPin,
      message: 'Invalid response received from shipping service.',
    }
  }

  // Validate status field
  const validStatuses = ['serviceable', 'unserviceable', 'temporarily_unavailable', 'invalid_input']
  if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) {
    return {
      success: false,
      status: 'temporarily_unavailable',
      serviceable: false,
      pincode: cleanPin,
      message: 'Malformed status in shipping service response.',
    }
  }

  // Validate delivery estimate if present
  let deliveryEstimate: PublicDeliveryEstimate | undefined
  if (data.deliveryEstimate && typeof data.deliveryEstimate === 'object' && !Array.isArray(data.deliveryEstimate)) {
    const minDays =
      typeof data.deliveryEstimate.minEstimatedDays === 'number' && Number.isFinite(data.deliveryEstimate.minEstimatedDays)
        ? data.deliveryEstimate.minEstimatedDays
        : undefined
    const maxDays =
      typeof data.deliveryEstimate.maxEstimatedDays === 'number' && Number.isFinite(data.deliveryEstimate.maxEstimatedDays)
        ? data.deliveryEstimate.maxEstimatedDays
        : undefined
    const estDate =
      typeof data.deliveryEstimate.estimatedDeliveryDate === 'string' && data.deliveryEstimate.estimatedDeliveryDate.trim()
        ? data.deliveryEstimate.estimatedDeliveryDate.trim()
        : undefined

    if (minDays !== undefined || maxDays !== undefined || estDate !== undefined) {
      deliveryEstimate = {
        minEstimatedDays: minDays,
        maxEstimatedDays: maxDays,
        estimatedDeliveryDate: estDate,
      }
    }
  }

  return {
    success: Boolean(data.success),
    status: data.status as 'serviceable' | 'unserviceable' | 'temporarily_unavailable' | 'invalid_input',
    serviceable: Boolean(data.serviceable),
    pincode: typeof data.pincode === 'string' ? data.pincode : cleanPin,
    city: typeof data.city === 'string' && data.city.trim() ? data.city.trim() : undefined,
    state: typeof data.state === 'string' && data.state.trim() ? data.state.trim() : undefined,
    customerShippingCharge: typeof data.customerShippingCharge === 'number' ? data.customerShippingCharge : 0,
    deliveryEstimate,
    message: typeof data.message === 'string' ? data.message : undefined,
  }
}
