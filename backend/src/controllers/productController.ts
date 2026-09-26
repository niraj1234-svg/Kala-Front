import { Request, Response } from 'express'
import { Product } from '../models/Product'
import mongoose from 'mongoose'

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    const filter: Record<string, any> = {}

    if (category && typeof category === 'string' && category !== 'All') {
      filter.category = category
    }

    const rawProducts = await Product.find(filter).sort({ createdAt: 1 })
    const products = rawProducts.sort((a, b) => {
      if (a.id === 'kala-bihari-story-premium-t-shirt') return -1
      if (b.id === 'kala-bihari-story-premium-t-shirt') return 1
      return 0
    })

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error: any) {
    console.error('[ProductController] getProducts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products from database',
      error: error.message,
    })
  }
}

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    let product = await Product.findOne({ id })

    // Fallback: If not found by slug string ID and param is a valid Mongo ObjectId
    if (!product && typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product with ID '${id}' not found`,
      })
      return
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error: any) {
    console.error('[ProductController] getProductById error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details',
      error: error.message,
    })
  }
}
