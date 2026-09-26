import { API_BASE_URL } from '../config/api'

export interface BusinessRequestInput {
  name: string
  organization: string
  email: string
  phone: string
  organizationType: string
  apparelRequired?: string
  apparelTypes?: string[]
  quantity?: string
  estimatedQuantity?: string
  requiredBy?: string
  brandingRequirements?: string
  discussionTopics?: string[]
  details?: string
  projectDetails?: string
  preferredMeetingMethod?: string
  preferredMeetingTime?: string
}

export interface BackendBusinessRequest {
  requestId: string
  name: string
  organization: string
  email: string
  phone: string
  organizationType: string
  apparelRequired: string
  apparelTypes?: string[]
  quantity: string
  estimatedQuantity?: string
  requiredBy?: string
  brandingRequirements: string
  discussionTopics?: string[]
  details?: string
  projectDetails?: string
  preferredMeetingMethod?: string
  preferredMeetingTime?: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface CreateBusinessRequestResponse {
  success: boolean
  message: string
  requestId: string
  request: BackendBusinessRequest
}

/**
 * Submits business branding quote request to backend Express API (backed by MongoDB Atlas)
 */
export async function createBusinessRequest(
  payload: BusinessRequestInput
): Promise<CreateBusinessRequestResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/business-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok || !data.success) {
      const errorMessage =
        data?.message || 'Unable to submit your quote request right now. Please try again.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw new Error(
      err.message || 'Unable to submit your quote request right now. Please try again.'
    )
  }
}

/**
 * Fetches business branding quote request by requestId from backend Express API
 */
export async function fetchBusinessRequestById(
  requestId: string
): Promise<BackendBusinessRequest | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(
      `${API_BASE_URL}/business-requests/${encodeURIComponent(requestId)}`,
      {
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch quote request details (${response.status})`)
    }

    const data = await response.json()
    if (data.success && data.request) {
      return data.request
    }

    return null
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.warn(`[BusinessRequestApi] Could not fetch request ${requestId}:`, err.message)
    return null
  }
}
