import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Review, ReviewStatus } from '../models/Review'
import { Product } from '../models/Product'

const ALLOWED_STATUSES: ReviewStatus[] = ['pending', 'approved', 'hidden']

/**
 * GET /api/admin/reviews
 * Lists reviews with pagination, status filter, product filter, rating filter, and search.
 * Protected by requireAuth + requireAdmin.
 */
export const listAdminReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20))
    const skip = (page - 1) * limit

    const filter: Record<string, any> = {}

    // Status filter
    const status = req.query.status as string
    if (status && status !== 'all' && ALLOWED_STATUSES.includes(status as ReviewStatus)) {
      filter.status = status
    }

    // Product ID filter
    const productId = req.query.productId as string
    if (productId && typeof productId === 'string' && productId.trim()) {
      filter.productId = productId.trim()
    }

    // Rating filter
    const rating = parseInt(req.query.rating as string, 10)
    if (rating && Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      filter.rating = rating
    }

    // Search query (sanitized regex over review text, customerName, or productId)
    const search = req.query.search as string
    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(sanitized, 'i')
      filter.$or = [{ review: regex }, { customerName: regex }, { productId: regex }]
    }

    const total = await Review.countDocuments(filter)
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Enrich with product information
    const productIds = Array.from(new Set(reviews.map((r) => r.productId)))
    const products = await Product.find({ id: { $in: productIds } })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const enrichedReviews = reviews.map((r) => {
      const p = productMap.get(r.productId)
      return {
        _id: r._id,
        productId: r.productId,
        productName: p ? p.name : r.productId,
        productImage: p ? p.image : '',
        userId: r.userId,
        customerName: r.customerName,
        rating: r.rating,
        review: r.review,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }
    })

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      reviews: enrichedReviews,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[AdminReviewController] listAdminReviews error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving reviews',
    })
  }
}

/**
 * GET /api/admin/reviews/:reviewId
 * Fetches review details by ID.
 * Protected by requireAuth + requireAdmin.
 */
export const getAdminReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.reviewId
    if (!reviewId || typeof reviewId !== 'string' || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reviewId parameter.',
      })
      return
    }

    const review = await Review.findById(reviewId)
    if (!review) {
      res.status(404).json({
        success: false,
        message: `Review not found with ID '${reviewId}'.`,
      })
      return
    }

    const product = await Product.findOne({ id: review.productId })

    res.status(200).json({
      success: true,
      review: {
        _id: review._id,
        productId: review.productId,
        productName: product ? product.name : review.productId,
        productImage: product ? product.image : '',
        userId: review.userId,
        customerName: review.customerName,
        rating: review.rating,
        review: review.review,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[AdminReviewController] getAdminReviewById error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving review details',
    })
  }
}

/**
 * PATCH /api/admin/reviews/:reviewId/status
 * Updates review moderation status (pending, approved, hidden).
 * Protected by requireAuth + requireAdmin.
 */
export const updateAdminReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.reviewId
    if (!reviewId || typeof reviewId !== 'string' || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reviewId parameter.',
      })
      return
    }

    const { status } = req.body
    if (!status || !ALLOWED_STATUSES.includes(status as ReviewStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}`,
      })
      return
    }

    const review = await Review.findById(reviewId)
    if (!review) {
      res.status(404).json({
        success: false,
        message: `Review not found with ID '${reviewId}'.`,
      })
      return
    }

    review.status = status as ReviewStatus
    await review.save()

    res.status(200).json({
      success: true,
      message: `Review status updated to '${status}'.`,
      review: {
        _id: review._id,
        productId: review.productId,
        userId: review.userId,
        customerName: review.customerName,
        rating: review.rating,
        review: review.review,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[AdminReviewController] updateAdminReviewStatus error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while updating review status',
    })
  }
}

/**
 * DELETE /api/admin/reviews/:reviewId
 * Deletes a review permanently by administrator.
 * Protected by requireAuth + requireAdmin.
 */
export const deleteAdminReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.reviewId
    if (!reviewId || typeof reviewId !== 'string' || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reviewId parameter.',
      })
      return
    }

    const deletedReview = await Review.findByIdAndDelete(reviewId)
    if (!deletedReview) {
      res.status(404).json({
        success: false,
        message: `Review not found with ID '${reviewId}'.`,
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Review permanently deleted by administrator.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[AdminReviewController] deleteAdminReview error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
    })
  }
}
