import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
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

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, shippingAddress, items } = req.body

    // 1. Validate Customer Information
    if (
      !customer ||
      !customer.firstName?.trim() ||
      !customer.lastName?.trim() ||
      !customer.email?.trim() ||
      !customer.phone?.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid order data: Complete customer information (firstName, lastName, email, phone) is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customer.email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Invalid order data: Please provide a valid email address.',
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
      if (!item.productId || typeof item.productId !== 'string') {
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

    // 5. Fetch Actual Products from MongoDB
    const productIds = items.map((i) => i.productId)
    const dbProducts = await Product.find({ id: { $in: productIds } })
    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // 6. Verify All Product IDs Exist in MongoDB
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        res.status(404).json({
          success: false,
          message: `Product not found: No product found with ID '${item.productId}'.`,
        })
        return
      }
    }

    // 7. Construct Verified Items & NEVER Trust Frontend Price
    const verifiedItems = items.map((item) => {
      const dbProduct = productMap.get(item.productId)!
      return {
        productId: dbProduct.id,
        name: dbProduct.name,
        image: dbProduct.image,
        size: item.size.toUpperCase(),
        quantity: Math.floor(Number(item.quantity)),
        price: dbProduct.price, // STRICT: ALWAYS use verified DB price
      }
    })

    // 8. Calculate Subtotal, Shipping, and Total on Server
    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Shipping rule: subtotal >= 2000 -> shipping = 0, else 99
    const shipping = subtotal >= 2000 ? 0 : 99
    const total = subtotal + shipping

    // 9. Generate Unique Order ID
    let orderId = generateOrderId()
    // Collision safety check
    let existing = await Order.findOne({ orderId })
    while (existing) {
      orderId = generateOrderId()
      existing = await Order.findOne({ orderId })
    }

    // 10. Save Order to MongoDB
    const newOrder = await Order.create({
      orderId,
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim().toLowerCase(),
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
        shipping,
        total,
      },
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      orderId: newOrder.orderId,
      order: newOrder,
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('[OrderController] createOrder error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message,
    })
  }
}

// GET /api/orders/:orderId
export const getOrderById = async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('[OrderController] getOrderById error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving order',
      error: error.message,
    })
  }
}
