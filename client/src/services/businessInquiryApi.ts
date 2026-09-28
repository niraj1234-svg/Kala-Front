import { API_BASE_URL } from '../config/api'
import { BUSINESS_CONFIG } from '../data/businessSlots'

export interface BusinessInquiryPayload {
  name: string
  mobile: string
  email?: string
  organization?: string
  apparelCategory: string
  color: string
  customization: string
  approxQuantity?: string
  requirement: string
  contactMethod: 'In-Person Meeting' | 'Google Meet' | 'Call' | 'WhatsApp'
  meetingDate?: string
  meetingTime?: string
  meetingLocation?: string
  artworkData?: string
}

export interface BusinessInquiryResponse {
  success: boolean
  message: string
  requestId?: string
  request?: any
}

export interface BookedSlotItem {
  contactMethod: string
  meetingDate: string
  meetingTime: string
}

/**
 * Submits customer business inquiry to Express / MongoDB backend.
 */
export async function submitBusinessInquiry(
  payload: BusinessInquiryPayload
): Promise<BusinessInquiryResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 9000)

  try {
    const response = await fetch(`${API_BASE_URL}/business-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.mobile,
        mobile: payload.mobile,
        email: payload.email,
        organization: payload.organization || 'Team / Individual',
        apparelCategory: payload.apparelCategory,
        apparelTypes: [payload.apparelCategory],
        color: payload.color,
        customization: payload.customization,
        brandingRequirements: payload.customization,
        approxQuantity: payload.approxQuantity || '50',
        quantity: payload.approxQuantity || '50',
        requirement: payload.requirement,
        projectDetails: payload.requirement,
        contactMethod: payload.contactMethod,
        preferredMeetingMethod: payload.contactMethod,
        meetingDate: payload.meetingDate,
        meetingTime: payload.meetingTime,
        preferredMeetingTime: payload.meetingTime,
        meetingLocation: payload.meetingLocation,
        artworkData: payload.artworkData,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data?.message || 'Unable to submit your request. Please try again.')
    }

    return data
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet connection and try again.')
    }
    throw new Error(err.message || 'Unable to submit your request. Please try again.')
  }
}

/**
 * Fetches already booked time slots from backend to prevent double-booking.
 */
export async function fetchBookedSlots(
  method?: string,
  date?: string
): Promise<BookedSlotItem[]> {
  try {
    const params = new URLSearchParams()
    if (method) params.append('method', method)
    if (date) params.append('date', date)

    const response = await fetch(`${API_BASE_URL}/business-requests/booked-slots?${params.toString()}`)
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data.bookedSlots) ? data.bookedSlots : []
  } catch {
    return []
  }
}

/**
 * Generates an official pre-filled WhatsApp link using the configured KALA number.
 */
export function generateWhatsAppInquiryUrl(params: {
  name?: string
  apparelCategory: string
  color?: string
  customization?: string
  approxQuantity?: string
  requirement?: string
}): string {
  const parts: string[] = []

  if (params.name && params.name.trim()) {
    parts.push(`Hello KALA, my name is ${params.name.trim()}.`)
  } else {
    parts.push('Hello KALA,')
  }

  parts.push(`I am interested in custom apparel for my team.`)
  parts.push(`• Category: ${params.apparelCategory}`)

  if (params.approxQuantity && params.approxQuantity.trim()) {
    parts.push(`• Approximate Quantity: ${params.approxQuantity.trim()} pcs`)
  }

  if (params.color && params.color.trim()) {
    parts.push(`• Preferred Color: ${params.color.trim()}`)
  }

  if (params.customization && params.customization.trim()) {
    parts.push(`• Customization: ${params.customization.trim()}`)
  }

  if (params.requirement && params.requirement.trim()) {
    parts.push(`• Requirement: ${params.requirement.trim()}`)
  } else {
    parts.push(`I would like to discuss a bulk order for ${params.apparelCategory}.`)
  }

  const messageText = parts.join('\n')
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(messageText)}`
}
