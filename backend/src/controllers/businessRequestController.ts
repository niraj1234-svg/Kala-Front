import { Request, Response } from 'express'
import { BusinessRequest } from '../models/BusinessRequest'
import { sendBusinessRequestAlert } from '../services/notificationService'
import mongoose from 'mongoose'

/**
 * Generates a unique human-readable request ID:
 * Format: KALA-BUSINESS-YYYYMMDD-XXXXXX
 */
function generateBusinessRequestId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePart = `${year}${month}${day}`
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-BUSINESS-${datePart}-${randomPart}`
}

// POST /api/business-requests
export const createBusinessRequest = async (req: Request, res: Response) => {
  try {
    const {
      name,
      organization,
      email,
      phone,
      mobile,
      organizationType,
      apparelTypes,
      apparelRequired,
      apparelCategory,
      color,
      customization,
      approxQuantity,
      requirement,
      artworkData,
      contactMethod,
      meetingDate,
      meetingTime,
      meetingLocation,
      estimatedQuantity,
      quantity,
      discussionTopics,
      brandingRequirements,
      projectDetails,
      details,
      preferredMeetingMethod,
      preferredMeetingTime,
      requiredBy,
      bulkOrderDetails,
    } = req.body

    const resolvedPhone = ((mobile || phone) as string | undefined)?.trim()
    const resolvedContactMethod = (contactMethod || preferredMeetingMethod || 'Phone Call').trim()

    // 1. Validate Required Fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Contact person name is required.',
      })
      return
    }

    const isCallRequest = resolvedContactMethod.toLowerCase().includes('call')

    // Organization is required unless it's a direct phone callback request where customer might be an individual
    const resolvedOrganization = (organization && typeof organization === 'string' && organization.trim())
      ? organization.trim()
      : isCallRequest ? 'Team / Individual' : ''

    if (!resolvedOrganization) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Company, college, or team name is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    let resolvedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : ''
    if (!isCallRequest && (!resolvedEmail || !emailRegex.test(resolvedEmail))) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: A valid contact email is required.',
      })
      return
    } else if (isCallRequest && !resolvedEmail) {
      resolvedEmail = `${resolvedPhone?.replace(/[^0-9]/g, '') || 'inquiry'}@call.kala.internal`
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!resolvedPhone || !phoneRegex.test(resolvedPhone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: A valid mobile number (7-15 digits) is required.',
      })
      return
    }

    // Resolve apparel category
    const resolvedApparelTypes: string[] = Array.isArray(apparelTypes) && apparelTypes.length > 0
      ? apparelTypes.filter((t: any) => typeof t === 'string' && t.trim())
      : typeof apparelCategory === 'string' && apparelCategory.trim()
      ? [apparelCategory.trim()]
      : typeof apparelRequired === 'string' && apparelRequired.trim()
      ? [apparelRequired.trim()]
      : ['T-Shirts']

    const resolvedApparelRequired = resolvedApparelTypes.join(', ')
    const resolvedQuantity =
      (typeof approxQuantity === 'string' && approxQuantity.trim()) ||
      (typeof estimatedQuantity === 'string' && estimatedQuantity.trim()) ||
      (typeof quantity === 'string' && quantity.trim()) ||
      '50'

    const resolvedBranding =
      (typeof customization === 'string' && customization.trim()) ||
      (Array.isArray(discussionTopics) && discussionTopics.length > 0 ? discussionTopics.join(', ') : '') ||
      (typeof brandingRequirements === 'string' && brandingRequirements.trim()) ||
      'Custom Print'

    const resolvedDetails =
      (typeof requirement === 'string' && requirement.trim()) ||
      (typeof projectDetails === 'string' && projectDetails.trim()) ||
      (typeof details === 'string' && details.trim()) ||
      ''

    const resolvedMeetingTime =
      (typeof meetingTime === 'string' && meetingTime.trim()) ||
      (typeof preferredMeetingTime === 'string' && preferredMeetingTime.trim()) ||
      'Anytime'

    const resolvedMeetingDate =
      (typeof meetingDate === 'string' && meetingDate.trim()) || ''

    // Prevent double booking for scheduled meetings and calls
    if (resolvedMeetingDate && resolvedMeetingTime && resolvedMeetingTime !== 'Anytime') {
      const existingSlot = await BusinessRequest.findOne({
        contactMethod: resolvedContactMethod,
        meetingDate: resolvedMeetingDate,
        meetingTime: resolvedMeetingTime,
        status: { $in: ['pending', 'confirmed'] },
      })

      if (existingSlot) {
        res.status(409).json({
          success: false,
          message: 'The selected time slot has already been booked. Please choose an alternate slot or chat with us on WhatsApp.',
        })
        return
      }
    }

    // 2. Generate Unique Backend Request ID
    let requestId = generateBusinessRequestId()
    let existing = await BusinessRequest.findOne({ requestId })
    while (existing) {
      requestId = generateBusinessRequestId()
      existing = await BusinessRequest.findOne({ requestId })
    }

    // 3. Create Document in MongoDB
    const newRequest = await BusinessRequest.create({
      requestId,
      name: name.trim(),
      organization: resolvedOrganization,
      email: resolvedEmail,
      phone: resolvedPhone,
      organizationType:
        typeof organizationType === 'string' && organizationType.trim()
          ? organizationType.trim()
          : 'Company',
      apparelRequired: resolvedApparelRequired,
      apparelTypes: resolvedApparelTypes,
      quantity: resolvedQuantity,
      estimatedQuantity: resolvedQuantity,
      requiredBy: requiredBy ? String(requiredBy).trim() : 'To be discussed',
      brandingRequirements: resolvedBranding,
      discussionTopics: Array.isArray(discussionTopics) ? discussionTopics : [resolvedBranding],
      details: resolvedDetails,
      projectDetails: resolvedDetails,
      preferredMeetingMethod: resolvedContactMethod,
      preferredMeetingTime: resolvedMeetingTime,
      contactMethod: resolvedContactMethod,
      meetingDate: resolvedMeetingDate,
      meetingTime: resolvedMeetingTime,
      meetingLocation: meetingLocation ? String(meetingLocation).trim() : (resolvedContactMethod.includes('Bilaspur') || resolvedContactMethod.includes('In-Person') ? 'Bilaspur, Chhattisgarh' : undefined),
      apparelCategory: resolvedApparelTypes[0] || 'T-Shirts',
      color: color ? String(color).trim() : 'Black',
      customization: resolvedBranding,
      approxQuantity: resolvedQuantity,
      requirement: resolvedDetails,
      artworkData: artworkData ? String(artworkData) : undefined,
      bulkOrderDetails:
        bulkOrderDetails && typeof bulkOrderDetails === 'object'
          ? bulkOrderDetails
          : undefined,
      status: resolvedMeetingDate ? 'confirmed' : 'pending',
    })

    // Dispatch email alert to admin dhoreniraj83@gmail.com
    sendBusinessRequestAlert(newRequest).catch((alertErr) => {
      console.error('[BusinessRequestController] Failed to send business request alert to admin:', alertErr)
    })

    res.status(201).json({
      success: true,
      message: 'Your business request has been received successfully.',
      requestId: newRequest.requestId,
      request: newRequest,
    })
  } catch (error: any) {
    console.error('[BusinessRequestController] createBusinessRequest error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while processing business branding request',
    })
  }
}

// GET /api/business-requests/booked-slots
export const getBookedSlots = async (req: Request, res: Response) => {
  try {
    const { method, date } = req.query
    const query: any = {
      status: { $in: ['pending', 'confirmed'] },
      meetingDate: { $exists: true, $ne: '' },
      meetingTime: { $exists: true, $ne: '' },
    }
    if (method && typeof method === 'string') {
      query.contactMethod = method.trim()
    }
    if (date && typeof date === 'string') {
      query.meetingDate = date.trim()
    }

    const bookings = await BusinessRequest.find(query).select(
      'contactMethod meetingDate meetingTime status'
    )
    res.status(200).json({
      success: true,
      bookedSlots: bookings.map((b) => ({
        contactMethod: b.contactMethod,
        meetingDate: b.meetingDate,
        meetingTime: b.meetingTime,
      })),
    })
  } catch (error: any) {
    console.error('[BusinessRequestController] getBookedSlots error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving booked slots',
    })
  }
}

// GET /api/business-requests/:requestId
export const getBusinessRequestById = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid requestId parameter',
      })
      return
    }

    let businessRequest = await BusinessRequest.findOne({ requestId })

    // Fallback if Mongo _id was passed
    if (!businessRequest && mongoose.Types.ObjectId.isValid(requestId)) {
      businessRequest = await BusinessRequest.findById(requestId)
    }

    if (!businessRequest) {
      res.status(404).json({
        success: false,
        message: 'Business branding request not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      request: businessRequest,
    })
  } catch (error: any) {
    console.error('[BusinessRequestController] getBusinessRequestById error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving business branding request',
    })
  }
}
