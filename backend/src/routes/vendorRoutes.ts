import { Router } from 'express'
import { requireAuth, requireVendor, requireApprovedVendor } from '../middleware/authMiddleware'
import {
  registerVendor,
  getVendorMe,
  getVendorStatus,
  updateVendorProfile,
  createVendorShop,
  getVendorShop,
  updateVendorShop,
  getVendorStats,
  getVendorAnalytics,
  getVendorTransactions,
  getVendorPayouts,
  requestVendorPayout,
  downloadSalesReport,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  toggleVendorProductStatus,
  deleteVendorProduct,
} from '../controllers/vendorController'

export const vendorRouter = Router()

// Public vendor registration endpoint
vendorRouter.post('/register', registerVendor)

// Authenticated vendor profile endpoints
vendorRouter.get('/me', requireAuth, requireVendor, getVendorMe)
vendorRouter.get('/me/status', requireAuth, getVendorStatus)
vendorRouter.put('/me', requireAuth, requireVendor, updateVendorProfile)

// Real-time vendor dashboard analytics, financial ledger & payouts
vendorRouter.get('/stats', requireAuth, requireVendor, getVendorStats)
vendorRouter.get('/analytics', requireAuth, requireVendor, getVendorAnalytics)
vendorRouter.get('/transactions', requireAuth, requireVendor, getVendorTransactions)
vendorRouter.get('/payouts', requireAuth, requireVendor, getVendorPayouts)
vendorRouter.post('/payouts', requireAuth, requireVendor, requestVendorPayout)
vendorRouter.get('/reports/download', requireAuth, requireVendor, downloadSalesReport)

// Vendor order management
vendorRouter.get('/orders', requireAuth, requireVendor, getVendorOrders)
vendorRouter.put('/orders/:orderId/status', requireAuth, requireVendor, updateVendorOrderStatus)

// Shop storefront endpoints (Creation & edit requires APPROVED status)
vendorRouter.post('/shop', requireAuth, requireApprovedVendor, createVendorShop)
vendorRouter.get('/shop', requireAuth, requireVendor, getVendorShop)
vendorRouter.put('/shop', requireAuth, requireApprovedVendor, updateVendorShop)

// Product management endpoints
vendorRouter.get('/products', requireAuth, requireVendor, getVendorProducts)
vendorRouter.post('/products', requireAuth, requireVendor, createVendorProduct)
vendorRouter.put('/products/:id', requireAuth, requireVendor, updateVendorProduct)
vendorRouter.put('/products/:id/toggle-status', requireAuth, requireVendor, toggleVendorProductStatus)
vendorRouter.delete('/products/:id', requireAuth, requireVendor, deleteVendorProduct)

export default vendorRouter
