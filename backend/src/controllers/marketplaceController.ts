import { Request, Response } from 'express'
import { VendorShop } from '../models/VendorShop'
import { VendorProfile } from '../models/VendorProfile'
import { Product } from '../models/Product'

/**
 * GET /api/marketplace/products
 * Retrieves active products available across all approved vendors and the KALA catalog.
 */
export const getMarketplaceProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, sort, page = 1, limit = 20 } = req.query

    // 1. Find all currently approved vendor IDs
    const approvedVendors = await VendorProfile.find({ status: 'APPROVED' }).select('userId')
    const approvedVendorIds = approvedVendors.map((v) => v.userId)

    // 2. Build product filter: Active products that either belong to an approved vendor OR are platform items
    const query: any = {
      $or: [
        {
          vendorId: { $in: approvedVendorIds },
          status: { $in: ['ACTIVE', undefined] },
          approvalStatus: { $in: ['APPROVED', undefined] },
          available: true,
        },
        { vendorId: { $exists: false }, available: true },
        { vendorId: null, available: true },
        { vendorId: '', available: true },
      ],
    }

    if (q && typeof q === 'string' && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i')
      query.$and = [
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
          ],
        },
      ]
    }

    if (category && typeof category === 'string' && category.trim() && category !== 'All') {
      query.category = new RegExp(`^${category.trim()}$`, 'i')
    }

    // Sort order
    let sortObj: any = { createdAt: -1 }
    if (sort === 'price-low') {
      sortObj = { price: 1 }
    } else if (sort === 'price-high') {
      sortObj = { price: -1 }
    } else if (sort === 'name') {
      sortObj = { name: 1 }
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.max(1, Number(limit) || 20)
    const skip = (pageNum - 1) * limitNum

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ])

    // Enrich products with vendor shop details if vendor-owned
    const enrichedProducts = await Promise.all(
      products.map(async (prod) => {
        let shopInfo = null
        if (prod.vendorId) {
          const shop = await VendorShop.findOne({ vendorId: prod.vendorId, isActive: true })
          if (shop) {
            shopInfo = {
              shopName: shop.shopName,
              slug: shop.slug,
              logo: shop.logo,
              city: shop.city,
              state: shop.state,
            }
          }
        }
        return {
          ...prod.toObject(),
          shop: shopInfo,
        }
      })
    )

    res.status(200).json({
      success: true,
      products: enrichedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error: any) {
    console.error('[marketplaceController] getMarketplaceProducts error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving marketplace products.',
    })
  }
}

/**
 * GET /api/marketplace/vendors
 * Retrieves approved active vendor storefronts.
 */
export const getMarketplaceVendors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const approvedVendors = await VendorProfile.find({ status: 'APPROVED' }).select('userId businessName category city state')
    const approvedVendorIds = approvedVendors.map((v) => v.userId)

    const shops = await VendorShop.find({
      vendorId: { $in: approvedVendorIds },
      isActive: true,
    }).sort({ createdAt: -1 })

    // Hydrate each shop with product count
    const enrichedShops = await Promise.all(
      shops.map(async (shop) => {
        const productCount = await Product.countDocuments({
          vendorId: shop.vendorId,
          status: { $in: ['ACTIVE', undefined] },
          available: true,
        })

        return {
          ...shop.toObject(),
          productCount,
        }
      })
    )

    res.status(200).json({
      success: true,
      shops: enrichedShops,
      count: enrichedShops.length,
    })
  } catch (error: any) {
    console.error('[marketplaceController] getMarketplaceVendors error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving marketplace vendor shops.',
    })
  }
}

/**
 * GET /api/shops/:slug
 * Retrieves an individual public vendor storefront by its unique slug.
 */
export const getShopBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug
    const cleanSlug = decodeURIComponent(String(rawSlug || '')).trim().toLowerCase()

    if (!cleanSlug) {
      res.status(400).json({ success: false, message: 'Shop slug is required.' })
      return
    }

    const shop = await VendorShop.findOne({ slug: cleanSlug, isActive: true })

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Vendor shop not found or is currently inactive.',
      })
      return
    }

    // Verify vendor profile is APPROVED
    const vendorProfile = await VendorProfile.findOne({
      userId: shop.vendorId,
      status: 'APPROVED',
    })

    if (!vendorProfile) {
      res.status(404).json({
        success: false,
        message: 'This vendor shop is not currently verified for public browsing.',
      })
      return
    }

    // Fetch active products belonging to this vendor
    const products = await Product.find({
      $or: [
        { vendorId: shop.vendorId },
        { shopId: shop.slug },
      ],
      status: { $in: ['ACTIVE', undefined] },
      approvalStatus: { $in: ['APPROVED', undefined] },
      available: { $ne: false },
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      shop: {
        ...shop.toObject(),
        productCount: products.length,
      },
      vendor: {
        businessName: vendorProfile.businessName,
        category: vendorProfile.category,
        city: vendorProfile.city,
        state: vendorProfile.state,
      },
      products,
    })
  } catch (error: any) {
    console.error('[marketplaceController] getShopBySlug error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vendor shop.',
    })
  }
}
