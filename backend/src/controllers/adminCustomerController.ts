import { Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import mongoose from 'mongoose'
import { User, IUser } from '../models/User'
import { Order } from '../models/Order'

/**
 * GET /api/admin/customers
 * Retrieves customer accounts (excluding admins) with pagination, search, and order counts.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    // Only customers: role is 'customer' or missing/null for legacy users; strictly exclude admins
    const filter: FilterQuery<IUser> = {
      role: { $ne: 'admin' },
    }

    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$and = [
        { role: { $ne: 'admin' } },
        {
          $or: [
            { userId: regex },
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { phone: regex },
          ],
        },
      ]
      delete filter.role
    }

    const [total, rawCustomers] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    // Efficiently compute order counts for the current page without N+1 query loop
    const userIds = rawCustomers.map((c) => c.userId).filter(Boolean)
    const emails = rawCustomers.map((c) => c.email?.toLowerCase()).filter(Boolean)

    const customerOrderSets = new Map<string, Set<string>>()
    for (const c of rawCustomers) {
      customerOrderSets.set(c.userId, new Set<string>())
    }

    if (userIds.length > 0 || emails.length > 0) {
      const orders = await Order.find({
        $or: [
          { userId: { $in: userIds } },
          { 'customer.email': { $in: emails } },
        ],
      })
        .select('orderId userId customer.email')
        .lean()

      for (const ord of orders) {
        for (const c of rawCustomers) {
          const matchesUserId = ord.userId && ord.userId === c.userId
          const matchesEmail =
            ord.customer?.email &&
            c.email &&
            ord.customer.email.toLowerCase() === c.email.toLowerCase()

          if (matchesUserId || matchesEmail) {
            customerOrderSets.get(c.userId)?.add(ord.orderId)
          }
        }
      }
    }

    const customers = rawCustomers.map((c) => {
      const orderCount = customerOrderSets.get(c.userId)?.size || 0

      return {
        userId: c.userId,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        role: c.role || 'customer',
        orderCount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }
    })

    res.status(200).json({
      success: true,
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCustomerController] getAdminCustomers error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving customers list.',
    })
  }
}

/**
 * GET /api/admin/customers/:userId
 * Retrieves detailed customer profile information and order count.
 * Excludes administrators.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Customer User ID is required.',
      })
      return
    }

    let customer = await User.findOne({ userId: userId.trim() })
    if (!customer && mongoose.Types.ObjectId.isValid(userId.trim())) {
      customer = await User.findById(userId.trim())
    }

    // Never expose admins through customer management endpoints
    if (!customer || customer.role === 'admin') {
      res.status(404).json({
        success: false,
        message: 'Customer not found.',
      })
      return
    }

    const orderCount = await Order.countDocuments({
      $or: [
        { userId: customer.userId },
        { 'customer.email': customer.email.toLowerCase() },
      ],
    })

    res.status(200).json({
      success: true,
      customer: {
        userId: customer.userId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        role: customer.role || 'customer',
        orderCount,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCustomerController] getAdminCustomerById error:',
      error instanceof Error ? error.message : 'Unknown customer lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving customer details.',
    })
  }
}

/**
 * GET /api/admin/customers/:userId/orders
 * Retrieves all orders belonging to a specific customer without customer ownership restrictions.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Customer User ID is required.',
      })
      return
    }

    let customer = await User.findOne({ userId: userId.trim() })
    if (!customer && mongoose.Types.ObjectId.isValid(userId.trim())) {
      customer = await User.findById(userId.trim())
    }

    if (!customer || customer.role === 'admin') {
      res.status(404).json({
        success: false,
        message: 'Customer not found.',
      })
      return
    }

    const orders = await Order.find({
      $or: [
        { userId: customer.userId },
        { 'customer.email': customer.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      orders,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCustomerController] getAdminCustomerOrders error:',
      error instanceof Error ? error.message : 'Unknown order lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving customer order history.',
    })
  }
}

/**
 * PATCH /api/admin/customers/:userId
 * Safely updates allowed customer profile fields (firstName, lastName, phone).
 * Rejects role escalation, email change, userId change, password changes, or MongoDB query operators.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const body = req.body

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Customer User ID is required.',
      })
      return
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: 'Invalid request body.',
      })
      return
    }

    // Strict whitelist: Only firstName, lastName, phone are allowed
    const allowedFields = ['firstName', 'lastName', 'phone']
    for (const key of Object.keys(body)) {
      if (!allowedFields.includes(key)) {
        res.status(400).json({
          success: false,
          message: `Field '${key}' is prohibited or not allowed for modification.`,
        })
        return
      }
      if (key.startsWith('$')) {
        res.status(400).json({
          success: false,
          message: 'MongoDB query update operators are not permitted.',
        })
        return
      }
    }

    let customer = await User.findOne({ userId: userId.trim() })
    if (!customer && mongoose.Types.ObjectId.isValid(userId.trim())) {
      customer = await User.findById(userId.trim())
    }

    if (!customer || customer.role === 'admin') {
      res.status(404).json({
        success: false,
        message: 'Customer not found.',
      })
      return
    }

    const { firstName, lastName, phone } = body
    const updates: Partial<{ firstName: string; lastName: string; phone: string }> = {}

    // 1. Validate firstName
    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || !firstName.trim()) {
        res.status(400).json({
          success: false,
          message: 'First name cannot be empty.',
        })
        return
      }
      if (firstName.trim().length < 2 || firstName.trim().length > 50) {
        res.status(400).json({
          success: false,
          message: 'First name must be between 2 and 50 characters.',
        })
        return
      }
      updates.firstName = firstName.trim()
    }

    // 2. Validate lastName
    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || !lastName.trim()) {
        res.status(400).json({
          success: false,
          message: 'Last name cannot be empty.',
        })
        return
      }
      if (lastName.trim().length < 1 || lastName.trim().length > 50) {
        res.status(400).json({
          success: false,
          message: 'Last name must be between 1 and 50 characters.',
        })
        return
      }
      updates.lastName = lastName.trim()
    }

    // 3. Validate phone
    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        res.status(400).json({
          success: false,
          message: 'Phone number cannot be empty.',
        })
        return
      }
      const cleanPhone = phone.trim().replace(/[\s-+]/g, '').replace(/^91(?=[6-9]\d{9}$)/, '')
      const phoneRegex = /^[6-9]\d{9}$/
      if (!phoneRegex.test(cleanPhone)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid 10-digit Indian phone number.',
        })
        return
      }
      updates.phone = cleanPhone
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid update fields provided. Allowed fields: firstName, lastName, phone.',
      })
      return
    }

    // Apply safe updates
    if (updates.firstName) customer.firstName = updates.firstName
    if (updates.lastName) customer.lastName = updates.lastName
    if (updates.phone) customer.phone = updates.phone

    await customer.save()

    res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully.',
      customer: {
        userId: customer.userId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        role: customer.role || 'customer',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminCustomerController] updateAdminCustomer error:',
      error instanceof Error ? error.message : 'Unknown customer update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer profile.',
    })
  }
}
