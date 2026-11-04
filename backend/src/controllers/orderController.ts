import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
import { Coupon } from '../models/Coupon'
import { SubOrder } from '../models/SubOrder'
import { PlatformSettings } from '../models/PlatformSettings'
import { Transaction } from '../models/Transaction'
import { InventoryLog } from '../models/InventoryLog'
import { AuthenticatedUser } from '../middleware/authMiddleware'
import { sendOrderPlacedAlert } from '../services/notificationService'
import mongoose from 'mongoose'

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'BULK', 'BULK (MIXED S-XXL)', 'FREE SIZE', 'CUSTOM']

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

    const { customer, shippingAddress, items, couponCode, bundleType, bundle } = req.body

    // 0.1 Validate Bundle if Present (Authoritative Server-Side Pricing)
    const BUNDLE_CONFIG: Record<string, { name: string; price: number; requiredCount: number }> = {
      '2_TSHIRT': { name: '2 T-Shirts Bundle', price: 499, requiredCount: 2 },
      '3_TSHIRT': { name: '3 T-Shirts Bundle', price: 699, requiredCount: 3 },
      '5_TSHIRT': { name: '5 T-Shirts Bundle', price: 999, requiredCount: 5 },
    }

    const rawBundleType = bundleType || bundle?.type
    let bundleData: { type: string; name: string; price: number; slotCount: number } | undefined = undefined

    if (rawBundleType) {
      const normalizedType = String(rawBundleType).trim().toUpperCase()
      const config = BUNDLE_CONFIG[normalizedType]
      if (!config) {
        res.status(400).json({
          success: false,
          message: `Invalid bundle type '${rawBundleType}'. Supported bundles: 2_TSHIRT, 3_TSHIRT, 5_TSHIRT.`,
        })
        return
      }

      if (!items || !Array.isArray(items)) {
        res.status(400).json({
          success: false,
          message: 'Invalid order data: Bundle must contain items.',
        })
        return
      }

      const totalBundleItems = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
      if (totalBundleItems !== config.requiredCount) {
        res.status(400).json({
          success: false,
          message: `Invalid bundle quantity: ${config.name} requires exactly ${config.requiredCount} T-shirts, but ${totalBundleItems} were provided.`,
        })
        return
      }

      bundleData = {
        type: normalizedType,
        name: config.name,
        price: config.price,
        slotCount: config.requiredCount,
      }
    }

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

    // 5. Authoritative Custom Apparel Catalog & MongoDB Product Lookup
    const CUSTOM_APPAREL_CATALOG: Record<string, { id: string; name: string; price: number; image: string; apparelType: string }> = {
      'custom-t-shirt': {
        id: 'custom-t-shirt',
        name: 'KALA Custom Printed T-Shirt',
        price: 349,
        image: '/custom-apparel/kala-custom-hero-floating.png',
        apparelType: 't-shirt',
      },
      'custom-tshirt': {
        id: 'custom-t-shirt',
        name: 'KALA Custom Printed T-Shirt',
        price: 349,
        image: '/custom-apparel/kala-custom-hero-floating.png',
        apparelType: 't-shirt',
      },
      'tshirt': {
        id: 'custom-t-shirt',
        name: 'KALA Custom Printed T-Shirt',
        price: 349,
        image: '/custom-apparel/kala-custom-hero-floating.png',
        apparelType: 't-shirt',
      },
      't-shirt': {
        id: 'custom-t-shirt',
        name: 'KALA Custom Printed T-Shirt',
        price: 349,
        image: '/custom-apparel/kala-custom-hero-floating.png',
        apparelType: 't-shirt',
      },
      'custom-hoodie': {
        id: 'custom-hoodie',
        name: 'KALA Custom Printed Hoodie',
        price: 699,
        image: 'Streetwear -02.png',
        apparelType: 'hoodie',
      },
      'hoodie': {
        id: 'custom-hoodie',
        name: 'KALA Custom Printed Hoodie',
        price: 699,
        image: 'Streetwear -02.png',
        apparelType: 'hoodie',
      },
      'custom-jersey': {
        id: 'custom-jersey',
        name: 'KALA Custom Printed Jersey',
        price: 429,
        image: 'gaming 01.png',
        apparelType: 'jersey',
      },
      'jersey': {
        id: 'custom-jersey',
        name: 'KALA Custom Printed Jersey',
        price: 429,
        image: 'gaming 01.png',
        apparelType: 'jersey',
      },
      'bulk-tshirt': {
        id: 'bulk-tshirt',
        name: 'KALA Custom T-Shirt (Bulk)',
        price: 175,
        image: '/mockups/tshirt-black-front.svg',
        apparelType: 'tshirt',
      },
      'bulk-tshirt-black': {
        id: 'bulk-tshirt',
        name: 'KALA Custom T-Shirt (Bulk)',
        price: 175,
        image: '/mockups/tshirt-black-front.svg',
        apparelType: 'tshirt',
      },
      'bulk-tshirt-white': {
        id: 'bulk-tshirt',
        name: 'KALA Custom T-Shirt (Bulk)',
        price: 175,
        image: '/mockups/tshirt-white-front.svg',
        apparelType: 'tshirt',
      },
      'bulk-hoodie': {
        id: 'bulk-hoodie',
        name: 'KALA Custom Hoodie (Bulk)',
        price: 680,
        image: '/mockups/hoodie-black-front.svg',
        apparelType: 'hoodie',
      },
      'bulk-hoodie-black': {
        id: 'bulk-hoodie',
        name: 'KALA Custom Hoodie (Bulk)',
        price: 680,
        image: '/mockups/hoodie-black-front.svg',
        apparelType: 'hoodie',
      },
      'bulk-hoodie-white': {
        id: 'bulk-hoodie',
        name: 'KALA Custom Hoodie (Bulk)',
        price: 680,
        image: '/mockups/hoodie-white-front.svg',
        apparelType: 'hoodie',
      },
      'bulk-jersey': {
        id: 'bulk-jersey',
        name: 'KALA Custom Jersey (Bulk)',
        price: 350,
        image: '/mockups/jersey-black-front.svg',
        apparelType: 'jersey',
      },
      'bulk-jersey-black': {
        id: 'bulk-jersey',
        name: 'KALA Custom Jersey (Bulk)',
        price: 350,
        image: '/mockups/jersey-black-front.svg',
        apparelType: 'jersey',
      },
      'bulk-jersey-white': {
        id: 'bulk-jersey',
        name: 'KALA Custom Jersey (Bulk)',
        price: 350,
        image: '/mockups/jersey-white-front.svg',
        apparelType: 'jersey',
      },
      'custom-polo': {
        id: 'custom-polo',
        name: 'KALA Custom Polo T-Shirt',
        price: 299,
        image: '/custom-apparel/polos/regular-jmp-polo.png',
        apparelType: 'polo',
      },
      'polo': {
        id: 'custom-polo',
        name: 'KALA Custom Polo T-Shirt',
        price: 299,
        image: '/custom-apparel/polos/regular-jmp-polo.png',
        apparelType: 'polo',
      },
      'bulk-polo': {
        id: 'custom-polo',
        name: 'KALA Custom Polo T-Shirt (Bulk)',
        price: 299,
        image: '/custom-apparel/polos/regular-jmp-polo.png',
        apparelType: 'polo',
      },
    }

    const productIds = items.map((i) => i.productId.trim())
    const dbProducts = await Product.find({ id: { $in: productIds } })
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // 6. Verify All Product IDs Exist & Are Available in MongoDB or Custom Catalog
    for (const item of items) {
      const pid = item.productId.trim().toLowerCase()
      const dbProduct = productMap.get(item.productId.trim())
      const isCustomCatalog = CUSTOM_APPAREL_CATALOG[pid] || pid.startsWith('custom-') || pid.startsWith('bulk-')

      if (!dbProduct && !isCustomCatalog) {
        res.status(404).json({
          success: false,
          message: `Product not found: No product found with ID '${item.productId}'.`,
        })
        return
      }
      if (dbProduct && (dbProduct.available === false || (dbProduct.approvalStatus && dbProduct.approvalStatus !== 'APPROVED'))) {
        res.status(400).json({
          success: false,
          message: `Product '${dbProduct.name}' is currently unavailable or pending approval.`,
        })
        return
      }

      if (dbProduct && typeof dbProduct.stock === 'number' && dbProduct.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for '${dbProduct.name}'. Only ${dbProduct.stock} unit(s) left in stock.`,
        })
        return
      }

      // Validate custom design payload if present
      if (item.customization && (item.customization.artworkUrl || item.customization.artwork || item.customization.position || item.customization.apparelType)) {
        const cust = item.customization
        const posLower = String(cust.position || '').toLowerCase()
        const validPlacements = ['front', 'back', 'left', 'right', 'front & back', 'front & back custom print']
        if (cust.position && !validPlacements.includes(posLower) && !posLower.includes('front') && !posLower.includes('back')) {
          res.status(400).json({
            success: false,
            message: `Invalid customization: Placement '${cust.position}' is not supported. Allowed: FRONT, BACK, LEFT, RIGHT, FRONT & BACK.`,
          })
          return
        }
      }
    }

    // 7. Construct Verified Items & NEVER Trust Frontend Price
    const verifiedItems = items.map((item) => {
      const pid = item.productId.trim().toLowerCase()
      const dbProduct = productMap.get(item.productId.trim())
      const customFallback = CUSTOM_APPAREL_CATALOG[pid]

      const productName = dbProduct ? dbProduct.name : (customFallback?.name || 'KALA Custom Apparel')
      const productImage = dbProduct ? dbProduct.image : (customFallback?.image || '')
      const baseProductPrice = dbProduct ? dbProduct.price : (customFallback?.price || 349)

      // Handle custom artwork / design customization
      let customizationData: any = undefined
      let customPrice = 0

      // 1. Process custom artwork / placement details
      const rawCust = item.customization
      if (rawCust && (rawCust.artworkUrl || rawCust.artwork || rawCust.position || rawCust.apparelType || rawCust.frontPreviewUrl || rawCust.previewUrl)) {
        customizationData = {
          apparelType: String(rawCust.apparelType || customFallback?.apparelType || 't-shirt').toLowerCase(),
          color: String(rawCust.color || item.color || 'White').trim(),
          position: String(rawCust.position || 'front').toLowerCase(),
          artworkUrl: typeof rawCust.artworkUrl === 'string' ? rawCust.artworkUrl : '',
          previewUrl: typeof rawCust.previewUrl === 'string' ? rawCust.previewUrl : '',
          frontPreviewUrl: typeof rawCust.frontPreviewUrl === 'string' ? rawCust.frontPreviewUrl : (typeof rawCust.previewUrl === 'string' ? rawCust.previewUrl : ''),
          backPreviewUrl: typeof rawCust.backPreviewUrl === 'string' ? rawCust.backPreviewUrl : '',
          frontArtworkUrl: typeof rawCust.frontArtworkUrl === 'string' ? rawCust.frontArtworkUrl : (typeof rawCust.artworkUrl === 'string' ? rawCust.artworkUrl : ''),
          backArtworkUrl: typeof rawCust.backArtworkUrl === 'string' ? rawCust.backArtworkUrl : '',
          requirementDetails: typeof rawCust.requirementDetails === 'string' ? rawCust.requirementDetails : '',
          artwork: {
            x: typeof rawCust.artwork?.x === 'number' ? rawCust.artwork.x : 50,
            y: typeof rawCust.artwork?.y === 'number' ? rawCust.artwork.y : 45,
            width: typeof rawCust.artwork?.width === 'number' ? rawCust.artwork.width : 200,
            height: typeof rawCust.artwork?.height === 'number' ? rawCust.artwork.height : 200,
            rotation: typeof rawCust.artwork?.rotation === 'number' ? rawCust.artwork.rotation : 0,
            scale: typeof rawCust.artwork?.scale === 'number' ? rawCust.artwork.scale : 1,
          },
          frontArtwork: rawCust.frontArtwork,
          backArtwork: rawCust.backArtwork,
          price: 0,
        }
      }

      // 2. Process Front & Back Custom Text & Positions (+₹25 fee ONLY for Bihar T-Shirt)
      const isCustomTextAllowed = dbProduct?.id === 'kala-bihari-story-premium-t-shirt' || Boolean(dbProduct?.customPrintTextEnabled)
      const rawFrontText = isCustomTextAllowed ? (rawCust?.frontText || item.frontText) : ''
      const rawBackText = isCustomTextAllowed ? (rawCust?.backText || item.backText) : ''
      const hasFrontText = typeof rawFrontText === 'string' && rawFrontText.trim().length > 0
      const hasBackText = typeof rawBackText === 'string' && rawBackText.trim().length > 0

      if (isCustomTextAllowed && (hasFrontText || hasBackText)) {
        customPrice = dbProduct?.customPrintTextPrice || 25 // STRICT: Authoritative server-side ₹25 customization fee
        customizationData = {
          ...(customizationData || {}),
          ...(hasFrontText ? { frontText: rawFrontText.trim().slice(0, 50) } : {}),
          ...(hasBackText ? { backText: rawBackText.trim().slice(0, 50) } : {}),
          ...(rawCust?.frontPosition ? {
            frontPosition: {
              x: Number(rawCust.frontPosition.x) || 50,
              y: Number(rawCust.frontPosition.y) || 52,
            }
          } : {}),
          ...(rawCust?.backPosition ? {
            backPosition: {
              x: Number(rawCust.backPosition.x) || 50,
              y: Number(rawCust.backPosition.y) || 44,
            }
          } : {}),
          ...(rawCust?.frontFontSize ? {
            frontFontSize: Math.max(12, Math.min(72, Number(rawCust.frontFontSize)))
          } : {}),
          ...(rawCust?.backFontSize ? {
            backFontSize: Math.max(12, Math.min(72, Number(rawCust.backFontSize)))
          } : {}),
          price: (customizationData?.price || 0) + 25,
        }
      }

      // Proportional unit price in bundle mode vs standard catalog price
      const unitPrice = bundleData
        ? Math.round(bundleData.price / bundleData.slotCount)
        : baseProductPrice + customPrice

      return {
        productId: dbProduct ? dbProduct.id : (customFallback?.id || item.productId.trim()),
        vendorId: dbProduct?.vendorId || 'kala-admin',
        shopId: dbProduct?.shopId || '',
        name: productName,
        image: customizationData?.previewUrl || productImage,
        size: item.size.toUpperCase(),
        color: typeof item.color === 'string' ? item.color.trim() : (customizationData?.color || ''),
        quantity: Math.floor(Number(item.quantity)),
        price: unitPrice, // STRICT: ALWAYS authoritative server-side pricing
        ...(customizationData ? { customization: customizationData } : {}),
      }
    })

    // 8. Calculate Authoritative Subtotal on Server
    // CRITICAL SECURITY: Never trust frontend price. Bundle price is authoritatively set by server config.
    const subtotal = bundleData
      ? bundleData.price
      : verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
    // Free shipping policy on all orders / T-shirts (0 shipping charges)
    const shipping = 0
    const total = subtotal - discountAmount + shipping

    // 11. Generate Unique Order ID
    let orderId = generateOrderId()
    let existing = await Order.findOne({ orderId })
    while (existing) {
      orderId = generateOrderId()
      existing = await Order.findOne({ orderId })
    }

    // 12. Atomically decrement inventory to prevent overselling
    const stockDecremented: { productId: string; quantity: number }[] = []
    for (const item of verifiedItems) {
      const dbP = productMap.get(item.productId)
      if (dbP && typeof dbP.stock === 'number') {
        const updatedP = await Product.findOneAndUpdate(
          { _id: dbP._id, stock: { $gte: item.quantity } },
          {
            $inc: { stock: -item.quantity },
            $set: {
              status: dbP.stock - item.quantity <= 0 ? 'OUT_OF_STOCK' : (dbP.status || 'ACTIVE'),
            },
          },
          { new: true }
        )

        if (!updatedP) {
          // Roll back previous decrements
          for (const dec of stockDecremented) {
            await Product.updateOne({ id: dec.productId }, { $inc: { stock: dec.quantity } })
          }
          if (couponIncrementedId) {
            await Coupon.findByIdAndUpdate(couponIncrementedId, { $inc: { usageCount: -1 } }).catch(() => {})
          }
          res.status(400).json({
            success: false,
            message: `Item '${item.name}' went out of stock during checkout. Please adjust your cart quantity.`,
          })
          return
        }

        stockDecremented.push({ productId: item.productId, quantity: item.quantity })

        // Record inventory audit log
        await InventoryLog.create({
          productId: item.productId,
          vendorId: item.vendorId,
          action: 'ORDER_REDUCTION',
          change: -item.quantity,
          stockBefore: dbP.stock,
          stockAfter: updatedP.stock,
          orderId,
          reason: `Customer checkout for order ${orderId}`,
        }).catch((e) => console.warn('[InventoryLog] Failed to create log:', e))
      }
    }

    try {
      // 13. Save Order to MongoDB (attach authenticated userId and email strictly from verified JWT)
      const newOrder = await Order.create({
        orderId,
        userId: authenticatedUserId,
        customerName: `${customer.firstName.trim()} ${customer.lastName.trim()}`,
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
        ...(bundleData ? { bundle: bundleData } : {}),
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

      // 14. Create Multi-Vendor SubOrders & Ledger Transactions
      const platformSettings = await PlatformSettings.findOne({ key: 'default_settings' })
      const commissionRate = platformSettings?.commissionRate ?? 5

      // Group items by vendorId
      const vendorItemGroups: Record<string, typeof verifiedItems> = {}
      for (const it of verifiedItems) {
        const vId = it.vendorId || 'kala-admin'
        if (!vendorItemGroups[vId]) {
          vendorItemGroups[vId] = []
        }
        vendorItemGroups[vId].push(it)
      }

      let subOrderIndex = 1
      for (const [vId, vItems] of Object.entries(vendorItemGroups)) {
        const vSubtotal = vItems.reduce((acc, it) => acc + it.price * it.quantity, 0)
        const vCommission = Math.round((vSubtotal * commissionRate) / 100)
        const vNetEarnings = vSubtotal - vCommission
        const subOrderId = `${orderId}-V${subOrderIndex++}`

        await SubOrder.create({
          subOrderId,
          orderId,
          vendorId: vId,
          shopId: vItems[0]?.shopId || '',
          customer: newOrder.customer,
          shippingAddress: newOrder.shippingAddress,
          items: vItems,
          subtotal: vSubtotal,
          commissionRate,
          commissionAmount: vCommission,
          netEarnings: vNetEarnings,
          status: 'pending',
          payoutStatus: 'pending',
          statusHistory: [{ status: 'pending', changedAt: new Date(), note: 'Suborder generated from checkout' }],
        }).catch((err) => console.error('[OrderController] SubOrder creation error:', err))

        // Record financial ledger entry
        if (vId !== 'kala-admin') {
          await Transaction.create({
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            vendorId: vId,
            orderId,
            subOrderId,
            type: 'ORDER_SALE',
            amount: vNetEarnings,
            balanceAfter: vNetEarnings,
            description: `Order sale for ${subOrderId} (Net after ${commissionRate}% commission)`,
          }).catch((err) => console.error('[OrderController] Transaction creation error:', err))
        }
      }

      // Dispatch order alert email to admin dhoreniraj83@gmail.com
      sendOrderPlacedAlert(newOrder).catch((alertErr) => {
        console.error('[OrderController] Failed to send order placed alert to admin:', alertErr)
      })

      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        message: 'Order created successfully',
      })
    } catch (orderSaveError) {
      // Rollback stock decrements on failure
      for (const dec of stockDecremented) {
        await Product.updateOne({ id: dec.productId }, { $inc: { stock: dec.quantity } }).catch(() => {})
      }
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

/**
 * PUT /api/orders/:orderId/cancel
 * Allows authenticated customer to cancel eligible orders (pending or confirmed).
 * Restores inventory stock atomically and marks SubOrders cancelled.
 */
export const cancelMyOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuthenticatedUser(req)
    if (auth.error || !auth.user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const { orderId } = req.params
    const { reason } = req.body

    const order = await Order.findOne({
      orderId,
      $or: [
        { userId: auth.user.userId },
        { 'customer.email': auth.user.email.toLowerCase() },
      ],
    })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' })
      return
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in its current state ('${order.status}'). Only pending or confirmed orders can be cancelled.`,
      })
      return
    }

    order.status = 'cancelled'
    order.statusHistory = order.statusHistory || []
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      note: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
      changedBy: auth.user.email,
    })
    await order.save()

    // Restore inventory stock atomically for each item
    for (const item of order.items) {
      const p = await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: item.quantity }, $set: { available: true } },
        { new: true }
      )
      if (p) {
        await InventoryLog.create({
          productId: item.productId,
          vendorId: item.vendorId,
          action: 'CANCEL_RESTORATION',
          change: item.quantity,
          stockBefore: (p.stock || 0) - item.quantity,
          stockAfter: p.stock || 0,
          orderId: order.orderId,
          reason: `Restoration from order cancellation: ${order.orderId}`,
        }).catch(() => {})
      }
    }

    // Update SubOrders
    await SubOrder.updateMany(
      { orderId: order.orderId },
      {
        $set: { status: 'cancelled' },
        $push: {
          statusHistory: {
            status: 'cancelled',
            changedAt: new Date(),
            note: 'Order cancelled by customer',
            changedBy: auth.user.email,
          },
        },
      }
    )

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      order,
    })
  } catch (error: any) {
    console.error('[OrderController] cancelMyOrder error:', error)
    res.status(500).json({ success: false, message: 'Server error while cancelling order' })
  }
}

/**
 * POST /api/orders/:orderId/return
 * Submits a return/refund request for delivered orders.
 */
export const requestReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuthenticatedUser(req)
    if (auth.error || !auth.user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const { orderId } = req.params
    const { reason } = req.body

    const order = await Order.findOne({
      orderId,
      $or: [
        { userId: auth.user.userId },
        { 'customer.email': auth.user.email.toLowerCase() },
      ],
    })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' })
      return
    }

    order.statusHistory = order.statusHistory || []
    order.statusHistory.push({
      status: 'cancelled', // OrderStatus union
      changedAt: new Date(),
      note: `Return/Refund requested by customer: ${reason || 'Customer request'}`,
      changedBy: auth.user.email,
    })
    await order.save()

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully. Our team will review within 24-48 hours.',
      order,
    })
  } catch (error: any) {
    console.error('[OrderController] requestReturn error:', error)
    res.status(500).json({ success: false, message: 'Server error while submitting return request' })
  }
}
