import { Router } from 'express'
import {
  listAdminReviews,
  getAdminReviewById,
  updateAdminReviewStatus,
  deleteAdminReview,
} from '../controllers/adminReviewController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminReviewRouter = Router()

// All admin review endpoints require authentication and administrator privileges
adminReviewRouter.use(requireAuth, requireAdmin)

// GET /api/admin/reviews - List all reviews with filters & pagination
adminReviewRouter.get('/', listAdminReviews)

// GET /api/admin/reviews/:reviewId - Fetch single review details
adminReviewRouter.get('/:reviewId', getAdminReviewById)

// PATCH /api/admin/reviews/:reviewId/status - Update review status (pending/approved/hidden)
adminReviewRouter.patch('/:reviewId/status', updateAdminReviewStatus)

// DELETE /api/admin/reviews/:reviewId - Delete review
adminReviewRouter.delete('/:reviewId', deleteAdminReview)

export default adminReviewRouter
