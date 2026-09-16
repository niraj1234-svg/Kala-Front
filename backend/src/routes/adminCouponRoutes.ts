import { Router } from 'express'
import {
  createCoupon,
  listCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/adminCouponController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

export const adminCouponRouter = Router()

// All administrative coupon management endpoints require authentication & admin role
adminCouponRouter.use(requireAuth, requireAdmin)

// POST /api/admin/coupons — Create a new coupon
adminCouponRouter.post('/', createCoupon)

// GET /api/admin/coupons — List coupons with pagination, search, and filters
adminCouponRouter.get('/', listCoupons)

// GET /api/admin/coupons/:couponId — Get a single coupon by ID
adminCouponRouter.get('/:couponId', getCoupon)

// PATCH /api/admin/coupons/:couponId — Update coupon configuration
adminCouponRouter.patch('/:couponId', updateCoupon)

// DELETE /api/admin/coupons/:couponId — Delete an unused coupon
adminCouponRouter.delete('/:couponId', deleteCoupon)

export default adminCouponRouter
