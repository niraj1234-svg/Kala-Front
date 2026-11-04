import { Request, Response } from 'express'
import { VendorProfile } from '../models/VendorProfile'
import { VendorShop } from '../models/VendorShop'
import { User } from '../models/User'
import { Product } from '../models/Product'

/**
 * GET /api/admin/vendors
 * Retrieves all vendor profiles with their associated user and shop information.
 */
export const getAdminVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query

    const filter: any = {}
    if (status && typeof status === 'string' && status !== 'ALL') {
      filter.status = status.toUpperCase()
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { businessName: searchRegex },
        { email: searchRegex },
        { city: searchRegex },
        { category: searchRegex },
      ]
    }

    const vendorProfiles = await VendorProfile.find(filter).sort({ createdAt: -1 })

    // Hydrate each vendor profile with shop info and product count
    const enrichedVendors = await Promise.all(
      vendorProfiles.map(async (vp) => {
        const [shop, user, productCount] = await Promise.all([
          VendorShop.findOne({ vendorId: vp.userId }),
          User.findOne({ userId: vp.userId }),
          Product.countDocuments({ vendorId: vp.userId }),
        ])

        return {
          ...vp.toObject(),
          shop: shop || null,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
              }
            : null,
          productCount,
        }
      })
    )

    res.status(200).json({
      success: true,
      vendors: enrichedVendors,
      count: enrichedVendors.length,
    })
  } catch (error: any) {
    console.error('[adminVendorController] getAdminVendors error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vendor applications.',
    })
  }
}

/**
 * PUT /api/admin/vendors/:id/approve
 * Approves a vendor application.
 */
export const approveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()

    const vendor = await VendorProfile.findOne({
      $or: [{ userId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor profile not found.' })
      return
    }

    vendor.status = 'APPROVED'
    await vendor.save()

    // Also ensure user role is 'vendor'
    await User.updateOne({ userId: vendor.userId }, { role: 'vendor' })

    res.status(200).json({
      success: true,
      message: `Vendor '${vendor.businessName}' has been APPROVED.`,
      vendor,
    })
  } catch (error: any) {
    console.error('[adminVendorController] approveVendor error:', error)
    res.status(500).json({ success: false, message: 'Server error approving vendor.' })
  }
}

/**
 * PUT /api/admin/vendors/:id/reject
 * Rejects a vendor application.
 */
export const rejectVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()
    const { reason } = req.body

    const vendor = await VendorProfile.findOne({
      $or: [{ userId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor profile not found.' })
      return
    }

    vendor.status = 'REJECTED'
    if (reason) vendor.adminNotes = reason.trim()
    await vendor.save()

    res.status(200).json({
      success: true,
      message: `Vendor '${vendor.businessName}' has been REJECTED.`,
      vendor,
    })
  } catch (error: any) {
    console.error('[adminVendorController] rejectVendor error:', error)
    res.status(500).json({ success: false, message: 'Server error rejecting vendor.' })
  }
}

/**
 * PUT /api/admin/vendors/:id/suspend
 * Suspends a vendor.
 */
export const suspendVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const id = String(rawId || '').trim()

    const vendor = await VendorProfile.findOne({
      $or: [{ userId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor profile not found.' })
      return
    }

    vendor.status = 'SUSPENDED'
    await vendor.save()

    res.status(200).json({
      success: true,
      message: `Vendor '${vendor.businessName}' has been SUSPENDED.`,
      vendor,
    })
  } catch (error: any) {
    console.error('[adminVendorController] suspendVendor error:', error)
    res.status(500).json({ success: false, message: 'Server error suspending vendor.' })
  }
}
