import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Review } from '../models/Review'
import { Product } from '../models/Product'
import { User } from '../models/User'

/**
 * Helper to authoritatively look up a product by string ID (slug) or ObjectId
 */
async function findProduct(productId: string) {
  const cleanId = productId.trim()
  let product = await Product.findOne({ id: cleanId })
  if (!product && mongoose.Types.ObjectId.isValid(cleanId)) {
    product = await Product.findById(cleanId)
  }
  return product
}

/**
 * Helper to safely format a customer's display name
 * e.g., "Rohan S."
 */
function formatCustomerName(user: { firstName?: string; lastName?: string }): string {
  const first = user.firstName?.trim() || 'Customer'
  const lastInitial = user.lastName?.trim() ? `${user.lastName.trim().charAt(0)}.` : ''
  return `${first} ${lastInitial}`.trim()
}

/**
 * POST /api/reviews
 * Creates a new customer review for a product.
 * Requires customer authentication.
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to submit a review.',
      })
      return
    }

    const { productId, rating, review } = req.body

    // 1. Validate Product ID
    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid productId is required.',
      })
      return
    }

    const cleanProductId = productId.trim()
    const product = await findProduct(cleanProductId)

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product not found: Product '${cleanProductId}' does not exist.`,
      })
      return
    }

    if (product.available === false) {
      res.status(400).json({
        success: false,
        message: `Product '${product.name}' is currently unavailable.`,
      })
      return
    }

    // 2. Validate Rating (Integer between 1 and 5)
    const numRating = Number(rating)
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      })
      return
    }

    // 3. Validate Review Text
    if (!review || typeof review !== 'string' || !review.trim()) {
      res.status(400).json({
        success: false,
        message: 'Review text cannot be empty.',
      })
      return
    }

    const cleanReview = review.trim()
    if (cleanReview.length < 3) {
      res.status(400).json({
        success: false,
        message: 'Review must be at least 3 characters long.',
      })
      return
    }

    if (cleanReview.length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Review cannot exceed 1000 characters.',
      })
      return
    }

    // 4. Duplicate Review Check (One review per customer per product)
    const existingReview = await Review.findOne({
      productId: product.id,
      userId: req.user.userId,
    })

    if (existingReview) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product. You can update your existing review instead.',
      })
      return
    }

    // 5. Look up User for safe Name Snapshot
    const user = await User.findOne({ userId: req.user.userId })
    const customerName = user ? formatCustomerName(user) : 'Verified Customer'

    // 6. Save Review
    const newReview = await Review.create({
      productId: product.id,
      userId: req.user.userId,
      customerName,
      customerEmail: req.user.email,
      rating: numRating,
      review: cleanReview,
      status: 'approved',
    })

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        _id: newReview._id,
        productId: newReview.productId,
        customerName: newReview.customerName,
        rating: newReview.rating,
        review: newReview.review,
        status: newReview.status,
        createdAt: newReview.createdAt,
        updatedAt: newReview.updatedAt,
      },
    })
  } catch (error: unknown) {
    // Handle database duplicate key error (11000)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product.',
      })
      return
    }

    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[ReviewController] createReview error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
    })
  }
}

/**
 * GET /api/reviews/product/:productId
 * Public endpoint to fetch approved reviews and rating summary for a product.
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawProductId = req.params.productId
    if (!rawProductId || typeof rawProductId !== 'string' || !rawProductId.trim()) {
      res.status(400).json({
        success: false,
        message: 'A valid productId parameter is required.',
      })
      return
    }

    const cleanProductId = rawProductId.trim()
    const product = await findProduct(cleanProductId)

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product not found: Product '${cleanProductId}' does not exist.`,
      })
      return
    }

    // 1. Authoritative Rating Summary Calculation via Aggregation
    const stats = await Review.aggregate([
      { $match: { productId: product.id, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ])

    const distribution: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    let totalReviews = 0
    let ratingSum = 0

    for (const stat of stats) {
      const starKey = String(stat._id)
      if (distribution[starKey] !== undefined) {
        distribution[starKey] = stat.count
      }
      totalReviews += stat.count
      ratingSum += stat._id * stat.count
    }

    const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 0

    // 2. Fetch Public Approved Reviews with Pagination
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10))
    const skip = (page - 1) * limit

    const reviews = await Review.find({ productId: product.id, status: 'approved' })
      .select('_id productId rating review customerName createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      productId: product.id,
      summary: {
        averageRating,
        totalReviews,
        distribution,
      },
      page,
      totalPages: Math.ceil(totalReviews / limit) || 1,
      reviews,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[ReviewController] getProductReviews error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving reviews',
    })
  }
}

/**
 * GET /api/reviews/my-reviews
 * Fetches all reviews authored by the currently authenticated customer.
 */
export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    const reviews = await Review.find({ userId: req.user.userId }).sort({ createdAt: -1 })

    // Enrich with product name and image
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
        rating: r.rating,
        review: r.review,
        status: r.status,
        customerName: r.customerName,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }
    })

    res.status(200).json({
      success: true,
      count: enrichedReviews.length,
      reviews: enrichedReviews,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[ReviewController] getMyReviews error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving customer reviews',
    })
  }
}

/**
 * PATCH /api/reviews/:reviewId
 * Updates review text and/or rating for the authenticated review owner.
 * Moderation Policy: Editing automatically resets review status to 'pending'.
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    const reviewId = req.params.reviewId
    if (!reviewId || typeof reviewId !== 'string' || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reviewId parameter.',
      })
      return
    }

    const existingReview = await Review.findById(reviewId)
    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: `Review not found with ID '${reviewId}'.`,
      })
      return
    }

    // Ownership check: Only author can edit
    if (existingReview.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only edit your own reviews.',
      })
      return
    }

    const { rating, review } = req.body
    let hasModifications = false

    if (rating !== undefined) {
      const numRating = Number(rating)
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5.',
        })
        return
      }
      existingReview.rating = numRating
      hasModifications = true
    }

    if (review !== undefined) {
      if (typeof review !== 'string' || !review.trim()) {
        res.status(400).json({
          success: false,
          message: 'Review text cannot be empty.',
        })
        return
      }
      const cleanReview = review.trim()
      if (cleanReview.length < 3) {
        res.status(400).json({
          success: false,
          message: 'Review must be at least 3 characters long.',
        })
        return
      }
      if (cleanReview.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Review cannot exceed 1000 characters.',
        })
        return
      }
      existingReview.review = cleanReview
      hasModifications = true
    }

    if (!hasModifications) {
      res.status(400).json({
        success: false,
        message: 'Please provide either rating or review to update.',
      })
      return
    }

    // Secure behavior: Reset edited review to 'pending' for moderation
    existingReview.status = 'pending'
    await existingReview.save()

    res.status(200).json({
      success: true,
      message: 'Review updated successfully and submitted for moderation.',
      review: {
        _id: existingReview._id,
        productId: existingReview.productId,
        rating: existingReview.rating,
        review: existingReview.review,
        status: existingReview.status,
        customerName: existingReview.customerName,
        createdAt: existingReview.createdAt,
        updatedAt: existingReview.updatedAt,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[ReviewController] updateReview error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while updating review',
    })
  }
}

/**
 * DELETE /api/reviews/:reviewId
 * Deletes a review. Only the authenticated review owner can delete their review.
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    const reviewId = req.params.reviewId
    if (!reviewId || typeof reviewId !== 'string' || !mongoose.Types.ObjectId.isValid(reviewId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reviewId parameter.',
      })
      return
    }

    const existingReview = await Review.findById(reviewId)
    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: `Review not found with ID '${reviewId}'.`,
      })
      return
    }

    // Ownership check: Only author can delete
    if (existingReview.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own reviews.',
      })
      return
    }

    await Review.findByIdAndDelete(reviewId)

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[ReviewController] deleteReview error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
    })
  }
}
