import { Request, Response } from 'express'
import mongoose, { FilterQuery } from 'mongoose'
import {
  Coupon,
  ICoupon,
  calculateCouponStatus,
  COUPON_CODE_REGEX,
  DiscountType,
  CouponStatus,
} from '../models/Coupon'

const ALLOWED_UPDATE_FIELDS = new Set([
  'description',
  'discountType',
  'discountValue',
  'minimumOrderValue',
  'maximumDiscount',
  'startDate',
  'expiryDate',
  'usageLimit',
  'perCustomerLimit',
  'active',
])

/**
 * Checks whether any object key contains MongoDB operator injection characters ($ or .)
 */
function hasOperatorInjection(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) return true
    const val = (obj as Record<string, unknown>)[key]
    if (val && typeof val === 'object' && hasOperatorInjection(val)) return true
  }
  return false
}

/**
 * POST /api/admin/coupons
 * Creates a new promotional coupon.
 * Protected by requireAuth and requireAdmin.
 */
export const createCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (hasOperatorInjection(req.body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request payload format.',
      })
      return
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      startDate,
      expiryDate,
      usageLimit,
      perCustomerLimit,
      active,
    } = req.body

    // 1. Validate code format
    if (!code || typeof code !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Coupon code is required.',
      })
      return
    }

    const cleanCode = code.trim().toUpperCase()
    if (!COUPON_CODE_REGEX.test(cleanCode)) {
      res.status(400).json({
        success: false,
        message:
          'Coupon code must be 3-30 uppercase alphanumeric characters, hyphens, or underscores.',
      })
      return
    }

    // 2. Check code uniqueness
    const existing = await Coupon.findOne({ code: cleanCode })
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A coupon with this code already exists.',
      })
      return
    }

    // 3. Validate discountType and discountValue
    if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
      res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "fixed".',
      })
      return
    }

    const numValue = Number(discountValue)
    if (isNaN(numValue)) {
      res.status(400).json({
        success: false,
        message: 'Discount value must be a valid number.',
      })
      return
    }

    if (discountType === 'percentage' && (numValue <= 0 || numValue > 100)) {
      res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 1 and 100.',
      })
      return
    }

    if (discountType === 'fixed' && numValue <= 0) {
      res.status(400).json({
        success: false,
        message: 'Fixed discount value must be greater than 0.',
      })
      return
    }

    // 4. Validate dates
    if (!startDate || !expiryDate) {
      res.status(400).json({
        success: false,
        message: 'Both start date and expiry date are required.',
      })
      return
    }

    const parsedStart = new Date(startDate)
    const parsedExpiry = new Date(expiryDate)

    if (isNaN(parsedStart.getTime()) || isNaN(parsedExpiry.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format provided for start or expiry date.',
      })
      return
    }

    if (parsedStart >= parsedExpiry) {
      res.status(400).json({
        success: false,
        message: 'Expiry date must be after start date.',
      })
      return
    }

    // 5. Validate optional numerical limits
    const cleanMinOrder =
      minimumOrderValue !== undefined && minimumOrderValue !== null
        ? Math.max(0, Number(minimumOrderValue))
        : 0

    const cleanMaxDiscount =
      discountType === 'percentage' &&
      maximumDiscount !== undefined &&
      maximumDiscount !== null &&
      maximumDiscount !== ''
        ? Math.max(0, Number(maximumDiscount))
        : null

    const cleanUsageLimit =
      usageLimit !== undefined && usageLimit !== null && usageLimit !== ''
        ? Math.max(1, Math.floor(Number(usageLimit)))
        : null

    const cleanPerCustomerLimit =
      perCustomerLimit !== undefined &&
      perCustomerLimit !== null &&
      perCustomerLimit !== ''
        ? Math.max(1, Math.floor(Number(perCustomerLimit)))
        : null

    // 6. Instantiate coupon (usageCount strictly initialized server-side)
    const coupon = new Coupon({
      code: cleanCode,
      description: typeof description === 'string' ? description.trim() : '',
      discountType: discountType as DiscountType,
      discountValue: numValue,
      minimumOrderValue: isNaN(cleanMinOrder) ? 0 : cleanMinOrder,
      maximumDiscount:
        cleanMaxDiscount !== null && !isNaN(cleanMaxDiscount)
          ? cleanMaxDiscount
          : null,
      startDate: parsedStart,
      expiryDate: parsedExpiry,
      usageLimit:
        cleanUsageLimit !== null && !isNaN(cleanUsageLimit)
          ? cleanUsageLimit
          : null,
      perCustomerLimit:
        cleanPerCustomerLimit !== null && !isNaN(cleanPerCustomerLimit)
          ? cleanPerCustomerLimit
          : null,
      usageCount: 0,
      active: active !== undefined ? Boolean(active) : true,
    })

    await coupon.save()

    const couponObj = coupon.toObject()
    const status = calculateCouponStatus(couponObj)

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon: {
        ...couponObj,
        status,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCouponController] createCoupon error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while creating coupon.',
    })
  }
}

/**
 * GET /api/admin/coupons
 * Retrieves paginated promotional coupons with search and filtering.
 * Protected by requireAuth and requireAdmin.
 */
export const listCoupons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const searchQuery =
      typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const activeQuery =
      typeof req.query.active === 'string'
        ? req.query.active.trim().toLowerCase()
        : ''
    const discountTypeQuery =
      typeof req.query.discountType === 'string'
        ? req.query.discountType.trim().toLowerCase()
        : ''
    const statusQuery =
      typeof req.query.status === 'string'
        ? req.query.status.trim().toLowerCase()
        : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const filter: FilterQuery<ICoupon> = {}

    // Active filter
    if (activeQuery === 'true') {
      filter.active = true
    } else if (activeQuery === 'false') {
      filter.active = false
    }

    // Discount type filter
    if (['percentage', 'fixed'].includes(discountTypeQuery)) {
      filter.discountType = discountTypeQuery as DiscountType
    }

    // Search query across code and description
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [{ code: regex }, { description: regex }]
    }

    // Status filter mapping
    const now = new Date()
    if (statusQuery === 'disabled') {
      filter.active = false
    } else if (statusQuery === 'scheduled') {
      filter.active = true
      filter.startDate = { $gt: now }
    } else if (statusQuery === 'expired') {
      filter.active = true
      filter.expiryDate = { $lt: now }
    } else if (statusQuery === 'exhausted') {
      filter.active = true
      filter.usageLimit = { $ne: null }
      filter.$expr = { $gte: ['$usageCount', '$usageLimit'] }
    } else if (statusQuery === 'active') {
      filter.active = true
      filter.startDate = { $lte: now }
      filter.expiryDate = { $gte: now }
      filter.$and = [
        {
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
      ]
    }

    const [total, rawCoupons] = await Promise.all([
      Coupon.countDocuments(filter),
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    const coupons = rawCoupons.map((c) => ({
      ...c,
      status: calculateCouponStatus(c, now),
    }))

    res.status(200).json({
      success: true,
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCouponController] listCoupons error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving coupons list.',
    })
  }
}

/**
 * GET /api/admin/coupons/:couponId
 * Retrieves a single coupon by ID.
 * Protected by requireAuth and requireAdmin.
 */
export const getCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawId = req.params.couponId
    const couponId = typeof rawId === 'string' ? rawId.trim() : ''

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    const coupon = await Coupon.findById(couponId).lean()
    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      coupon: {
        ...coupon,
        status: calculateCouponStatus(coupon),
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCouponController] getCoupon error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving coupon.',
    })
  }
}

/**
 * PATCH /api/admin/coupons/:couponId
 * Updates permitted coupon fields.
 * Protected by requireAuth and requireAdmin.
 */
export const updateCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawId = req.params.couponId
    const couponId = typeof rawId === 'string' ? rawId.trim() : ''

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    if (hasOperatorInjection(req.body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid update payload format.',
      })
      return
    }

    // Disallow altering immutable fields
    if ('code' in req.body) {
      res.status(400).json({
        success: false,
        message: 'Coupon code cannot be modified after creation.',
      })
      return
    }

    if ('usageCount' in req.body) {
      res.status(400).json({
        success: false,
        message: 'Usage count cannot be modified directly.',
      })
      return
    }

    // Check unknown fields
    for (const key of Object.keys(req.body)) {
      if (!ALLOWED_UPDATE_FIELDS.has(key)) {
        res.status(400).json({
          success: false,
          message: `Field "${key}" is not permitted to be updated.`,
        })
        return
      }
    }

    const coupon = await Coupon.findById(couponId)
    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    const {
      description,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      startDate,
      expiryDate,
      usageLimit,
      perCustomerLimit,
      active,
    } = req.body

    // Update description if provided
    if (description !== undefined) {
      coupon.description = typeof description === 'string' ? description.trim() : ''
    }

    // Update discountType & discountValue
    const targetType = discountType !== undefined ? discountType : coupon.discountType
    if (discountType !== undefined) {
      if (!['percentage', 'fixed'].includes(discountType)) {
        res.status(400).json({
          success: false,
          message: 'Discount type must be either "percentage" or "fixed".',
        })
        return
      }
      coupon.discountType = discountType as DiscountType
    }

    if (discountValue !== undefined) {
      const numValue = Number(discountValue)
      if (isNaN(numValue)) {
        res.status(400).json({
          success: false,
          message: 'Discount value must be a valid number.',
        })
        return
      }
      if (targetType === 'percentage' && (numValue <= 0 || numValue > 100)) {
        res.status(400).json({
          success: false,
          message: 'Percentage discount must be between 1 and 100.',
        })
        return
      }
      if (targetType === 'fixed' && numValue <= 0) {
        res.status(400).json({
          success: false,
          message: 'Fixed discount value must be greater than 0.',
        })
        return
      }
      coupon.discountValue = numValue
    }

    // Update minimumOrderValue
    if (minimumOrderValue !== undefined) {
      const minVal = Number(minimumOrderValue)
      coupon.minimumOrderValue = isNaN(minVal) ? 0 : Math.max(0, minVal)
    }

    // Update maximumDiscount
    if (maximumDiscount !== undefined) {
      if (maximumDiscount === null || maximumDiscount === '') {
        coupon.maximumDiscount = null
      } else {
        const maxVal = Number(maximumDiscount)
        coupon.maximumDiscount = isNaN(maxVal) ? null : Math.max(0, maxVal)
      }
    }

    // Update dates
    const effectiveStart =
      startDate !== undefined ? new Date(startDate) : new Date(coupon.startDate)
    const effectiveExpiry =
      expiryDate !== undefined ? new Date(expiryDate) : new Date(coupon.expiryDate)

    if (isNaN(effectiveStart.getTime()) || isNaN(effectiveExpiry.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date provided for start or expiry date.',
      })
      return
    }

    if (effectiveStart >= effectiveExpiry) {
      res.status(400).json({
        success: false,
        message: 'Expiry date must be after start date.',
      })
      return
    }

    if (startDate !== undefined) coupon.startDate = effectiveStart
    if (expiryDate !== undefined) coupon.expiryDate = effectiveExpiry

    // Update usageLimit
    if (usageLimit !== undefined) {
      if (usageLimit === null || usageLimit === '') {
        coupon.usageLimit = null
      } else {
        const limitVal = Math.floor(Number(usageLimit))
        if (isNaN(limitVal) || limitVal < 1) {
          res.status(400).json({
            success: false,
            message: 'Usage limit must be a positive integer.',
          })
          return
        }
        if (limitVal < coupon.usageCount) {
          res.status(400).json({
            success: false,
            message: `Usage limit (${limitVal}) cannot be lower than the current redemption count (${coupon.usageCount}).`,
          })
          return
        }
        coupon.usageLimit = limitVal
      }
    }

    // Update perCustomerLimit
    if (perCustomerLimit !== undefined) {
      if (perCustomerLimit === null || perCustomerLimit === '') {
        coupon.perCustomerLimit = null
      } else {
        const custLimit = Math.floor(Number(perCustomerLimit))
        if (isNaN(custLimit) || custLimit < 1) {
          res.status(400).json({
            success: false,
            message: 'Per-customer limit must be a positive integer.',
          })
          return
        }
        coupon.perCustomerLimit = custLimit
      }
    }

    // Update active
    if (active !== undefined) {
      coupon.active = Boolean(active)
    }

    await coupon.save()

    const couponObj = coupon.toObject()
    const status = calculateCouponStatus(couponObj)

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: {
        ...couponObj,
        status,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCouponController] updateCoupon error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating coupon.',
    })
  }
}

/**
 * DELETE /api/admin/coupons/:couponId
 * Deletes an unused coupon. Used coupons (usageCount > 0) cannot be deleted.
 * Protected by requireAuth and requireAdmin.
 */
export const deleteCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawId = req.params.couponId
    const couponId = typeof rawId === 'string' ? rawId.trim() : ''

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    const coupon = await Coupon.findById(couponId)
    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      })
      return
    }

    // Business integrity rule: Do NOT delete coupons that have historical usage
    if (coupon.usageCount > 0) {
      res.status(409).json({
        success: false,
        message:
          'Used coupons cannot be deleted. Disable the coupon instead.',
      })
      return
    }

    await Coupon.findByIdAndDelete(couponId)

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCouponController] deleteCoupon error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while deleting coupon.',
    })
  }
}
