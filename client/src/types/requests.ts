export interface CustomApparelRequest {
  id: string
  createdAt: string
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
  status: 'Request Submitted'
}

export interface BusinessQuoteRequest {
  id: string
  createdAt: string
  name: string
  organization: string
  email: string
  phone: string
  organizationType: string
  apparelRequired: string
  quantity: string
  requiredBy?: string
  brandingRequirements: string
  details?: string
  apparelTypes?: string[]
  discussionTopics?: string[]
  preferredMeetingMethod?: string
  preferredMeetingTime?: string
  status: 'Quote Requested' | 'Meeting Requested'
}

const CUSTOM_REQUESTS_KEY = 'kala_custom_requests'
const BUSINESS_REQUESTS_KEY = 'kala_business_requests'

export function getCustomRequests(): CustomApparelRequest[] {
  try {
    const data = localStorage.getItem(CUSTOM_REQUESTS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.error('Failed to get custom requests from localStorage:', err)
  }
  return []
}

export function saveCustomRequest(req: CustomApparelRequest): void {
  try {
    const existing = getCustomRequests()
    localStorage.setItem(CUSTOM_REQUESTS_KEY, JSON.stringify([req, ...existing]))
  } catch (err) {
    console.error('Failed to save custom request to localStorage:', err)
  }
}

export function generateCustomRequestId(): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-CUSTOM-${code}`
}

export function getBusinessRequests(): BusinessQuoteRequest[] {
  try {
    const data = localStorage.getItem(BUSINESS_REQUESTS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.error('Failed to get business requests from localStorage:', err)
  }
  return []
}

export function saveBusinessRequest(req: BusinessQuoteRequest): void {
  try {
    const existing = getBusinessRequests()
    localStorage.setItem(BUSINESS_REQUESTS_KEY, JSON.stringify([req, ...existing]))
  } catch (err) {
    console.error('Failed to save business request to localStorage:', err)
  }
}

export function generateBusinessRequestId(): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-BUSINESS-${code}`
}
