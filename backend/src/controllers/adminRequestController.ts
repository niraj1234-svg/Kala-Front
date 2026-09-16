import { Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import {
  CustomRequest,
  ICustomRequest,
  CustomRequestStatus,
} from '../models/CustomRequest'
import {
  BusinessRequest,
  IBusinessRequest,
  BusinessRequestStatus,
} from '../models/BusinessRequest'

const ALLOWED_CUSTOM_REQUEST_STATUSES: CustomRequestStatus[] = [
  'pending',
  'contacted',
  'quoted',
  'approved',
  'completed',
  'cancelled',
]

const ALLOWED_BUSINESS_REQUEST_STATUSES: BusinessRequestStatus[] = [
  'pending',
  'contacted',
  'quoted',
  'approved',
  'completed',
  'cancelled',
]

// =========================================================================
// CUSTOM APPAREL REQUESTS (ADMIN)
// =========================================================================

/**
 * GET /api/admin/custom-requests
 * Retrieves custom apparel requests with pagination, status filter, and search.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminCustomRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : ''
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const filter: FilterQuery<ICustomRequest> = {}

    if (statusQuery && ALLOWED_CUSTOM_REQUEST_STATUSES.includes(statusQuery as CustomRequestStatus)) {
      filter.status = statusQuery as CustomRequestStatus
    }

    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { requestId: regex },
        { name: regex },
        { email: regex },
        { phone: regex },
        { apparelType: regex },
      ]
    }

    const [total, requests] = await Promise.all([
      CustomRequest.countDocuments(filter),
      CustomRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] getAdminCustomRequests error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving custom requests.',
    })
  }
}

/**
 * GET /api/admin/custom-requests/:requestId
 * Retrieves custom apparel request details by requestId.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminCustomRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Request ID is required.',
      })
      return
    }

    const request = await CustomRequest.findOne({ requestId: requestId.trim() })

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Custom request not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      request,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] getAdminCustomRequestById error:',
      error instanceof Error ? error.message : 'Unknown lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving custom request details.',
    })
  }
}

/**
 * PATCH /api/admin/custom-requests/:requestId/status
 * Updates the lifecycle status of a custom apparel request.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminCustomRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params
    const { status } = req.body

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Request ID is required.',
      })
      return
    }

    if (!status || typeof status !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Status is required.',
      })
      return
    }

    const normalizedStatus = status.trim().toLowerCase()
    if (!ALLOWED_CUSTOM_REQUEST_STATUSES.includes(normalizedStatus as CustomRequestStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid custom request status. Allowed values: ${ALLOWED_CUSTOM_REQUEST_STATUSES.join(', ')}`,
      })
      return
    }

    const updated = await CustomRequest.findOneAndUpdate(
      { requestId: requestId.trim() },
      { $set: { status: normalizedStatus as CustomRequestStatus } },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Custom request not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Custom request status updated successfully.',
      request: updated,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] updateAdminCustomRequestStatus error:',
      error instanceof Error ? error.message : 'Unknown status update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating custom request status.',
    })
  }
}

// =========================================================================
// BUSINESS BRANDING REQUESTS (ADMIN)
// =========================================================================

/**
 * GET /api/admin/business-requests
 * Retrieves business branding quote requests with pagination, status filter, and search.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminBusinessRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : ''
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const filter: FilterQuery<IBusinessRequest> = {}

    if (statusQuery && ALLOWED_BUSINESS_REQUEST_STATUSES.includes(statusQuery as BusinessRequestStatus)) {
      filter.status = statusQuery as BusinessRequestStatus
    }

    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { requestId: regex },
        { name: regex },
        { organization: regex },
        { email: regex },
        { phone: regex },
      ]
    }

    const [total, requests] = await Promise.all([
      BusinessRequest.countDocuments(filter),
      BusinessRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] getAdminBusinessRequests error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving business requests.',
    })
  }
}

/**
 * GET /api/admin/business-requests/:requestId
 * Retrieves business branding quote request details by requestId.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminBusinessRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Request ID is required.',
      })
      return
    }

    const request = await BusinessRequest.findOne({ requestId: requestId.trim() })

    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Business request not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      request,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] getAdminBusinessRequestById error:',
      error instanceof Error ? error.message : 'Unknown lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving business request details.',
    })
  }
}

/**
 * PATCH /api/admin/business-requests/:requestId/status
 * Updates the lifecycle status of a business quote request.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminBusinessRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params
    const { status } = req.body

    if (!requestId || typeof requestId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Request ID is required.',
      })
      return
    }

    if (!status || typeof status !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Status is required.',
      })
      return
    }

    const normalizedStatus = status.trim().toLowerCase()
    if (!ALLOWED_BUSINESS_REQUEST_STATUSES.includes(normalizedStatus as BusinessRequestStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid business request status. Allowed values: ${ALLOWED_BUSINESS_REQUEST_STATUSES.join(', ')}`,
      })
      return
    }

    const updated = await BusinessRequest.findOneAndUpdate(
      { requestId: requestId.trim() },
      { $set: { status: normalizedStatus as BusinessRequestStatus } },
      { new: true }
    )

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Business request not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Business request status updated successfully.',
      request: updated,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminRequestController] updateAdminBusinessRequestStatus error:',
      error instanceof Error ? error.message : 'Unknown status update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating business request status.',
    })
  }
}
