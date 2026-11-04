import { Router } from 'express'
import {
  getMarketplaceProducts,
  getMarketplaceVendors,
  getShopBySlug,
} from '../controllers/marketplaceController'

export const marketplaceRouter = Router()

// Public discovery endpoints
marketplaceRouter.get('/products', getMarketplaceProducts)
marketplaceRouter.get('/vendors', getMarketplaceVendors)
marketplaceRouter.get('/shops/:slug', getShopBySlug)

export default marketplaceRouter
