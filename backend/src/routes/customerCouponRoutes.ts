import { Router } from 'express'
import { validateCustomerCoupon } from '../controllers/customerCouponController'

export const customerCouponRouter = Router()

// POST /api/coupons/validate - Customer coupon validation preview
customerCouponRouter.post('/validate', validateCustomerCoupon)

export default customerCouponRouter
