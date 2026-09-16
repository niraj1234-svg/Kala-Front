const API_BASE_URL = 'http://localhost:5000/api'

export interface CustomRequestInput {
  name: string
  email: string
  phone: string
  apparelType: string
  quantity: number
  sizeRange: string
  printingType: string
  description: string
  additionalRequirements?: string
  fileName?: string
}

export interface BackendCustomRequest {
  requestId: string
  name: string
  email: string
  phone: string
  apparelType: string
  quantity: number
  sizeRange: string
  printingType: string
  description: string
  additionalRequirements?: string
  fileName?: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface CreateCustomRequestResponse {
  success: boolean
  message: string
  requestId: string
  request: BackendCustomRequest
}

/**
 * Submits custom apparel request to backend Express API (backed by MongoDB Atlas)
 */
export async function createCustomRequest(
  payload: CustomRequestInput
): Promise<CreateCustomRequestResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`${API_BASE_URL}/custom-requests`, {
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
        data?.message || 'Unable to submit your custom request right now. Please try again.'
      throw new Error(errorMessage)
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    // Clean user-friendly message, no leaked secrets or raw Mongo errors
    throw new Error(
      err.message || 'Unable to submit your custom request right now. Please try again.'
    )
  }
}

/**
 * Fetches custom apparel request by requestId from backend Express API
 */
export async function fetchCustomRequestById(
  requestId: string
): Promise<BackendCustomRequest | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(
      `${API_BASE_URL}/custom-requests/${encodeURIComponent(requestId)}`,
      {
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch custom request details (${response.status})`)
    }

    const data = await response.json()
    if (data.success && data.request) {
      return data.request
    }

    return null
  } catch (err: any) {
    clearTimeout(timeoutId)
    console.warn(`[CustomRequestApi] Could not fetch request ${requestId}:`, err.message)
    return null
  }
}
