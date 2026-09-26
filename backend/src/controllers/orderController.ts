import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
import { Coupon } from '../models/Coupon'
import { AuthenticatedUser } from '../middleware/authMiddleware'
import mongoose from 'mongoose'

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

/**
 * Generate human-readable unique order ID:
 * Format: KALA-YYYYMMDD-XXXXXX
 */
function generateOrderId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePart = `${year}${month}${day}`
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-${datePart}-${randomPart}`
}

interface AuthResult {
  user?: AuthenticatedUser
  error?: string
}

/**
 * Helper to safely extract authenticated user from req.user or Authorization header.
 * - Returns { user } if valid token or already authenticated by middleware.
 * - Returns {} if no authorization header provided (guest).
 * - Returns { error } if authorization header is provided but invalid/expired.
 */
function getAuthenticatedUser(req: Request): AuthResult {
  // 1. If already populated by upstream requireAuth middleware
  if (
    req.user &&
    typeof req.user.userId === 'string' &&
    req.user.userId.trim() &&
    typeof req.user.email === 'string' &&
    req.user.email.trim()
  ) {
    return { user: req.user }
  }

  // 2. Check Authorization header
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
    console.error('[OrderController] JWT_SECRET is missing in environment variables.')
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

// POST /api/orders
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // 0. Authentication Enforcement (Customer login is strictly required before creating an order)
    const auth = getAuthenticatedUser(req)
    if (auth.error || !auth.user) {
      res.status(401).json({
        success: false,
        message: auth.error || 'Authentication required: Please log in to place an order.',
      })
      return
    }

    const authenticatedUserId = auth.user.userId
    const authenticatedEmail = auth.user.email.trim().toLowerCase()

    const { customer, shippingAddress, items, couponCode } = req.body

    // 1. Validate Customer Information
    if (
      !customer ||
      !customer.firstName?.trim() ||
      !customer.lastName?.trim() ||
      !customer.phone?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid order data: Complete customer information (firstName, lastName, phone) is required.',
      })
      return
    }

    // 2. Validate Shipping Address
    if (
      !shippingAddress ||
      !shippingAddress.address?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid order data: Complete shipping address (address, city, state, pincode) is required.',
      })
      return
    }

    // 3. Validate Items Array
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid order data: Order must contain at least one item.',
      })
      return
    }

    // 4. Validate Each Item Format (Size & Quantity)
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string' || !item.productId.trim()) {
        res.status(400).json({
          success: false,
          message: 'Invalid order data: Each item must contain a valid productId.',
        })
        return
      }

      if (!item.size || !VALID_SIZES.includes(item.size.toUpperCase())) {
        res.status(400).json({
          success: false,
          message: `Invalid order data: Size '${item.size}' is not supported. Allowed sizes: ${VALID_SIZES.join(', ')}`,
        })
        return
      }

      const qty = Number(item.quantity)
      if (!Number.isInteger(qty) || qty < 1) {
        res.status(400).json({
          success: false,
          message: `Invalid order data: Quantity for product '${item.productId}' must be an integer >= 1.`,
        })
        return
      }
    }

    // 5. Fetch Authoritative Products from MongoDB
    const productIds = items.map((i) => i.productId.trim())
    const dbProducts = await Product.find({ id: { $in: productIds } })
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // 6. Verify All Product IDs Exist & Are Available in MongoDB
    for (const item of items) {
      const dbProduct = productMap.get(item.productId.trim())
      if (!dbProduct) {
        res.status(404).json({
          success: false,
          message: `Product not found: No product found with ID '${item.productId}'.`,
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

    // 7. Construct Verified Items & NEVER Trust Frontend Price
    const verifiedItems = items.map((item) => {
      const dbProduct = productMap.get(item.productId.trim())!

      // Authoritative back custom text validation & pricing
      let customizationData: { backText: string; price: number } | undefined = undefined
      let customPrice = 0

      const rawBackText = item.customization?.backText || item.backText
      if (typeof rawBackText === 'string' && rawBackText.trim().length > 0) {
        const cleanBackText = rawBackText.trim().slice(0, 30)
        customPrice = 25 // STRICT: Authoritative server-side ₹25 customization fee
        customizationData = {
          backText: cleanBackText,
          price: 25,
        }
      }

      return {
        productId: dbProduct.id,
        name: dbProduct.name,
        image: dbProduct.image,
        size: item.size.toUpperCase(),
        quantity: Math.floor(Number(item.quantity)),
        price: dbProduct.price + customPrice, // STRICT: ALWAYS use verified DB base price + server custom fee
        ...(customizationData ? { customization: customizationData } : {}),
      }
    })

    // 8. Calculate Authoritative Subtotal on Server
    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // 9. Process Coupon if Provided (Never trust frontend discount or pricing)
    let discountAmount = 0
    let couponSnapshot:
      | {
          code: string
          discountType: 'percentage' | 'fixed'
          discountValue: number
          discountAmount: number
        }
      | undefined = undefined
    let couponIncrementedId: mongoose.Types.ObjectId | null = null

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase()
      const couponDoc = await Coupon.findOne({ code: cleanCode })

      if (!couponDoc) {
        res.status(404).json({
          success: false,
          message: 'Invalid coupon code.',
        })
        return
      }

      if (!couponDoc.active) {
        res.status(400).json({
          success: false,
          message: 'Coupon is currently disabled.',
        })
        return
      }

      const now = new Date()
      if (now < new Date(couponDoc.startDate)) {
        res.status(400).json({
          success: false,
          message: 'Coupon is not active yet.',
        })
        return
      }

      if (now > new Date(couponDoc.expiryDate)) {
        res.status(400).json({
          success: false,
          message: 'Coupon has expired.',
        })
        return
      }

      if (
        typeof couponDoc.usageLimit === 'number' &&
        couponDoc.usageLimit > 0 &&
        couponDoc.usageCount >= couponDoc.usageLimit
      ) {
        res.status(400).json({
          success: false,
          message: 'Coupon usage limit has been reached.',
        })
        return
      }

      if (couponDoc.minimumOrderValue > 0 && subtotal < couponDoc.minimumOrderValue) {
        res.status(400).json({
          success: false,
          message: `Minimum order value for this coupon is ₹${couponDoc.minimumOrderValue.toLocaleString('en-IN')}.`,
        })
        return
      }

      // Per-Customer Limit Check
      if (
        typeof couponDoc.perCustomerLimit === 'number' &&
        couponDoc.perCustomerLimit > 0
      ) {
        const escapedEmail = authenticatedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const customerEmailRegex = new RegExp(`^${escapedEmail}$`, 'i')

        const previousCustomerOrdersCount = await Order.countDocuments({
          $or: [
            { userId: authenticatedUserId },
            { 'customer.email': customerEmailRegex },
          ],
          'coupon.code': cleanCode,
          status: { $ne: 'cancelled' },
        })

        if (previousCustomerOrdersCount >= couponDoc.perCustomerLimit) {
          res.status(400).json({
            success: false,
            message: 'You have already used this coupon the maximum allowed times.',
          })
          return
        }
      }

      // Calculate Authoritative Discount Amount
      if (couponDoc.discountType === 'percentage') {
        discountAmount = (subtotal * couponDoc.discountValue) / 100
        if (typeof couponDoc.maximumDiscount === 'number' && couponDoc.maximumDiscount > 0) {
          discountAmount = Math.min(discountAmount, couponDoc.maximumDiscount)
        }
      } else if (couponDoc.discountType === 'fixed') {
        discountAmount = couponDoc.discountValue
      }

      discountAmount = Math.min(discountAmount, subtotal)
      discountAmount = Math.max(0, Math.round(discountAmount))

      // Atomic Coupon Usage Increment (Prevents Race Conditions)
      const updatedCoupon = await Coupon.findOneAndUpdate(
        {
          _id: couponDoc._id,
          active: true,
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
        { $inc: { usageCount: 1 } },
        { new: true }
      )

      if (!updatedCoupon) {
        res.status(400).json({
          success: false,
          message: 'Coupon usage limit has been reached.',
        })
        return
      }

      couponIncrementedId = couponDoc._id as mongoose.Types.ObjectId
      couponSnapshot = {
        code: couponDoc.code,
        discountType: couponDoc.discountType,
        discountValue: couponDoc.discountValue,
        discountAmount,
      }
    }

    // 10. Shipping & Authoritative Total Calculation
    // Consistent KALA Shipping Policy: subtotal >= 2000 -> free shipping, else 99
    // Promotional / free shipping items (e.g. streetwear-oversized-acid-tee) have 0 shipping charges
    const hasFreeShipping =
      subtotal >= 2000 ||
      items.some((item) => {
        const dbProd = productMap.get(item.productId.trim())
        return dbProd?.freeShipping === true || item.productId.trim() === 'streetwear-oversized-acid-tee'
      })
    const shipping = hasFreeShipping ? 0 : 99
    const total = subtotal - discountAmount + shipping

    // 11. Generate Unique Order ID
    let orderId = generateOrderId()
    let existing = await Order.findOne({ orderId })
    while (existing) {
      orderId = generateOrderId()
      existing = await Order.findOne({ orderId })
    }

    try {
      // 12. Save Order to MongoDB (attach authenticated userId and email strictly from verified JWT)
      const newOrder = await Order.create({
        orderId,
        userId: authenticatedUserId,
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: authenticatedEmail,
          phone: customer.phone.trim(),
        },
        shippingAddress: {
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
        },
        items: verifiedItems,
        pricing: {
          subtotal,
          discount: discountAmount,
          shipping,
          total,
        },
        ...(couponSnapshot ? { coupon: couponSnapshot } : {}),
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            changedAt: new Date(),
            note: 'Order placed by customer',
          },
        ],
      })

      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        message: 'Order created successfully',
      })
    } catch (orderSaveError) {
      // Rollback coupon usage increment if order persistence fails
      if (couponIncrementedId) {
        await Coupon.findByIdAndUpdate(couponIncrementedId, { $inc: { usageCount: -1 } }).catch(
          (rollbackErr) => {
            console.error('[OrderController] Failed to rollback coupon usageCount:', rollbackErr)
          }
        )
      }
      throw orderSaveError
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[OrderController] createOrder error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      ...(process.env.NODE_ENV !== 'production' ? { error: message } : {}),
    })
  }
}

// GET /api/orders/my-orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuthenticatedUser(req)
    if (auth.error || !auth.user) {
      res.status(401).json({
        success: false,
        message: auth.error || 'Authentication required.',
      })
      return
    }

    const normalizedEmail = auth.user.email.trim().toLowerCase()
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const emailRegex = new RegExp(`^${escapedEmail}$`, 'i')

    // Find orders belonging to the authenticated customer:
    // Matches by userId OR by customer.email (case-insensitive)
    const orders = await Order.find({
      $or: [
        { userId: auth.user.userId },
        { 'customer.email': emailRegex },
      ],
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[OrderController] getMyOrders error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving customer orders',
    })
  }
}

// GET /api/orders/:orderId
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuthenticatedUser(req)
    if (auth.error || !auth.user) {
      res.status(401).json({
        success: false,
        message: auth.error || 'Authentication required.',
      })
      return
    }

    const orderId = req.params.orderId as string

    if (!orderId || typeof orderId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid orderId parameter',
      })
      return
    }

    let order = await Order.findOne({ orderId })

    // Fallback: If not found by custom orderId, try Mongo _id if valid ObjectId
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      res.status(404).json({
        success: false,
        message: `Order not found with ID '${orderId}'`,
      })
      return
    }

    // Ownership check:
    // Order must belong to the authenticated user either by userId or by customer.email (case-insensitive)
    const isOwnerByUserId = Boolean(order.userId && order.userId === auth.user.userId)
    const isOwnerByEmail = Boolean(
      order.customer?.email &&
      order.customer.email.trim().toLowerCase() === auth.user.email.trim().toLowerCase()
    )

    if (!isOwnerByUserId && !isOwnerByEmail) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order.',
      })
      return
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[OrderController] getOrderById error:', message)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving order',
    })
  }
}
