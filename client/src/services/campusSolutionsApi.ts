import { API_BASE_URL } from '../config/api'

export interface CampusCorporateQuoteInput {
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  organizationType: string
  servicesRequired: string[]
  approxQuantity: string
  requiredDeliveryDate: string
  deliveryCity: string
  logoFile?: {
    name: string
    dataUrl?: string
    size?: number
  } | null
  additionalRequirements?: string
}

export interface CampusCorporateQuoteResponse {
  success: boolean
  message: string
  requestId: string
  request?: any
}

/**
 * Submits Campus & Corporate Solutions quote request to the backend Express API.
 * Uses the existing /api/business-requests endpoint backed by MongoDB Atlas.
 */
export async function submitCampusCorporateQuote(
  input: CampusCorporateQuoteInput
): Promise<CampusCorporateQuoteResponse> {
  // Input validations before making network call
  if (!input.organizationName?.trim()) {
    throw new Error('Organization / Institution name is required.')
  }
  if (!input.contactPerson?.trim()) {
    throw new Error("Contact person's name is required.")
  }
  if (!input.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    throw new Error('A valid email address is required.')
  }
  const cleanPhone = input.phone?.trim()
  if (!cleanPhone || !/^[0-9+\s-]{7,15}$/.test(cleanPhone)) {
    throw new Error('A valid contact phone number (7–15 digits) is required.')
  }
  if (!input.organizationType?.trim()) {
    throw new Error('Please select an organization type.')
  }
  if (!input.servicesRequired || input.servicesRequired.length === 0) {
    throw new Error('Please select at least one required service.')
  }
  if (!input.approxQuantity?.trim()) {
    throw new Error('Please specify an approximate quantity.')
  }
  if (!input.requiredDeliveryDate?.trim()) {
    throw new Error('Target delivery date is required.')
  }
  if (!input.deliveryCity?.trim()) {
    throw new Error('Delivery city is required.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  const formattedDetails = [
    `Delivery City: ${input.deliveryCity.trim()}`,
    `Organization Type: ${input.organizationType.trim()}`,
    `Services: ${input.servicesRequired.join(', ')}`,
    input.additionalRequirements?.trim()
      ? `Additional Notes: ${input.additionalRequirements.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const payload = {
    name: input.contactPerson.trim(),
    organization: input.organizationName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: cleanPhone,
    mobile: cleanPhone,
    organizationType: input.organizationType.trim(),
    apparelCategory: input.servicesRequired[0] || 'Campus & Corporate Solutions',
    apparelTypes: input.servicesRequired,
    apparelRequired: input.servicesRequired.join(', '),
    quantity: input.approxQuantity.trim(),
    approxQuantity: input.approxQuantity.trim(),
    estimatedQuantity: input.approxQuantity.trim(),
    requiredBy: input.requiredDeliveryDate.trim(),
    brandingRequirements: input.servicesRequired.join(', '),
    details: formattedDetails,
    projectDetails: formattedDetails,
    requirement: formattedDetails,
    artworkData: input.logoFile?.dataUrl || undefined,
    bulkOrderDetails: {
      source: 'campus-corporate-solutions',
      organizationType: input.organizationType.trim(),
      services: input.servicesRequired,
      approxQuantity: input.approxQuantity.trim(),
      deliveryCity: input.deliveryCity.trim(),
      requiredDeliveryDate: input.requiredDeliveryDate.trim(),
      logoFileName: input.logoFile?.name || null,
      additionalRequirements: input.additionalRequirements?.trim() || null,
    },
  }

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
      const errMsg =
        data?.message || 'Server was unable to process your quote request. Please try again.'
      throw new Error(errMsg)
    }

    return {
      success: true,
      message: data.message || 'Quote request received successfully.',
      requestId: data.requestId,
      request: data.request,
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet connection and try again.')
    }
    throw new Error(err.message || 'Unable to submit your quote request. Please try again.')
  }
}
