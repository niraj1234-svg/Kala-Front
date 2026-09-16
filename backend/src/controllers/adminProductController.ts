import { Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import mongoose from 'mongoose'
import { Product, IProduct } from '../models/Product'
import { Order } from '../models/Order'

export const ALLOWED_CATEGORIES = ['Streetwear', 'Gaming', 'Gymwear'] as const
export type ProductCategory = (typeof ALLOWED_CATEGORIES)[number]

/**
 * Generates a clean URL slug from a product name.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * GET /api/admin/products
 * Retrieves products with pagination, search, category filter, and availability filter.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPage = parseInt(req.query.page as string, 10)
    const rawLimit = parseInt(req.query.limit as string, 10)
    const searchQuery = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const categoryQuery = typeof req.query.category === 'string' ? req.query.category.trim() : ''
    const availableQuery = typeof req.query.available === 'string' ? req.query.available.trim().toLowerCase() : ''

    const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const skip = (page - 1) * limit

    const filter: FilterQuery<IProduct> = {}

    // Category filter
    if (categoryQuery && categoryQuery !== 'All') {
      if (ALLOWED_CATEGORIES.includes(categoryQuery as ProductCategory)) {
        filter.category = categoryQuery as ProductCategory
      } else {
        // If an invalid category string is queried, return empty list safely
        filter.category = categoryQuery as any
      }
    }

    // Availability filter
    if (availableQuery === 'true') {
      filter.available = true
    } else if (availableQuery === 'false') {
      filter.available = false
    }

    // Search query across id, name, category, and description
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { id: regex },
        { name: regex },
        { category: regex },
        { description: regex },
      ]
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminProductController] getAdminProducts error:',
      error instanceof Error ? error.message : 'Unknown query error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving administrative products list.',
    })
  }
}

/**
 * GET /api/admin/products/:id
 * Retrieves product details by ID or ObjectId.
 * Protected by requireAuth and requireAdmin.
 */
export const getAdminProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      })
      return
    }

    let product = await Product.findOne({ id: id.trim() })

    // Fallback: If not found by slug ID and param is a valid Mongo ObjectId
    if (!product && mongoose.Types.ObjectId.isValid(id.trim())) {
      product = await Product.findById(id.trim())
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminProductController] getAdminProductById error:',
      error instanceof Error ? error.message : 'Unknown lookup error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving product details.',
    })
  }
}

/**
 * POST /api/admin/products
 * Creates a new product in the catalog.
 * Protected by requireAuth and requireAdmin.
 */
export const createAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, category, price, image, description, available } = req.body

    // 1. Validate name
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Product name is required.',
      })
      return
    }

    // 2. Validate category
    if (!category || typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category.trim() as ProductCategory)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
      })
      return
    }

    // 3. Validate price
    const numericPrice = typeof price === 'number' ? price : Number(price)
    if (isNaN(numericPrice) || !isFinite(numericPrice) || numericPrice < 0) {
      res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.',
      })
      return
    }

    // 4. Validate image
    if (!image || typeof image !== 'string' || !image.trim()) {
      res.status(400).json({
        success: false,
        message: 'Product image reference is required.',
      })
      return
    }

    // 5. Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({
        success: false,
        message: 'Product description is required.',
      })
      return
    }

    // 6. Handle & Validate Product ID / Slug
    let targetId = typeof id === 'string' && id.trim() ? slugify(id.trim()) : slugify(name.trim())
    if (!targetId) {
      targetId = `product-${Date.now()}`
    }

    // Check duplicate ID
    const existing = await Product.findOne({ id: targetId })
    if (existing) {
      res.status(400).json({
        success: false,
        message: `A product with ID '${targetId}' already exists. Please choose a unique product ID.`,
      })
      return
    }

    // 7. Create in MongoDB
    const isAvailable = typeof available === 'boolean' ? available : true
    const newProduct = await Product.create({
      id: targetId,
      name: name.trim(),
      category: category.trim() as ProductCategory,
      price: Math.round(numericPrice),
      image: image.trim(),
      description: description.trim(),
      available: isAvailable,
    })

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProduct,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminProductController] createAdminProduct error:',
      error instanceof Error ? error.message : 'Unknown creation error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while creating product.',
    })
  }
}

/**
 * PATCH /api/admin/products/:id
 * Updates an existing product's fields.
 * Protected by requireAuth and requireAdmin.
 */
export const updateAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, category, price, image, description, available } = req.body

    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      })
      return
    }

    let product = await Product.findOne({ id: id.trim() })
    if (!product && mongoose.Types.ObjectId.isValid(id.trim())) {
      product = await Product.findById(id.trim())
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
      return
    }

    const updates: Partial<{
      name: string
      category: ProductCategory
      price: number
      image: string
      description: string
      available: boolean
    }> = {}

    // Validate fields if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Product name cannot be empty.',
        })
        return
      }
      updates.name = name.trim()
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category.trim() as ProductCategory)) {
        res.status(400).json({
          success: false,
          message: `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
        })
        return
      }
      updates.category = category.trim() as ProductCategory
    }

    if (price !== undefined) {
      const numericPrice = typeof price === 'number' ? price : Number(price)
      if (isNaN(numericPrice) || !isFinite(numericPrice) || numericPrice < 0) {
        res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.',
        })
        return
      }
      updates.price = Math.round(numericPrice)
    }

    if (image !== undefined) {
      if (typeof image !== 'string' || !image.trim()) {
        res.status(400).json({
          success: false,
          message: 'Product image reference cannot be empty.',
        })
        return
      }
      updates.image = image.trim()
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        res.status(400).json({
          success: false,
          message: 'Product description cannot be empty.',
        })
        return
      }
      updates.description = description.trim()
    }

    if (available !== undefined) {
      if (typeof available !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Availability must be a boolean (true or false).',
        })
        return
      }
      updates.available = available
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid update fields provided.',
      })
      return
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct,
    })
  } catch (error: unknown) {
    console.error(
      '[AdminProductController] updateAdminProduct error:',
      error instanceof Error ? error.message : 'Unknown update error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while updating product.',
    })
  }
}

/**
 * DELETE /api/admin/products/:id
 * Safely removes a product from catalog or deactivates it if referenced by historical orders.
 * NEVER touches local image files.
 * Protected by requireAuth and requireAdmin.
 */
export const deleteAdminProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const forceHard = req.query.hard === 'true'

    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      })
      return
    }

    let product = await Product.findOne({ id: id.trim() })
    if (!product && mongoose.Types.ObjectId.isValid(id.trim())) {
      product = await Product.findById(id.trim())
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
      return
    }

    // Inspect if product is referenced in historical orders
    const hasOrderReferences = await Order.exists({ 'items.productId': product.id })

    if (hasOrderReferences && !forceHard) {
      // Safe deactivation to preserve historical order references
      product.available = false
      await product.save()

      res.status(200).json({
        success: true,
        action: 'deactivated',
        message: `Product '${product.name}' is referenced in customer orders. It has been deactivated (marked Out of Stock) to safeguard historical order integrity.`,
        product,
      })
      return
    }

    // Hard delete when not referenced by orders, or when explicitly requested
    await Product.deleteOne({ _id: product._id })

    res.status(200).json({
      success: true,
      action: 'deleted',
      message: `Product '${product.name}' deleted successfully from the catalog.`,
      product: {
        id: product.id,
        name: product.name,
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AdminProductController] deleteAdminProduct error:',
      error instanceof Error ? error.message : 'Unknown deletion error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product.',
    })
  }
}
