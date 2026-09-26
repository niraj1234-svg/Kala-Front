import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Coupon } from '../models/Coupon'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { AuthenticatedUser } from '../middleware/authMiddleware'

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

interface AuthResult {
  user?: AuthenticatedUser
  error?: string
}

/**
 * Helper to safely extract authenticated user from req.user or Authorization header.
 * - Returns { user } if valid customer token.
 * - Returns {} if no authorization header is provided (guest customer).
 * - Returns { error } if authorization header is provided but invalid/expired/malformed.
 */
function getAuthenticatedCustomer(req: Request): AuthResult {
  if (
    req.user &&
    typeof req.user.userId === 'string' &&
    req.user.userId.trim() &&
    typeof req.user.email === 'string' &&
    req.user.email.trim()
  ) {
    return { user: req.user }
  }

  const authHeader = req.headers.authorization
  if (!authHeader || typeof authHeader !== 'string') {
    return {}
  }

  const parts = authHeader.trim().split(/\s+/)
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return { error: 'Authentication required: Invalid Authorization header format.' }
  }

  const token = parts[1]
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error('[customerCouponController] JWT_SECRET is missing in environment variables.')
    return { error: 'Authentication service configuration error.' }
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      !decoded.userId.trim() ||
      typeof decoded.email !== 'string' ||
      !decoded.email.trim()
    ) {
      return { error: 'Invalid or expired authentication token.' }
    }

    return {
      user: {
        userId: decoded.userId.trim(),
        email: decoded.email.trim(),
      },
    }
  } catch {
    return { error: 'Invalid or expired authentication token.' }
  }
}

/**
 * POST /api/coupons/validate
 * Validates a coupon code against the customer's cart items.
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Server-side authoritative product pricing.
 * Ignores any client-supplied price, subtotal, discount, shipping, or total.
 * Does NOT increment coupon usageCount (preview only).
 */
export const validateCustomerCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Authentication Check (Guests allowed, but invalid tokens rejected with 401)
    const auth = getAuthenticatedCustomer(req)
    if (auth.error) {
      res.status(401).json({
        success: false,
        message: auth.error,
      })
      return
    }

    const { code, items } = req.body

    // 2. Validate Coupon Code input
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({
        success: false,
        message: 'Please provide a coupon code.',
      })
      return
    }

    // 3. Validate Items Array
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart items are required to validate coupon.',
      })
      return
    }

    // 4. Validate Each Item Format
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string' || !item.productId.trim()) {
        res.status(400).json({
          success: false,
          message: 'Invalid cart item: Each item must contain a valid productId.',
        })
        return
      }

      if (!item.size || !VALID_SIZES.includes(item.size.toUpperCase())) {
        res.status(400).json({
          success: false,
          message: `Invalid cart item: Size '${item.size}' is not supported.`,
        })
        return
      }

      const qty = Number(item.quantity)
      if (!Number.isInteger(qty) || qty < 1) {
        res.status(400).json({
          success: false,
          message: `Invalid cart item: Quantity must be an integer >= 1.`,
        })
        return
      }
    }

    // 5. Fetch Authoritative Products from MongoDB
    const productIds = items.map((i: { productId: string }) => i.productId.trim())
    const dbProducts = await Product.find({ id: { $in: productIds } })
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // 6. Verify All Product IDs Exist and Are Available
    for (const item of items) {
      const dbProduct = productMap.get(item.productId.trim())
      if (!dbProduct) {
        res.status(404).json({
          success: false,
          message: `Product not found: Product '${item.productId}' does not exist.`,
        })
        return
      }
      if (dbProduct.available === false) {
        res.status(400).json({
          success: false,
          message: `Product '${dbProduct.name}' is currently unavailable.`,
        })
        return
      }
    }

    // 7. Calculate Authoritative Subtotal
    const subtotal = items.reduce((sum: number, item: { productId: string; quantity: number }) => {
      const dbProduct = productMap.get(item.productId.trim())!
      return sum + dbProduct.price * Math.floor(Number(item.quantity))
    }, 0)

    // 8. Find Coupon by normalized uppercase code
    const cleanCode = code.trim().toUpperCase()
    const coupon = await Coupon.findOne({ code: cleanCode })

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Invalid coupon code.',
      })
      return
    }

    // 9. Coupon Active Status Check
    if (!coupon.active) {
      res.status(400).json({
        success: false,
        message: 'Coupon is currently disabled.',
      })
      return
    }

    // 10. Date Range Validation (Server Time)
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const expiryDate = new Date(coupon.expiryDate)

    if (now < startDate) {
      res.status(400).json({
        success: false,
        message: 'Coupon is not active yet.',
      })
      return
    }

    if (now > expiryDate) {
      res.status(400).json({
        success: false,
        message: 'Coupon has expired.',
      })
      return
    }

    // 11. Global Usage Limit Check
    if (
      typeof coupon.usageLimit === 'number' &&
      coupon.usageLimit > 0 &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      res.status(400).json({
        success: false,
        message: 'Coupon usage limit has been reached.',
      })
      return
    }

    // 12. Minimum Order Value Check
    if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
      res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minimumOrderValue.toLocaleString('en-IN')}.`,
      })
      return
    }

    // 13. Per-Customer Limit Check
    // If authenticated: enforce against past non-cancelled orders
    // If guest: global usageLimit is enforced. Guest per-customer tracking requires a persistent
    // identity mechanism (e.g. login) to reliably enforce without inventing insecure heuristics.
    if (
      auth.user &&
      typeof coupon.perCustomerLimit === 'number' &&
      coupon.perCustomerLimit > 0
    ) {
      const normalizedEmail = auth.user.email.trim().toLowerCase()
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const emailRegex = new RegExp(`^${escapedEmail}$`, 'i')

      const previousUsageCount = await Order.countDocuments({
        $or: [
          { userId: auth.user.userId },
          { 'customer.email': emailRegex },
        ],
        'coupon.code': cleanCode,
        status: { $ne: 'cancelled' },
      })

      if (previousUsageCount >= coupon.perCustomerLimit) {
        res.status(400).json({
          success: false,
          message: 'You have already used this coupon the maximum allowed times.',
        })
        return
      }
    }

    // 14. Calculate Authoritative Discount Amount
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
      if (
        typeof coupon.maximumDiscount === 'number' &&
        coupon.maximumDiscount > 0
      ) {
        discount = Math.min(discount, coupon.maximumDiscount)
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, subtotal)
    discount = Math.max(0, Math.round(discount))

    // 15. Shipping Rule (Consistent KALA Shipping Policy: subtotal >= 2000 -> 0, else 99)
    // Promotional / free shipping items (e.g. streetwear-oversized-acid-tee) have 0 shipping charges
    const hasFreeShipping =
      subtotal >= 2000 ||
      items.some((item: { productId: string }) => {
        const dbProd = productMap.get(item.productId.trim())
        return dbProd?.freeShipping === true || item.productId.trim() === 'streetwear-oversized-acid-tee'
      })
    const shipping = hasFreeShipping ? 0 : 99
    const discountedSubtotal = subtotal - discount
    const total = discountedSubtotal + shipping

    // 16. Return Successful Validation Preview (Do NOT increment usageCount)
    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      pricing: {
        subtotal,
        discount,
        shipping,
        total,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[customerCouponController] validateCustomerCoupon error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while validating coupon',
    })
  }
}
