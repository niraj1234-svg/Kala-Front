import { API_BASE_URL } from '../config/api'
import { getAuthToken } from './authApi'

export interface DesignathonRegistrationPayload {
  fullName: string
  email: string
  whatsappNumber: string
  collegeName: string
  department: string
  currentYearSemester: string
  refundPolicyAcknowledged: boolean
  termsAcknowledged: boolean
}

export interface RegisterDesignathonResponse {
  success: boolean
  message: string
  registrationId?: string
  status?: string
  fee?: number
  currency?: string
  errors?: Record<string, string>
  alreadyConfirmed?: boolean
}

export interface CreateDesignathonOrderResponse {
  success: boolean
  order_id?: string
  amount?: number
  currency?: string
  receipt?: string
  key_id?: string
  registrationId?: string
  participantName?: string
  email?: string
  phone?: string
  message?: string
  alreadyConfirmed?: boolean
}

export interface VerifyDesignathonPaymentPayload {
  registrationId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface VerifyDesignathonPaymentResponse {
  success: boolean
  message: string
  registrationId?: string
  status?: string
  paymentStatus?: string
  participantName?: string
  email?: string
}

export interface DesignathonPublicStatusResponse {
  success: boolean
  registration?: {
    registrationId: string
    fullName: string
    collegeName: string
    department: string
    currentYearSemester: string
    registrationStatus: string
    paymentStatus: string
    emailStatus: string
    feeRupees: number
    eventDate: string
    createdAt: string
    paymentVerifiedAt?: string
  }
  message?: string
}

export interface AdminDesignathonListParams {
  page?: number
  limit?: number
  search?: string
  registrationStatus?: string
  paymentStatus?: string
  emailStatus?: string
  startDate?: string
  endDate?: string
}

export interface AdminDesignathonListResponse {
  success: boolean
  registrations: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metrics: {
    totalRegistrations: number
    confirmedCount: number
    paidCount: number
    pendingPaymentCount: number
    verifiedRevenue: number
  }
  message?: string
}

/**
 * Helper to build auth headers for admin or user endpoints
 */
function getHeaders(isJson = true): Record<string, string> {
  const headers: Record<string, string> = {}
  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * GET /api/designathon/config
 */
export async function fetchDesignathonConfig() {
  const response = await fetch(`${API_BASE_URL}/designathon/config`)
  return response.json()
}

/**
 * POST /api/designathon/register
 */
export async function registerForDesignathon(
  payload: DesignathonRegistrationPayload
): Promise<RegisterDesignathonResponse> {
  const response = await fetch(`${API_BASE_URL}/designathon/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok && !data.errors) {
    throw new Error(data.message || 'Registration failed. Please check your entries.')
  }
  return data
}

/**
 * POST /api/designathon/create-order
 */
export async function createDesignathonOrder(
  registrationId: string
): Promise<CreateDesignathonOrderResponse> {
  const response = await fetch(`${API_BASE_URL}/designathon/create-order`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ registrationId }),
  })

  const data = await response.json()
  if (!response.ok || !data.order_id) {
    throw new Error(data.message || 'Failed to initiate Razorpay order.')
  }
  return data
}

/**
 * POST /api/designathon/verify-payment
 */
export async function verifyDesignathonPayment(
  payload: VerifyDesignathonPaymentPayload
): Promise<VerifyDesignathonPaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/designathon/verify-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Payment signature verification failed.')
  }
  return data
}

/**
 * GET /api/designathon/status/:registrationId
 */
export async function fetchRegistrationStatus(
  registrationId: string
): Promise<DesignathonPublicStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/designathon/status/${encodeURIComponent(registrationId)}`)
  return response.json()
}

// ---------------------------------------------------------------------------
// ADMIN ENDPOINTS
// ---------------------------------------------------------------------------

/**
 * GET /api/admin/designathon/registrations
 */
export async function fetchAdminRegistrations(
  params: AdminDesignathonListParams = {}
): Promise<AdminDesignathonListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.registrationStatus) query.set('registrationStatus', params.registrationStatus)
  if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus)
  if (params.emailStatus) query.set('emailStatus', params.emailStatus)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)

  const response = await fetch(`${API_BASE_URL}/admin/designathon/registrations?${query.toString()}`, {
    headers: getHeaders(),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch registrations.')
  }
  return data
}

/**
 * GET /api/admin/designathon/registrations/:registrationId
 */
export async function fetchAdminRegistrationById(registrationId: string) {
  const response = await fetch(
    `${API_BASE_URL}/admin/designathon/registrations/${encodeURIComponent(registrationId)}`,
    {
      headers: getHeaders(),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch registration details.')
  }
  return data
}

/**
 * POST /api/admin/designathon/registrations/:registrationId/retry-email
 */
export async function retryAdminEmail(registrationId: string) {
  const response = await fetch(
    `${API_BASE_URL}/admin/designathon/registrations/${encodeURIComponent(registrationId)}/retry-email`,
    {
      method: 'POST',
      headers: getHeaders(),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retry confirmation email.')
  }
  return data
}

/**
 * Returns URL for CSV export with current admin token
 */
export function getAdminDesignathonExportCsvUrl(): string {
  return `${API_BASE_URL}/admin/designathon/export-csv`
}

/**
 * Downloads CSV securely with admin authorization
 */
export async function downloadAdminDesignathonCsv(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/designathon/export-csv`, {
    headers: getHeaders(false),
  })

  if (!response.ok) {
    throw new Error('Failed to download CSV export.')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kala-designathon-registrations-${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * GET /api/admin/designathon/settings
 */
export async function fetchAdminDesignathonSettings() {
  const response = await fetch(`${API_BASE_URL}/admin/designathon/settings`, {
    headers: getHeaders(),
  })
  return response.json()
}

/**
 * PATCH /api/admin/designathon/settings
 */
export async function updateAdminDesignathonSettings(payload: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}/admin/designathon/settings`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update event settings.')
  }
  return data
}
