import { Router } from 'express'
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController'
import { requireAuth } from '../middleware/authMiddleware'

export const reviewRouter = Router()

// POST /api/reviews - Create a review (Customer auth required)
reviewRouter.post('/', requireAuth, createReview)

// GET /api/reviews/product/:productId - Public product reviews and rating summary
reviewRouter.get('/product/:productId', getProductReviews)

// GET /api/reviews/my-reviews - Customer's own reviews (Customer auth required)
reviewRouter.get('/my-reviews', requireAuth, getMyReviews)

// PATCH /api/reviews/:reviewId - Edit review (Customer auth + owner check required)
reviewRouter.patch('/:reviewId', requireAuth, updateReview)

// DELETE /api/reviews/:reviewId - Delete review (Customer auth + owner check required)
reviewRouter.delete('/:reviewId', requireAuth, deleteReview)

export default reviewRouter
