import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { CustomRequest } from '../models/CustomRequest'
import { BusinessRequest } from '../models/BusinessRequest'

/**
 * GET /api/admin/dashboard/summary
 * Aggregates real-time operational metrics for the Admin Command Center.
 * Protected by requireAuth and requireAdmin middleware.
 */
export const getAdminDashboardSummary = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    // Execute independent database queries in parallel for high performance
    const [
      todaySalesAgg,
      totalCustomers,
      newCustomersToday,
      ordersByStatusAgg,
      customApparelPending,
      businessBrandingPending,
      rawRecentOrders,
      rawRecentCustomers,
      rawRecentCustomRequests,
      rawRecentBusinessRequests,
    ] = await Promise.all([
      // 1. Today's non-cancelled sales & order volume
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
          },
        },
      ]),

      // 2. Total registered customers (excluding admins)
      User.countDocuments({ role: { $ne: 'admin' } }),

      // 3. New registered customers today
      User.countDocuments({
        role: { $ne: 'admin' },
        createdAt: { $gte: startOfToday },
      }),

      // 4. Order status distribution
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // 5. Pending custom apparel requests
      CustomRequest.countDocuments({ status: 'pending' }),

      // 6. Pending business branding requests
      BusinessRequest.countDocuments({ status: 'pending' }),

      // 7. Recent 5 orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderId customer pricing status createdAt items')
        .lean(),

      // 8. Recent 5 customers (excluding admins)
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('userId firstName lastName email phone createdAt -_id')
        .lean(),

      // 9. Recent 5 custom apparel requests
      CustomRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('requestId name email status createdAt apparelType')
        .lean(),

      // 10. Recent 5 business branding requests
      BusinessRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('requestId name organization email status createdAt apparelRequired')
        .lean(),
    ])

    // Parse today's business revenue and orders
    const todayRevenue = Math.round(todaySalesAgg[0]?.revenue || 0)
    const todayOrders = todaySalesAgg[0]?.orders || 0

    // Parse orders by status
    const orderStatuses: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    for (const item of ordersByStatusAgg) {
      if (item._id && Object.prototype.hasOwnProperty.call(orderStatuses, item._id)) {
        orderStatuses[item._id] = item.count || 0
      }
    }

    // Format safe recent orders
    const recentOrders = rawRecentOrders.map((o) => {
      const itemsList = Array.isArray(o.items) ? o.items : []
      const totalUnits = itemsList.reduce(
        (sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 1),
        0
      )

      return {
        orderId: o.orderId,
        customerName:
          `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() ||
          'Customer',
        customerEmail: o.customer?.email || '',
        total: Math.round(o.pricing?.total || 0),
        status: o.status,
        createdAt: o.createdAt,
        itemCount: totalUnits || itemsList.length,
      }
    })

    // Format safe recent customers
    const recentCustomers = rawRecentCustomers.map((c) => ({
      userId: c.userId,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      createdAt: c.createdAt,
    }))

    // Merge and sort recent requests (latest 5)
    const mergedRequests = [
      ...rawRecentCustomRequests.map((r) => ({
        requestId: r.requestId,
        requestType: 'custom_apparel' as const,
        name: r.name,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
        detail: r.apparelType || '',
      })),
      ...rawRecentBusinessRequests.map((r) => ({
        requestId: r.requestId,
        requestType: 'business_branding' as const,
        name: r.name,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
        detail: r.organization
          ? `${r.organization} (${r.apparelRequired || 'Corporate'})`
          : r.apparelRequired || '',
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)

    res.status(200).json({
      success: true,
      summary: {
        today: {
          revenue: todayRevenue,
          orders: todayOrders,
        },
        customers: {
          total: totalCustomers,
          newToday: newCustomersToday,
        },
        orders: {
          pending: orderStatuses.pending,
          confirmed: orderStatuses.confirmed,
          processing: orderStatuses.processing,
          shipped: orderStatuses.shipped,
          delivered: orderStatuses.delivered,
          cancelled: orderStatuses.cancelled,
        },
        requests: {
          customApparelPending,
          businessBrandingPending,
        },
      },
      recentOrders,
      recentCustomers,
      recentRequests: mergedRequests,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminDashboardController] getAdminDashboardSummary error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while calculating dashboard summary.',
    })
  }
}
