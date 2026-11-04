import { Request, Response } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { VendorProfile } from '../models/VendorProfile'
import { VendorShop } from '../models/VendorShop'
import { Product } from '../models/Product'
import { Order } from '../models/Order'
import { SubOrder } from '../models/SubOrder'
import { PlatformSettings } from '../models/PlatformSettings'
import { Transaction } from '../models/Transaction'
import { Payout } from '../models/Payout'
import { InventoryLog } from '../models/InventoryLog'

function generateUserId(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-VND-${randomSuffix}`
}

function generateProductId(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PROD-VND-${randomSuffix}`
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * POST /api/vendors/register
 * Handles vendor registration, account creation, and vendor profile in PENDING status.
 */
export const registerVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      firstName,
      lastName,
      email,
      phone,
      password,
      businessName,
      category,
      description,
      businessEmail,
      businessPhone,
      city,
      state,
      address,
    } = req.body

    // 1. Validate Personal Info
    let fName = firstName || ''
    let lName = lastName || ''
    if (!fName && fullName) {
      const parts = fullName.trim().split(/\s+/)
      fName = parts[0] || 'Vendor'
      lName = parts.slice(1).join(' ') || 'Partner'
    }

    if (!fName || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      })
      return
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      })
      return
    }

    if (String(password).length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      })
      return
    }

    // 2. Validate Business Info
    if (!businessName || !businessName.trim()) {
      res.status(400).json({
        success: false,
        message: 'Business name is required.',
      })
      return
    }

    if (!category || !category.trim()) {
      res.status(400).json({
        success: false,
        message: 'Business category is required.',
      })
      return
    }

    if (!city || !state) {
      res.status(400).json({
        success: false,
        message: 'City and state are required.',
      })
      return
    }

    // 3. Check for existing user or vendor profile
    let user = await User.findOne({ email: normalizedEmail })
    let userId = user ? user.userId : ''

    if (user) {
      const existingProfile = await VendorProfile.findOne({ userId: user.userId })
      if (existingProfile) {
        res.status(409).json({
          success: false,
          message: 'A vendor application already exists for this email address.',
        })
        return
      }
      // Upgrade existing user role to vendor
      user.role = 'vendor'
      await user.save()
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(String(password), 10)
      userId = generateUserId()

      user = await User.create({
        userId,
        firstName: fName.trim(),
        lastName: lName.trim() || 'Vendor',
        email: normalizedEmail,
        phone: String(phone || businessPhone || '0000000000').trim(),
        passwordHash,
        role: 'vendor',
      })
    }

    // 4. Create VendorProfile with status PENDING
    const vendorProfile = await VendorProfile.create({
      userId,
      businessName: businessName.trim(),
      category: category.trim(),
      description: (description || '').trim(),
      email: (businessEmail || normalizedEmail).trim().toLowerCase(),
      phone: String(businessPhone || phone || user.phone).trim(),
      address: (address || '').trim(),
      city: city.trim(),
      state: state.trim(),
      status: 'PENDING',
    })

    // 5. Sign token for seamless session
    const jwtSecret = process.env.JWT_SECRET || 'kala_fallback_jwt_secret'
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. Pending administrator approval.',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      vendorProfile,
    })
  } catch (error: any) {
    console.error('[vendorController] registerVendor error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while submitting vendor application.',
    })
  }
}

/**
 * GET /api/vendors/me
 * Retrieves current vendor profile, user info, and shop.
 */
export const getVendorMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const user = await User.findOne({ userId })
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }

    const vendorProfile = await VendorProfile.findOne({ userId })
    const shop = await VendorShop.findOne({ vendorId: userId })

    res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      vendorProfile: vendorProfile || null,
      shop: shop || null,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorMe error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving vendor data.' })
  }
}

/**
 * GET /api/vendors/me/status
 * Lightweight check of vendor approval status.
 */
export const getVendorStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const vendorProfile = await VendorProfile.findOne({ userId })

    if (!vendorProfile) {
      res.status(404).json({
        success: false,
        message: 'No vendor profile found for this account.',
        status: 'NONE',
      })
      return
    }

    res.status(200).json({
      success: true,
      status: vendorProfile.status,
      businessName: vendorProfile.businessName,
      category: vendorProfile.category,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error checking status.' })
  }
}

/**
 * PUT /api/vendors/me
 * Updates vendor business profile.
 */
export const updateVendorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { businessName, category, description, phone, address, city, state } = req.body

    const vendorProfile = await VendorProfile.findOne({ userId })
    if (!vendorProfile) {
      res.status(404).json({ success: false, message: 'Vendor profile not found.' })
      return
    }

    if (businessName) vendorProfile.businessName = businessName.trim()
    if (category) vendorProfile.category = category.trim()
    if (description !== undefined) vendorProfile.description = description.trim()
    if (phone) vendorProfile.phone = phone.trim()
    if (address !== undefined) vendorProfile.address = address.trim()
    if (city) vendorProfile.city = city.trim()
    if (state) vendorProfile.state = state.trim()

    await vendorProfile.save()

    res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully.',
      vendorProfile,
    })
  } catch (error: any) {
    console.error('[vendorController] updateVendorProfile error:', error)
    res.status(500).json({ success: false, message: 'Server error updating profile.' })
  }
}

/**
 * POST /api/vendor/shop
 * Creates vendor storefront. Requires APPROVED status.
 */
export const createVendorShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const existingShop = await VendorShop.findOne({ vendorId: userId })
    if (existingShop) {
      res.status(409).json({
        success: false,
        message: 'You already have an established shop storefront.',
        shop: existingShop,
      })
      return
    }

    const {
      shopName,
      description,
      category,
      contactEmail,
      contactPhone,
      city,
      state,
      address,
      logo,
      banner,
    } = req.body

    if (!shopName || !shopName.trim()) {
      res.status(400).json({ success: false, message: 'Shop name is required.' })
      return
    }

    if (!contactEmail || !contactPhone || !city || !state) {
      res.status(400).json({
        success: false,
        message: 'Contact email, phone, city, and state are required.',
      })
      return
    }

    // Auto-generate clean unique slug
    let baseSlug = slugify(shopName)
    if (!baseSlug) baseSlug = `shop-${userId.toLowerCase()}`

    let slug = baseSlug
    let counter = 1
    while (await VendorShop.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const shop = await VendorShop.create({
      vendorId: userId,
      shopName: shopName.trim(),
      slug,
      description: (description || '').trim(),
      category: (category || 'General').trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      city: city.trim(),
      state: state.trim(),
      address: (address || '').trim(),
      logo: (logo || '').trim(),
      banner: (banner || '').trim(),
      isActive: true,
    })

    res.status(201).json({
      success: true,
      message: 'Shop storefront created successfully!',
      shop,
    })
  } catch (error: any) {
    console.error('[vendorController] createVendorShop error:', error)
    res.status(500).json({ success: false, message: 'Server error creating shop storefront.' })
  }
}

/**
 * GET /api/vendor/shop
 * Retrieves current vendor shop storefront details.
 */
export const getVendorShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const shop = await VendorShop.findOne({ vendorId: userId })

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found. Please create your shop.' })
      return
    }

    res.status(200).json({ success: true, shop })
  } catch (error: any) {
    console.error('[vendorController] getVendorShop error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving shop.' })
  }
}

/**
 * PUT /api/vendor/shop
 * Updates vendor shop storefront details.
 */
export const updateVendorShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const shop = await VendorShop.findOne({ vendorId: userId })

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found.' })
      return
    }

    const {
      shopName,
      description,
      category,
      contactEmail,
      contactPhone,
      city,
      state,
      address,
      logo,
      banner,
      isActive,
    } = req.body

    if (shopName) shop.shopName = shopName.trim()
    if (description !== undefined) shop.description = description.trim()
    if (category) shop.category = category.trim()
    if (contactEmail) shop.contactEmail = contactEmail.trim().toLowerCase()
    if (contactPhone) shop.contactPhone = contactPhone.trim()
    if (city) shop.city = city.trim()
    if (state) shop.state = state.trim()
    if (address !== undefined) shop.address = address.trim()
    if (logo !== undefined) shop.logo = logo.trim()
    if (banner !== undefined) shop.banner = banner.trim()
    if (typeof isActive === 'boolean') shop.isActive = isActive

    await shop.save()

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully.',
      shop,
    })
  } catch (error: any) {
    console.error('[vendorController] updateVendorShop error:', error)
    res.status(500).json({ success: false, message: 'Server error updating shop.' })
  }
}

/**
 * GET /api/vendor/stats
 * Aggregates live sales, products, and order analytics for the authenticated vendor.
 */
export const getVendorStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    // 1. Fetch vendor products
    const products = await Product.find({ vendorId: userId })
    const productIds = products.flatMap((p) => [p.id, String(p._id)].filter(Boolean))

    const totalProducts = products.length
    const activeProducts = products.filter(
      (p) => (p.approvalStatus === 'APPROVED' || !p.approvalStatus) && p.available
    ).length
    const pendingProducts = products.filter((p) => p.approvalStatus === 'PENDING').length
    const draftProducts = products.filter((p) => p.approvalStatus === 'DRAFT').length
    const rejectedProducts = products.filter((p) => p.approvalStatus === 'REJECTED').length

    // 2. Fetch platform commission settings
    const settings = await PlatformSettings.findOne({ key: 'default_settings' })
    const commissionRate = settings?.commissionRate ?? 5

    // 3. Fetch orders containing any of this vendor's products
    let totalOrders = 0
    let pendingOrders = 0
    let productsSold = 0
    let grossSales = 0
    let vendorOrdersList: any[] = []

    if (productIds.length > 0) {
      const orders = await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 })
      totalOrders = orders.length

      orders.forEach((order) => {
        const matchingItems = order.items.filter((item) => productIds.includes(item.productId))
        const orderVendorSum = matchingItems.reduce(
          (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
          0
        )
        const orderVendorQty = matchingItems.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        )

        // Don't add cancelled orders to earnings
        if (order.status !== 'cancelled') {
          grossSales += orderVendorSum
          productsSold += orderVendorQty
        }

        if (['pending', 'confirmed', 'processing'].includes(order.status)) {
          pendingOrders++
        }
      })

      // Get last 5 orders for summary
      vendorOrdersList = orders.slice(0, 5).map((order) => {
        const matchingItems = order.items.filter((item) => productIds.includes(item.productId))
        return {
          orderId: order.orderId,
          createdAt: order.createdAt,
          status: order.status,
          customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer',
          itemsCount: matchingItems.reduce((acc, item) => acc + item.quantity, 0),
          total: matchingItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }
      })
    }

    const commissionDeducted = Math.round((grossSales * commissionRate) / 100)
    const netEarnings = Math.max(0, grossSales - commissionDeducted)

    // 4. Fetch Payouts summary
    const payouts = await Payout.find({ vendorId: userId })
    const pendingPayouts = payouts
      .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + p.amount, 0)
    const completedPayouts = payouts
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)
    const availablePayout = Math.max(0, netEarnings - pendingPayouts - completedPayouts)

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        pendingProducts,
        draftProducts,
        rejectedProducts,
        totalOrders,
        pendingOrders,
        productsSold,
        grossSales,
        commissionRate,
        commissionDeducted,
        netEarnings,
        pendingPayouts,
        availablePayout,
        completedPayouts,
        totalEarnings: grossSales, // backward compatibility
      },
      recentOrders: vendorOrdersList,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorStats error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving vendor stats.' })
  }
}

/**
 * GET /api/vendor/analytics
 * Provides time-bucketed revenue metrics, charts, best-selling products, and recent ledger transactions.
 */
export const getVendorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { period, startDate, endDate } = req.query

    // 1. Fetch products
    const products = await Product.find({ vendorId: userId })
    const productIds = products.flatMap((p) => [p.id, String(p._id)].filter(Boolean))

    const settings = await PlatformSettings.findOne({ key: 'default_settings' })
    const commissionRate = settings?.commissionRate ?? 5

    if (productIds.length === 0) {
      res.status(200).json({
        success: true,
        timeline: [],
        bestSellers: [],
        recentTransactions: [],
        summary: {
          grossSales: 0,
          netEarnings: 0,
          ordersCount: 0,
          productsSold: 0,
        },
      })
      return
    }

    // 2. Query non-cancelled orders
    const query: any = {
      'items.productId': { $in: productIds },
      status: { $ne: 'cancelled' },
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate as string)
      if (endDate) query.createdAt.$lte = new Date(endDate as string)
    }

    const orders = await Order.find(query).sort({ createdAt: 1 })

    // 3. Time-bucket analytics (Daily past 30 days or based on period)
    const timelineMap: Record<string, { label: string; date: string; revenue: number; net: number; orders: number; units: number }> = {}

    // Initialize daily buckets for past 14 days by default if no range given
    const now = new Date()
    const daysToShow = period === 'weekly' ? 12 : period === 'monthly' ? 12 : 14

    if (period === 'monthly') {
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        timelineMap[key] = { label, date: key, revenue: 0, net: 0, orders: 0, units: 0 }
      }
    } else {
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        timelineMap[key] = { label, date: key, revenue: 0, net: 0, orders: 0, units: 0 }
      }
    }

    // Accumulate best seller metrics
    const productSalesMap: Record<string, { id: string; name: string; image: string; unitsSold: number; revenue: number }> = {}
    products.forEach((p) => {
      productSalesMap[p.id] = {
        id: p.id,
        name: p.name,
        image: p.image,
        unitsSold: 0,
        revenue: 0,
      }
    })

    let totalGross = 0
    let totalUnits = 0

    orders.forEach((ord) => {
      const orderDateStr = ord.createdAt.toISOString().split('T')[0]
      const orderMonthStr = `${ord.createdAt.getFullYear()}-${String(ord.createdAt.getMonth() + 1).padStart(2, '0')}`
      const bucketKey = period === 'monthly' ? orderMonthStr : orderDateStr

      const matching = ord.items.filter((it) => productIds.includes(it.productId))
      const orderRev = matching.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
      const orderUnits = matching.reduce((s, it) => s + (it.quantity || 1), 0)

      totalGross += orderRev
      totalUnits += orderUnits

      if (timelineMap[bucketKey]) {
        timelineMap[bucketKey].revenue += orderRev
        timelineMap[bucketKey].net += Math.round(orderRev * (1 - commissionRate / 100))
        timelineMap[bucketKey].orders += 1
        timelineMap[bucketKey].units += orderUnits
      }

      matching.forEach((it) => {
        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = {
            id: it.productId,
            name: it.name,
            image: it.image,
            unitsSold: 0,
            revenue: 0,
          }
        }
        productSalesMap[it.productId].unitsSold += it.quantity
        productSalesMap[it.productId].revenue += it.price * it.quantity
      })
    })

    const bestSellers = Object.values(productSalesMap)
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10)

    const recentTransactions = await Transaction.find({ vendorId: userId })
      .sort({ createdAt: -1 })
      .limit(10)

    res.status(200).json({
      success: true,
      timeline: Object.values(timelineMap),
      bestSellers,
      recentTransactions,
      summary: {
        grossSales: totalGross,
        netEarnings: Math.round(totalGross * (1 - commissionRate / 100)),
        ordersCount: orders.length,
        productsSold: totalUnits,
        commissionRate,
      },
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorAnalytics error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving analytics.' })
  }
}

/**
 * GET /api/vendor/transactions
 * Returns auditable financial transactions ledger for the vendor.
 */
export const getVendorTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { type, limit } = req.query
    const query: any = { vendorId: userId }
    if (type && typeof type === 'string' && type !== 'ALL') {
      query.type = type.toUpperCase()
    }

    const maxLimit = limit ? Math.min(100, Number(limit)) : 50
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).limit(maxLimit)

    res.status(200).json({
      success: true,
      transactions,
      count: transactions.length,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorTransactions error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving transactions.' })
  }
}

/**
 * GET /api/vendor/payouts
 * Returns payout history for the vendor.
 */
export const getVendorPayouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const payouts = await Payout.find({ vendorId: userId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      payouts,
      count: payouts.length,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorPayouts error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving payouts.' })
  }
}

/**
 * POST /api/vendor/payouts
 * Submits a new payout request after validating available balance and bank details.
 */
export const requestVendorPayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { amount, bankDetails } = req.body
    const numericAmount = Number(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ success: false, message: 'Valid positive payout amount is required.' })
      return
    }

    const settings = await PlatformSettings.findOne({ key: 'default_settings' })
    const minPayout = settings?.payoutMinimumAmount ?? 500
    if (numericAmount < minPayout) {
      res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₹${minPayout}.`,
      })
      return
    }

    // Check available balance
    const products = await Product.find({ vendorId: userId })
    const productIds = products.flatMap((p) => [p.id, String(p._id)].filter(Boolean))

    const commissionRate = settings?.commissionRate ?? 5
    let gross = 0
    if (productIds.length > 0) {
      const orders = await Order.find({ 'items.productId': { $in: productIds }, status: { $ne: 'cancelled' } })
      orders.forEach((o) => {
        const matches = o.items.filter((it) => productIds.includes(it.productId))
        gross += matches.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
      })
    }

    const net = Math.max(0, gross - Math.round((gross * commissionRate) / 100))
    const existingPayouts = await Payout.find({ vendorId: userId })
    const alreadyDrawn = existingPayouts
      .filter((p) => p.status !== 'REJECTED')
      .reduce((s, p) => s + p.amount, 0)
    const available = Math.max(0, net - alreadyDrawn)

    if (numericAmount > available) {
      res.status(400).json({
        success: false,
        message: `Requested amount (₹${numericAmount}) exceeds available balance (₹${available}).`,
      })
      return
    }

    const payoutId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const payout = await Payout.create({
      payoutId,
      vendorId: userId,
      amount: numericAmount,
      status: 'PENDING',
      bankDetails: bankDetails || {},
    })

    // Log transaction debit
    await Transaction.create({
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      vendorId: userId,
      payoutId,
      type: 'PAYOUT',
      amount: -numericAmount,
      balanceAfter: available - numericAmount,
      description: `Payout request ${payoutId} submitted for review`,
    })

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully. Processing typically takes 2-5 business days.',
      payout,
      availableBalance: available - numericAmount,
    })
  } catch (error: any) {
    console.error('[vendorController] requestVendorPayout error:', error)
    res.status(500).json({ success: false, message: 'Server error requesting payout.' })
  }
}

/**
 * GET /api/vendor/reports/download
 * Generates an exportable sales summary report.
 */
export const downloadSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const products = await Product.find({ vendorId: userId })
    const productIds = products.flatMap((p) => [p.id, String(p._id)].filter(Boolean))

    const orders = await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 })

    const rows: any[] = []
    orders.forEach((o) => {
      const vendorItems = o.items.filter((it) => productIds.includes(it.productId))
      vendorItems.forEach((it) => {
        rows.push({
          orderId: o.orderId,
          date: o.createdAt.toISOString().split('T')[0],
          productId: it.productId,
          productName: it.name,
          size: it.size,
          color: it.color || '-',
          quantity: it.quantity,
          unitPrice: it.price,
          totalPrice: it.price * it.quantity,
          orderStatus: o.status,
          customerName: `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
          shippingCity: o.shippingAddress?.city,
          shippingState: o.shippingAddress?.state,
        })
      })
    })

    res.status(200).json({
      success: true,
      salesData: rows,
      totalRows: rows.length,
    })
  } catch (error: any) {
    console.error('[vendorController] downloadSalesReport error:', error)
    res.status(500).json({ success: false, message: 'Server error generating sales report.' })
  }
}

/**
 * GET /api/vendor/orders
 * Returns orders containing products sold by this vendor.
 */
export const getVendorOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { status, search } = req.query

    // 1. Find all product IDs for this vendor
    const vendorProducts = await Product.find({ vendorId: userId }).select('id _id name price image')
    const productIds = vendorProducts.flatMap((p) => [p.id, p._id ? p._id.toString() : '']).filter(Boolean)

    if (productIds.length === 0) {
      const hasVendorItems = await Order.exists({ 'items.vendorId': userId })
      if (!hasVendorItems) {
        res.status(200).json({
          success: true,
          orders: [],
          count: 0,
        })
        return
      }
    }

    // 2. Query orders
    const query: any = {
      $or: [
        { 'items.vendorId': userId },
        { 'items.productId': { $in: productIds } },
      ],
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      query.status = status.toLowerCase()
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$and = [
        {
          $or: [
            { 'items.vendorId': userId },
            { 'items.productId': { $in: productIds } },
          ],
        },
        {
          $or: [
            { orderId: searchRegex },
            { 'customer.firstName': searchRegex },
            { 'customer.lastName': searchRegex },
            { 'customer.email': searchRegex },
            { 'customer.phone': searchRegex },
          ],
        },
      ]
      delete query.$or
    }

    const rawOrders = await Order.find(query).sort({ createdAt: -1 })

    // 3. Transform orders so vendor only sees their own items and authorized customer delivery info
    const transformedOrders = rawOrders.map((order) => {
      const vendorItems = order.items.filter(
        (item) => item.vendorId === userId || productIds.includes(item.productId)
      )
      const vendorTotal = vendorItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
        0
      )

      return {
        orderId: order.orderId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        customer: {
          firstName: order.customer?.firstName || 'Customer',
          lastName: order.customer?.lastName || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
        },
        shippingAddress: order.shippingAddress,
        items: vendorItems,
        vendorTotal,
        tracking: order.tracking || {},
      }
    })

    res.status(200).json({
      success: true,
      orders: transformedOrders,
      count: transformedOrders.length,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorOrders error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving vendor orders.' })
  }
}

/**
 * PUT /api/vendor/orders/:orderId/status
 * Updates status or tracking details of an order containing the vendor's items.
 */
export const updateVendorOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const { orderId } = req.params
    const { status, trackingNumber, carrier } = req.body

    const vendorProducts = await Product.find({ vendorId: userId }).select('id _id')
    const productIds = vendorProducts.flatMap((p) => [p.id, p._id ? p._id.toString() : '']).filter(Boolean)

    const order = await Order.findOne({
      orderId,
      $or: [
        { 'items.vendorId': userId },
        { 'items.productId': { $in: productIds } },
      ],
    })

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or contains no items from your store.' })
      return
    }

    if (status) {
      const validStatuses = ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
      if (!validStatuses.includes(status.toLowerCase())) {
        res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
        return
      }
      order.status = status.toLowerCase() as any
    }

    if (trackingNumber !== undefined || carrier !== undefined) {
      order.tracking = {
        ...order.tracking,
        trackingNumber: trackingNumber !== undefined ? String(trackingNumber).trim() : order.tracking?.trackingNumber,
        carrier: carrier !== undefined ? String(carrier).trim() : order.tracking?.carrier,
        updatedAt: new Date(),
      }
    }

    await order.save()

    // Also update this vendor's segregated SubOrder record
    const subOrderUpdate: any = {}
    if (status) {
      subOrderUpdate.status = status.toLowerCase()
    }
    if (trackingNumber !== undefined || carrier !== undefined) {
      subOrderUpdate.tracking = {
        trackingNumber: trackingNumber !== undefined ? String(trackingNumber).trim() : undefined,
        carrier: carrier !== undefined ? String(carrier).trim() : undefined,
        updatedAt: new Date(),
      }
    }
    await SubOrder.findOneAndUpdate(
      { orderId, vendorId: userId },
      subOrderUpdate,
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order: {
        orderId: order.orderId,
        status: order.status,
        tracking: order.tracking,
      },
    })
  } catch (error: any) {
    console.error('[vendorController] updateVendorOrderStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error updating order.' })
  }
}

/**
 * GET /api/vendor/products
 * Retrieves all products uploaded by the authenticated vendor.
 */
export const getVendorProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const products = await Product.find({ vendorId: userId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error: any) {
    console.error('[vendorController] getVendorProducts error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving vendor products.' })
  }
}

/**
 * POST /api/vendor/products
 * Creates a new vendor product. Supports Save Draft and Submit for Approval.
 */
export const createVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const shop = await VendorShop.findOne({ vendorId: userId })
    const vendorProfile = await VendorProfile.findOne({ userId })

    const {
      name,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      mrp,
      image,
      images,
      sizes,
      colors,
      stock,
      sku,
      shippingInfo,
      approvalStatus, // 'DRAFT' | 'PENDING' | 'APPROVED'
    } = req.body

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Product name is required.' })
      return
    }

    if (!category || !category.trim()) {
      res.status(400).json({ success: false, message: 'Product category is required.' })
      return
    }

    const numericPrice = Number(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      res.status(400).json({ success: false, message: 'Valid selling price is required.' })
      return
    }

    const primaryImage =
      (typeof image === 'string' && image.trim()) ||
      (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' ? images[0].trim() : '')

    if (!primaryImage) {
      res.status(400).json({ success: false, message: 'Primary product image is required.' })
      return
    }

    let productId = generateProductId()
    while (await Product.findOne({ id: productId })) {
      productId = generateProductId()
    }

    // Determine approval status
    // If vendor clicks "Save Draft": DRAFT
    // If vendor clicks "Submit for Approval": PENDING (or APPROVED if vendor is already verified partner)
    let finalApprovalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' = 'PENDING'
    if (approvalStatus === 'DRAFT') {
      finalApprovalStatus = 'DRAFT'
    } else if (approvalStatus === 'APPROVED' && vendorProfile?.status === 'APPROVED') {
      finalApprovalStatus = 'APPROVED'
    } else if (vendorProfile?.status === 'APPROVED') {
      finalApprovalStatus = 'APPROVED' // Approved vendors' submitted products are directly published or pending
    } else {
      finalApprovalStatus = 'PENDING'
    }

    const isAvailable = finalApprovalStatus === 'APPROVED'

    const product = await Product.create({
      id: productId,
      name: name.trim(),
      description: (description || '').trim(),
      category: category.trim(),
      subcategory: (subcategory || '').trim(),
      price: numericPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      mrp: mrp ? Number(mrp) : undefined,
      image: primaryImage,
      images: Array.isArray(images) && images.length > 0 ? images : [primaryImage],
      vendorId: userId,
      shopId: shop?.slug || '',
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      stock: stock !== undefined ? Number(stock) : 50,
      sku: (sku || `SKU-${productId}`).trim(),
      shippingInfo: (shippingInfo || 'Standard shipping: 3-5 business days.').trim(),
      approvalStatus: finalApprovalStatus,
      rejectionReason: '',
      status: isAvailable ? 'ACTIVE' : 'DRAFT',
      available: isAvailable,
    })

    res.status(201).json({
      success: true,
      message:
        finalApprovalStatus === 'DRAFT'
          ? 'Product saved as draft!'
          : finalApprovalStatus === 'APPROVED'
          ? 'Product created and published successfully!'
          : 'Product submitted for administrative approval!',
      product,
    })
  } catch (error: any) {
    console.error('[vendorController] createVendorProduct error:', error)
    res.status(500).json({ success: false, message: 'Server error creating product.' })
  }
}

/**
 * PUT /api/vendor/products/:id
 * Updates an existing vendor product (enforces vendor ownership).
 */
export const updateVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()
    const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id }

    const product = await Product.findOne(filter)
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' })
      return
    }

    if (product.vendorId !== userId && (req.user as any)?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You do not own this product.' })
      return
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      mrp,
      image,
      images,
      sizes,
      colors,
      stock,
      sku,
      shippingInfo,
      status,
      approvalStatus,
    } = req.body

    if (name) product.name = name.trim()
    if (description !== undefined) product.description = description.trim()
    if (category) product.category = category.trim()
    if (subcategory !== undefined) product.subcategory = subcategory.trim()
    if (price !== undefined) product.price = Number(price)
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : undefined
    if (mrp !== undefined) product.mrp = mrp ? Number(mrp) : undefined
    if (image) product.image = image.trim()
    if (Array.isArray(images)) product.images = images
    if (Array.isArray(sizes)) product.sizes = sizes
    if (Array.isArray(colors)) product.colors = colors
    if (stock !== undefined) product.stock = Number(stock)
    if (sku !== undefined) product.sku = sku.trim()
    if (shippingInfo !== undefined) product.shippingInfo = shippingInfo.trim()

    if (approvalStatus) {
      product.approvalStatus = approvalStatus
      if (approvalStatus === 'PENDING') {
        product.rejectionReason = '' // Clear rejection reason on resubmission
      }
      if (approvalStatus === 'DRAFT' || approvalStatus === 'PENDING' || approvalStatus === 'REJECTED') {
        product.available = false
      } else if (approvalStatus === 'APPROVED') {
        product.available = true
      }
    }

    if (status) {
      product.status = status
      if (status === 'DRAFT') {
        product.available = false
      } else if (status === 'ACTIVE' && product.approvalStatus === 'APPROVED') {
        product.available = true
      }
    }

    await product.save()

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    })
  } catch (error: any) {
    console.error('[vendorController] updateVendorProduct error:', error)
    res.status(500).json({ success: false, message: 'Server error updating product.' })
  }
}

/**
 * PUT /api/vendor/products/:id/toggle-status
 * Toggles product active/deactivated status.
 */
export const toggleVendorProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()
    const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id }

    const product = await Product.findOne(filter)
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' })
      return
    }

    if (product.vendorId !== userId && (req.user as any)?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You do not own this product.' })
      return
    }

    // Toggle availability
    product.available = !product.available
    product.status = product.available ? 'ACTIVE' : 'DRAFT'
    await product.save()

    res.status(200).json({
      success: true,
      message: `Product is now ${product.available ? 'Active' : 'Deactivated'}.`,
      product,
    })
  } catch (error: any) {
    console.error('[vendorController] toggleVendorProductStatus error:', error)
    res.status(500).json({ success: false, message: 'Server error updating product status.' })
  }
}

/**
 * DELETE /api/vendor/products/:id
 * Deletes a vendor product.
 */
export const deleteVendorProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()
    const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id }

    const product = await Product.findOne(filter)
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' })
      return
    }

    if (product.vendorId !== userId && (req.user as any)?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'You do not own this product.' })
      return
    }

    await Product.deleteOne({ id })

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    })
  } catch (error: any) {
    console.error('[vendorController] deleteVendorProduct error:', error)
    res.status(500).json({ success: false, message: 'Server error deleting product.' })
  }
}
