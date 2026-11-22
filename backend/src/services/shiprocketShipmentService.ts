import {
  SHIPROCKET_API_BASE_URL,
  getShiprocketPickupLocation,
  DEFAULT_PACKAGE_DIMENSIONS,
  DEFAULT_SHIPMENT_WEIGHT_KG,
  MIN_SHIPMENT_WEIGHT_KG,
  MAX_SHIPMENT_WEIGHT_KG,
} from '../config/shiprocketConfig'
import {
  getShiprocketToken,
  invalidateToken,
} from './shiprocketAuthService'
import { IShiprocketTrackingScan } from '../models/Order'

export interface ShiprocketApiOptions {
  timeoutMs?: number
  baseUrl?: string
  customFetch?: typeof fetch
}

export const SHIPROCKET_API_TIMEOUT_MS = 10_000

export interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  discount?: number
  tax?: number
  hsn?: number
}

export interface CreateShiprocketOrderParams {
  orderId: string               // KALA internal order ID (e.g. KALA-...)
  orderDate?: string            // 'YYYY-MM-DD HH:mm'
  pickupLocation?: string
  customerFirstName: string
  customerLastName: string
  address: string
  address2?: string
  city: string
  pincode: string
  state: string
  email: string
  phone: string
  items: ShiprocketOrderItem[]
  subtotal: number
  totalDiscount?: number
  packageWeightKg?: number
  packageDimensions?: {
    length: number
    breadth: number
    height: number
  }
}

export interface ShiprocketCreateOrderResult {
  success: boolean
  orderId?: number | string
  shipmentId?: number | string
  status?: string
  statusCode?: number
  message: string
}

export interface AssignCourierParams {
  shipmentId: number | string
  courierId?: number
}

export interface ShiprocketAwbResult {
  success: boolean
  awbCode?: string
  courierName?: string
  courierCompanyId?: number
  shipmentId?: number | string
  message: string
}

export interface ShiprocketLabelResult {
  success: boolean
  labelUrl?: string
  labelCreated?: number
  message: string
}

export interface ShiprocketInvoiceResult {
  success: boolean
  invoiceUrl?: string
  isInvoiceCreated?: boolean
  message: string
}

export interface SchedulePickupParams {
  shipmentIds: (number | string)[]
  pickupDate?: string // 'YYYY-MM-DD'
}

export interface ShiprocketPickupResult {
  success: boolean
  pickupStatus?: number
  pickupScheduledDate?: string
  pickupTokenNumber?: string
  message: string
}

export interface ShiprocketTrackingResult {
  success: boolean
  awbCode: string
  currentStatus?: string
  currentStatusId?: number
  currentLocation?: string
  scans?: IShiprocketTrackingScan[]
  etd?: string
  message: string
}

/**
 * Format a Date to 'YYYY-MM-DD HH:mm' required by Shiprocket order API.
 */
export function formatShiprocketDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

/**
 * Generic authenticated fetch wrapper for Shiprocket API endpoints with:
 * - Bearer authorization header
 * - Automatic single 401 retry with token invalidation
 * - Configurable AbortController timeout
 * - Zero sensitive logging
 */
async function shiprocketFetch(
  endpoint: string,
  fetchOptions: RequestInit = {},
  options: ShiprocketApiOptions = {},
  isRetry = false
): Promise<{ status: number; data: any }> {
  const fetchFn = options.customFetch || globalThis.fetch
  const baseUrl = options.baseUrl || SHIPROCKET_API_BASE_URL
  const timeoutMs = options.timeoutMs ?? SHIPROCKET_API_TIMEOUT_MS
  const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`

  // Retrieve valid auth token
  const token = await getShiprocketToken({
    customFetch: options.customFetch,
    baseUrl: options.baseUrl,
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...((fetchOptions.headers as Record<string, string>) || {}),
    }

    const response = await fetchFn(fullUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    // If 401 and haven't retried yet, invalidate token and retry once
    if (response.status === 401 && !isRetry) {
      invalidateToken()
      clearTimeout(timer)
      return shiprocketFetch(endpoint, fetchOptions, options, true)
    }

    let parsedData: any = null
    const text = await response.text()
    if (text) {
      try {
        parsedData = JSON.parse(text)
      } catch {
        parsedData = { raw: text }
      }
    }

    return { status: response.status, data: parsedData }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Creates an ad-hoc order in Shiprocket for a prepaid KALA e-commerce purchase.
 *
 * Endpoint: POST /orders/create/adhoc
 */
export async function createShiprocketOrder(
  params: CreateShiprocketOrderParams,
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketCreateOrderResult> {
  try {
    // Sanitize input values
    const cleanOrderId = params.orderId.trim()
    const cleanPhone = params.phone.replace(/[^0-9]/g, '').slice(-10) // 10-digit Indian mobile
    const cleanPincode = params.pincode.replace(/[^0-9]/g, '')
    const pickupLocation = params.pickupLocation || getShiprocketPickupLocation()
    const orderDate = params.orderDate || formatShiprocketDate()

    const weight = Math.max(
      MIN_SHIPMENT_WEIGHT_KG,
      Math.min(params.packageWeightKg || DEFAULT_SHIPMENT_WEIGHT_KG, 10.0)
    )

    const dims = params.packageDimensions || DEFAULT_PACKAGE_DIMENSIONS

    const payload = {
      order_id: cleanOrderId,
      order_date: orderDate,
      pickup_location: pickupLocation,
      channel_id: '',
      comment: 'KALA Prepaid Customer Order',
      billing_customer_name: params.customerFirstName.trim(),
      billing_last_name: params.customerLastName.trim() || params.customerFirstName.trim(),
      billing_address: params.address.trim(),
      billing_address_2: params.address2?.trim() || '',
      billing_city: params.city.trim(),
      billing_pincode: cleanPincode,
      billing_state: params.state.trim(),
      billing_country: 'India',
      billing_email: params.email.trim().toLowerCase(),
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: params.items.map((it) => ({
        name: it.name,
        sku: it.sku || `KALA-${it.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`,
        units: it.units,
        selling_price: it.selling_price,
        discount: it.discount || 0,
        tax: it.tax || 0,
        ...(it.hsn ? { hsn: it.hsn } : {}),
      })),
      payment_method: 'Prepaid',
      shipping_charges: 0, // Invariant: KALA ₹0 shipping
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: params.totalDiscount || 0,
      sub_total: params.subtotal,
      length: dims.length,
      breadth: dims.breadth,
      height: dims.height,
      weight: Number(weight.toFixed(2)),
    }

    const { status, data } = await shiprocketFetch(
      '/orders/create/adhoc',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options
    )

    if (status >= 200 && status < 300 && (data?.order_id || data?.shipment_id)) {
      return {
        success: true,
        orderId: data.order_id,
        shipmentId: data.shipment_id,
        status: data.status || 'NEW',
        statusCode: data.status_code,
        message: 'Shiprocket order created successfully.',
      }
    }

    // Handle duplicate or already created error gracefully
    const errorMessage =
      data?.message ||
      (typeof data?.errors === 'string' ? data.errors : JSON.stringify(data?.errors || '')) ||
      `Shiprocket order creation failed with HTTP ${status}.`

    return {
      success: false,
      orderId: data?.order_id,
      shipmentId: data?.shipment_id,
      message: errorMessage,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Shiprocket order creation API.',
    }
  }
}

/**
 * Assigns an available courier partner and generates an AWB for a Shiprocket shipment.
 *
 * Endpoint: POST /courier/assign/awb
 */
export async function assignCourierAndGenerateAwb(
  params: AssignCourierParams,
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketAwbResult> {
  try {
    const payload: Record<string, any> = {
      shipment_id: params.shipmentId,
    }
    if (params.courierId) {
      payload.courier_id = params.courierId
    }

    const { status, data } = await shiprocketFetch(
      '/courier/assign/awb',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options
    )

    // Shiprocket returns awb_assign_status: 1 on success
    const awbData = data?.response?.data
    if (status === 200 && (data?.awb_assign_status === 1 || awbData?.awb_code)) {
      return {
        success: true,
        awbCode: String(awbData?.awb_code || data?.awb_code || ''),
        courierName: awbData?.courier_name || data?.courier_name,
        courierCompanyId: awbData?.courier_company_id || data?.courier_company_id,
        shipmentId: awbData?.shipment_id || params.shipmentId,
        message: 'AWB assigned successfully.',
      }
    }

    const err =
      data?.message ||
      data?.response?.data?.awb_assign_error ||
      data?.response?.message ||
      `AWB assignment failed with status ${status}.`

    return {
      success: false,
      message: err,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Shiprocket AWB generation API.',
    }
  }
}

/**
 * Generates and retrieves the shipping label URL for one or more shipments.
 *
 * Endpoint: POST /courier/generate/label
 */
export async function generateShippingLabel(
  shipmentIds: (number | string)[],
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketLabelResult> {
  try {
    const payload = {
      shipment_id: shipmentIds.map((id) => (typeof id === 'string' ? id.trim() : id)),
    }

    const { status, data } = await shiprocketFetch(
      '/courier/generate/label',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options
    )

    if (status === 200 && (data?.label_created === 1 || data?.label_url)) {
      return {
        success: true,
        labelUrl: data.label_url,
        labelCreated: data.label_created,
        message: 'Shipping label generated successfully.',
      }
    }

    return {
      success: false,
      labelUrl: data?.label_url,
      message: data?.message || `Shipping label generation failed with HTTP ${status}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Shiprocket label generation API.',
    }
  }
}

/**
 * Generates and prints the invoice for Shiprocket orders.
 *
 * Endpoint: POST /orders/print/invoice
 */
export async function generateInvoice(
  orderIds: (number | string)[],
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketInvoiceResult> {
  try {
    const payload = {
      ids: orderIds.map((id) => (typeof id === 'string' ? id.trim() : id)),
    }

    const { status, data } = await shiprocketFetch(
      '/orders/print/invoice',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options
    )

    if (status === 200 && (data?.is_invoice_created || data?.invoice_url)) {
      return {
        success: true,
        invoiceUrl: data.invoice_url,
        isInvoiceCreated: Boolean(data.is_invoice_created),
        message: 'Invoice generated successfully.',
      }
    }

    return {
      success: false,
      invoiceUrl: data?.invoice_url,
      message: data?.message || `Invoice generation failed with HTTP ${status}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Shiprocket invoice API.',
    }
  }
}

/**
 * Requests/schedules a courier pickup for shipments.
 *
 * Endpoint: POST /courier/generate/pickup
 */
export async function schedulePickup(
  params: SchedulePickupParams,
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketPickupResult> {
  try {
    const payload: Record<string, any> = {
      shipment_id: params.shipmentIds.map((id) => (typeof id === 'string' ? id.trim() : id)),
    }
    if (params.pickupDate) {
      payload.pickup_date = [params.pickupDate]
    }

    const { status, data } = await shiprocketFetch(
      '/courier/generate/pickup',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      options
    )

    const pickupResp = data?.response
    if (status === 200 && (data?.pickup_status === 1 || pickupResp?.data)) {
      return {
        success: true,
        pickupStatus: data.pickup_status,
        pickupScheduledDate: pickupResp?.pickup_scheduled_date,
        pickupTokenNumber: pickupResp?.pickup_token_number,
        message: pickupResp?.data || 'Pickup scheduled successfully.',
      }
    }

    return {
      success: false,
      message: data?.message || pickupResp?.data || `Pickup scheduling failed with HTTP ${status}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error communicating with Shiprocket pickup API.',
    }
  }
}

/**
 * Tracks a shipment using its AWB code.
 *
 * Endpoint: GET /courier/track/awb/{awbCode}
 */
export async function trackShipmentByAwb(
  awbCode: string,
  options: ShiprocketApiOptions = {}
): Promise<ShiprocketTrackingResult> {
  const cleanAwb = awbCode.trim()
  if (!cleanAwb) {
    return {
      success: false,
      awbCode: '',
      message: 'Missing AWB code for tracking lookup.',
    }
  }

  try {
    const { status, data } = await shiprocketFetch(
      `/courier/track/awb/${encodeURIComponent(cleanAwb)}`,
      { method: 'GET' },
      options
    )

    const trackingData = data?.tracking_data
    if (status === 200 && trackingData) {
      const trackObj = trackingData.shipment_track_activities || trackingData.shipment_track?.[0]
      const currentStatus =
        trackObj?.current_status ||
        trackingData.shipment_track?.[0]?.current_status ||
        trackingData.track_status

      const scans: IShiprocketTrackingScan[] = Array.isArray(trackObj?.scans)
        ? trackObj.scans.map((s: any) => ({
            date: s.date || '',
            status: s.status || '',
            activity: s.activity || '',
            location: s.location || '',
            srStatus: s['sr-status'] || '',
          }))
        : []

      return {
        success: true,
        awbCode: cleanAwb,
        currentStatus,
        currentStatusId: trackObj?.current_status_id,
        currentLocation: trackObj?.current_location,
        scans,
        etd: trackObj?.etd || trackingData.etd,
        message: 'Tracking data retrieved successfully.',
      }
    }

    return {
      success: false,
      awbCode: cleanAwb,
      message: data?.message || `Tracking lookup failed with HTTP ${status}.`,
    }
  } catch (err: any) {
    return {
      success: false,
      awbCode: cleanAwb,
      message: err?.message || 'Error communicating with Shiprocket tracking API.',
    }
  }
}
