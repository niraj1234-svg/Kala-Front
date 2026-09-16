import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { Product } from '../models/Product'
import { CustomRequest } from '../models/CustomRequest'
import { BusinessRequest } from '../models/BusinessRequest'

/**
 * GET /api/admin/analytics/overview
 * Calculates real-time business statistics and historical analytics directly from MongoDB.
 * Protected by requireAuth and requireAdmin middleware.
 */
export const getAdminAnalyticsOverview = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const timeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Calcutta'

    // Compute continuous 30-day timeline boundaries (ending today in local timezone)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyMap = new Map<string, { revenue: number; orders: number }>()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      dailyMap.set(`${yyyy}-${mm}-${dd}`, { revenue: 0, orders: 0 })
    }

    // Execute independent database queries in parallel for high throughput
    const [
      statusAgg,
      totalCustomers,
      totalProducts,
      customApparelRequests,
      businessBrandingRequests,
      dailyAgg,
      categoryAgg,
      topProductsAgg,
    ] = await Promise.all([
      // 1. Order Status Counts & Revenues by Status
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' },
          },
        },
      ]),

      // 2. Total registered customers (excluding administrators)
      User.countDocuments({ role: { $ne: 'admin' } }),

      // 3. Total active/catalog products
      Product.countDocuments({}),

      // 4. Total custom apparel requests
      CustomRequest.countDocuments({}),

      // 5. Total business branding requests
      BusinessRequest.countDocuments({}),

      // 6. Time-based sales (last 30 calendar days, non-cancelled orders)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: timeZone,
              },
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
      ]),

      // 7. Category sales analytics (non-cancelled orders)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: 'id',
            as: 'productDoc',
          },
        },
        {
          $project: {
            orderId: '$orderId',
            quantity: '$items.quantity',
            itemTotal: { $multiply: ['$items.price', '$items.quantity'] },
            category: {
              $ifNull: [
                { $arrayElemAt: ['$productDoc.category', 0] },
                {
                  $cond: [
                    {
                      $regexMatch: {
                        input: '$items.productId',
                        regex: /^gaming/i,
                      },
                    },
                    'Gaming',
                    {
                      $cond: [
                        {
                          $regexMatch: {
                            input: '$items.productId',
                            regex: /^gymwear/i,
                          },
                        },
                        'Gymwear',
                        'Streetwear',
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              category: '$category',
              orderId: '$orderId',
            },
            orderCategoryRevenue: { $sum: '$itemTotal' },
            orderCategoryItems: { $sum: '$quantity' },
          },
        },
        {
          $group: {
            _id: '$_id.category',
            revenue: { $sum: '$orderCategoryRevenue' },
            itemsSold: { $sum: '$orderCategoryItems' },
            orders: { $sum: 1 },
          },
        },
      ]),

      // 8. Top 5 products by revenue (non-cancelled orders)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              productId: '$items.productId',
              orderId: '$orderId',
            },
            name: { $first: '$items.name' },
            productRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            productQuantity: { $sum: '$items.quantity' },
          },
        },
        {
          $group: {
            _id: '$_id.productId',
            productName: { $first: '$name' },
            orders: { $sum: 1 },
            itemsSold: { $sum: '$productQuantity' },
            revenue: { $sum: '$productRevenue' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            productName: 1,
            orders: 1,
            itemsSold: 1,
            revenue: { $round: ['$revenue', 0] },
          },
        },
      ]),
    ])

    // Process order status counts and category revenues
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    const statusRevenue: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    for (const item of statusAgg) {
      if (item._id && Object.prototype.hasOwnProperty.call(ordersByStatus, item._id)) {
        ordersByStatus[item._id] = item.count || 0
        statusRevenue[item._id] = Math.round(item.revenue || 0)
      }
    }

    // Business overview calculations
    const nonCancelledStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
    ]

    const totalOrders = Object.values(ordersByStatus).reduce((acc, c) => acc + c, 0)
    const totalRevenue = nonCancelledStatuses.reduce(
      (sum, s) => sum + (statusRevenue[s] || 0),
      0
    )
    const nonCancelledOrdersCount = nonCancelledStatuses.reduce(
      (sum, s) => sum + (ordersByStatus[s] || 0),
      0
    )

    const deliveredRevenue = statusRevenue.delivered || 0
    const pendingRevenue = statusRevenue.pending || 0
    const cancelledRevenue = statusRevenue.cancelled || 0

    const averageOrderValue =
      nonCancelledOrdersCount > 0
        ? Math.round(totalRevenue / nonCancelledOrdersCount)
        : 0

    // Populate daily sales continuous timeline
    for (const item of dailyAgg) {
      if (item._id && dailyMap.has(item._id)) {
        dailyMap.set(item._id, {
          revenue: Math.round(item.revenue || 0),
          orders: item.orders || 0,
        })
      }
    }

    const dailySales = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      revenue: stats.revenue,
      orders: stats.orders,
    }))

    // Populate category sales (ensure Streetwear, Gaming, Gymwear always appear)
    const definedCategories = ['Streetwear', 'Gaming', 'Gymwear']
    const categoryResultMap = new Map<
      string,
      { revenue: number; orders: number; itemsSold: number }
    >()
    for (const cat of definedCategories) {
      categoryResultMap.set(cat, { revenue: 0, orders: 0, itemsSold: 0 })
    }

    for (const item of categoryAgg) {
      if (item._id && categoryResultMap.has(item._id)) {
        categoryResultMap.set(item._id, {
          revenue: Math.round(item.revenue || 0),
          orders: item.orders || 0,
          itemsSold: item.itemsSold || 0,
        })
      }
    }

    const salesByCategory = definedCategories.map((cat) => ({
      category: cat,
      ...categoryResultMap.get(cat)!,
    }))

    // Format top products
    const topProducts = (topProductsAgg || []).map((item) => ({
      productId: item.productId,
      productName: item.productName || item.productId,
      orders: item.orders || 0,
      itemsSold: item.itemsSold || 0,
      revenue: item.revenue || 0,
    }))

    res.status(200).json({
      success: true,
      overview: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        deliveredRevenue,
        pendingRevenue,
        cancelledRevenue,
      },
      ordersByStatus,
      requests: {
        customApparel: customApparelRequests,
        businessBranding: businessBrandingRequests,
      },
      dailySales,
      salesByCategory,
      topProducts,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminAnalyticsController] getAdminAnalyticsOverview error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while calculating analytics overview.',
    })
  }
}
