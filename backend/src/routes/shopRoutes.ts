import { Router } from 'express'
import { getShopBySlug, getMarketplaceVendors } from '../controllers/marketplaceController'

export const shopRouter = Router()

// GET /api/shops - Retrieve all verified active vendor storefronts
shopRouter.get('/', getMarketplaceVendors)

// GET /api/shops/:slug - Retrieve public vendor storefront by its unique slug
shopRouter.get('/:slug', getShopBySlug)

export default shopRouter

