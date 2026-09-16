import { Request, Response } from 'express'
import { BusinessRequest } from '../models/BusinessRequest'
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
      organizationType,
      apparelRequired,
      quantity,
      requiredBy,
      brandingRequirements,
      details,
    } = req.body

    // 1. Validate Required Fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Contact person name is required.',
      })
      return
    }

    if (!organization || typeof organization !== 'string' || !organization.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Company or organization name is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: A valid work or contact email is required.',
      })
      return
    }

    const phoneRegex = /^[0-9+\s-]{7,15}$/
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: A valid phone number (7-15 digits) is required.',
      })
      return
    }

    if (!requiredBy || typeof requiredBy !== 'string' || !requiredBy.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Target delivery deadline is required.',
      })
      return
    }

    if (!quantity || typeof quantity !== 'string' || !quantity.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Estimated quantity is required.',
      })
      return
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
      organization: organization.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organizationType:
        typeof organizationType === 'string' && organizationType.trim()
          ? organizationType.trim()
          : 'Company',
      apparelRequired:
        typeof apparelRequired === 'string' && apparelRequired.trim()
          ? apparelRequired.trim()
          : 'T-Shirts',
      quantity: quantity.trim(),
      requiredBy: requiredBy.trim(),
      brandingRequirements:
        typeof brandingRequirements === 'string' && brandingRequirements.trim()
          ? brandingRequirements.trim()
          : 'Logo',
      details: typeof details === 'string' ? details.trim() : '',
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Business branding request submitted successfully',
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
