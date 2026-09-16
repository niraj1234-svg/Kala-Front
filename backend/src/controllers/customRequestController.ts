import { Request, Response } from 'express'
import { CustomRequest } from '../models/CustomRequest'
import mongoose from 'mongoose'

/**
 * Generates a unique human-readable request ID:
 * Format: KALA-CUSTOM-YYYYMMDD-XXXXXX
 */
function generateCustomRequestId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePart = `${year}${month}${day}`
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-CUSTOM-${datePart}-${randomPart}`
}

// POST /api/custom-requests
export const createCustomRequest = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      apparelType,
      quantity,
      sizeRange,
      printingType,
      description,
      additionalRequirements,
      fileName,
    } = req.body

    // 1. Validate Required Fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Full name is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: A valid email address is required.',
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

    if (!apparelType || typeof apparelType !== 'string' || !apparelType.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Apparel type is required.',
      })
      return
    }

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Quantity must be a positive integer of at least 1.',
      })
      return
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid request: Design description is required.',
      })
      return
    }

    // 2. Generate Unique Request ID
    let requestId = generateCustomRequestId()
    let existing = await CustomRequest.findOne({ requestId })
    while (existing) {
      requestId = generateCustomRequestId()
      existing = await CustomRequest.findOne({ requestId })
    }

    // 3. Create Document in MongoDB
    const newRequest = await CustomRequest.create({
      requestId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      apparelType: apparelType.trim(),
      quantity: qty,
      sizeRange: typeof sizeRange === 'string' && sizeRange.trim() ? sizeRange.trim() : 'Mixed Sizes (S–XXL)',
      printingType: typeof printingType === 'string' && printingType.trim() ? printingType.trim() : 'Screen Printing',
      description: description.trim(),
      additionalRequirements: typeof additionalRequirements === 'string' ? additionalRequirements.trim() : '',
      fileName: typeof fileName === 'string' ? fileName.trim() : '',
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Custom apparel request submitted successfully',
      requestId: newRequest.requestId,
      request: newRequest,
    })
  } catch (error: any) {
    console.error('[CustomRequestController] createCustomRequest error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while processing custom apparel request',
      error: error.message,
    })
  }
}

// GET /api/custom-requests/:requestId
export const getCustomRequestById = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid requestId parameter',
      })
      return
    }

    let customRequest = await CustomRequest.findOne({ requestId })

    // Fallback if Mongo _id was passed
    if (!customRequest && mongoose.Types.ObjectId.isValid(requestId)) {
      customRequest = await CustomRequest.findById(requestId)
    }

    if (!customRequest) {
      res.status(404).json({
        success: false,
        message: 'Custom apparel request not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      request: customRequest,
    })
  } catch (error: any) {
    console.error('[CustomRequestController] getCustomRequestById error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving custom apparel request',
      error: error.message,
    })
  }
}
