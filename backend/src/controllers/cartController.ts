import { Request, Response } from 'express'
import { Cart, ICartItem } from '../models/Cart'
import { Product } from '../models/Product'

interface CartSummary {
  items: ICartItem[]
  count: number
  subtotal: number
}

function computeCartSummary(items: ICartItem[]): CartSummary {
  const count = items.reduce((total, item) => total + (item.quantity || 0), 0)
  const subtotal = items.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0
  )
  return { items, count, subtotal }
}

/**
 * GET /api/cart
 * Fetches the authenticated customer's cart.
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const cart = await Cart.findOne({ userId })
    if (!cart || !cart.items) {
      res.status(200).json({
        success: true,
        cart: { items: [], count: 0, subtotal: 0 },
      })
      return
    }

    const summary = computeCartSummary(cart.items)
    res.status(200).json({
      success: true,
      cart: summary,
    })
  } catch (err: any) {
    console.error('[cartController:getCart] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to retrieve cart.' })
  }
}

/**
 * POST /api/cart/items
 * Adds an item to the authenticated customer's cart.
 */
export const addItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { productId, size, quantity = 1, name, image, price } = req.body

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      res.status(400).json({ success: false, message: 'Valid productId is required.' })
      return
    }

    if (!size || typeof size !== 'string' || !size.trim()) {
      res.status(400).json({ success: false, message: 'Valid size is required.' })
      return
    }

    const cleanProductId = productId.trim()
    const cleanSize = size.trim().toUpperCase()
    const parsedQty = Math.max(1, Math.min(parseInt(String(quantity), 10) || 1, 10))

    // Pull authoritative product data from MongoDB if available
    const dbProduct = await Product.findOne({ id: cleanProductId })
    const resolvedName = dbProduct?.name || (typeof name === 'string' ? name.trim() : cleanProductId)
    const resolvedImage = (typeof image === 'string' && image.trim())
      ? image.trim()
      : (dbProduct?.image || '/favicon.png')
    const resolvedPrice = typeof dbProduct?.price === 'number' ? dbProduct.price : (typeof price === 'number' && price >= 0 ? price : 0)

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      })
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId === cleanProductId && item.size === cleanSize && item.image === resolvedImage
    )

    if (existingIndex > -1) {
      const currentQty = cart.items[existingIndex].quantity || 0
      cart.items[existingIndex].quantity = Math.min(currentQty + parsedQty, 10)
      // Update image/price to authoritative if available
      cart.items[existingIndex].name = resolvedName
      cart.items[existingIndex].image = resolvedImage
      cart.items[existingIndex].price = resolvedPrice
    } else {
      cart.items.push({
        productId: cleanProductId,
        name: resolvedName,
        image: resolvedImage,
        price: resolvedPrice,
        size: cleanSize,
        quantity: parsedQty,
      })
    }

    await cart.save()

    const summary = computeCartSummary(cart.items)
    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart: summary,
    })
  } catch (err: any) {
    console.error('[cartController:addItem] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' })
  }
}

/**
 * PATCH /api/cart/items/:itemId
 * Updates the quantity of an item in the cart.
 * :itemId can be the MongoDB subdocument _id, or a composite productId:size, or productId.
 */
export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const itemId = String(req.params.itemId || '').trim()
    const { quantity, size } = req.body

    if (!itemId) {
      res.status(400).json({ success: false, message: 'Item identifier is required.' })
      return
    }

    const parsedQty = parseInt(String(quantity), 10)
    if (isNaN(parsedQty)) {
      res.status(400).json({ success: false, message: 'Valid quantity number is required.' })
      return
    }

    const cart = await Cart.findOne({ userId })
    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(404).json({ success: false, message: 'Cart not found or empty.' })
      return
    }

    // Match by _id, or by composite key, or by productId + size
    const matchIndex = cart.items.findIndex((item) => {
      if (item._id && item._id.toString() === itemId) return true
      if (size && item.productId === itemId && item.size.toUpperCase() === String(size).trim().toUpperCase()) return true
      if (itemId.includes(':')) {
        const [pId, sz] = itemId.split(':')
        if (item.productId === pId && item.size.toUpperCase() === sz.toUpperCase()) return true
      }
      if (itemId.includes('__')) {
        const [pId, sz] = itemId.split('__')
        if (item.productId === pId && item.size.toUpperCase() === sz.toUpperCase()) return true
      }
      return false
    })

    if (matchIndex === -1) {
      res.status(404).json({ success: false, message: 'Item not found in cart.' })
      return
    }

    if (parsedQty <= 0) {
      cart.items.splice(matchIndex, 1)
    } else {
      cart.items[matchIndex].quantity = Math.min(Math.max(1, parsedQty), 10)
    }

    await cart.save()

    const summary = computeCartSummary(cart.items)
    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      cart: summary,
    })
  } catch (err: any) {
    console.error('[cartController:updateItemQuantity] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to update item quantity.' })
  }
}

/**
 * DELETE /api/cart/items/:itemId
 * Removes an item from the cart.
 */
export const removeItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const itemId = String(req.params.itemId || '').trim()
    const targetSize = (req.query.size as string) || (req.body?.size as string)

    const cart = await Cart.findOne({ userId })
    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(200).json({
        success: true,
        message: 'Cart is already empty.',
        cart: { items: [], count: 0, subtotal: 0 },
      })
      return
    }

    const initialLength = cart.items.length
    cart.items = cart.items.filter((item) => {
      if (item._id && item._id.toString() === itemId) return false
      if (targetSize && item.productId === itemId && item.size.toUpperCase() === targetSize.trim().toUpperCase()) return false
      if (itemId.includes(':')) {
        const [pId, sz] = itemId.split(':')
        if (item.productId === pId && item.size.toUpperCase() === sz.toUpperCase()) return false
      }
      if (itemId.includes('__')) {
        const [pId, sz] = itemId.split('__')
        if (item.productId === pId && item.size.toUpperCase() === sz.toUpperCase()) return false
      }
      return true
    })

    if (cart.items.length !== initialLength) {
      await cart.save()
    }

    const summary = computeCartSummary(cart.items)
    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart: summary,
    })
  } catch (err: any) {
    console.error('[cartController:removeItem] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to remove item.' })
  }
}

/**
 * DELETE /api/cart
 * Clears all items in the customer's cart.
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const cart = await Cart.findOne({ userId })
    if (cart) {
      cart.items = []
      await cart.save()
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { items: [], count: 0, subtotal: 0 },
    })
  } catch (err: any) {
    console.error('[cartController:clearCart] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to clear cart.' })
  }
}

/**
 * PUT /api/cart
 * Synchronizes/replaces the customer's cart with an array of items.
 */
export const syncCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const { items } = req.body
    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'items must be an array.' })
      return
    }

    // Sanitize and consolidate items
    const consolidatedMap = new Map<string, ICartItem>()

    for (const rawItem of items) {
      if (!rawItem || typeof rawItem !== 'object') continue
      const productId = String(rawItem.productId || rawItem.id || '').trim()
      const size = String(rawItem.size || '').trim().toUpperCase()
      const quantity = Math.max(1, Math.min(parseInt(String(rawItem.quantity || 1), 10) || 1, 10))

      if (!productId || !size) continue

      const key = `${productId}:${size}`
      const existing = consolidatedMap.get(key)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, 10)
      } else {
        // Fetch DB product if possible
        const dbProduct = await Product.findOne({ id: productId })
        const resolvedName = dbProduct?.name || String(rawItem.name || productId).trim()
        const resolvedImage = dbProduct?.image || String(rawItem.image || '/favicon.png').trim()
        const resolvedPrice = typeof dbProduct?.price === 'number' ? dbProduct.price : (typeof rawItem.price === 'number' && rawItem.price >= 0 ? rawItem.price : 0)

        consolidatedMap.set(key, {
          productId,
          size,
          quantity,
          name: resolvedName,
          image: resolvedImage,
          price: resolvedPrice,
        })
      }
    }

    const validatedItems = Array.from(consolidatedMap.values())

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = new Cart({ userId, items: validatedItems })
    } else {
      cart.items = validatedItems
    }

    await cart.save()

    const summary = computeCartSummary(cart.items)
    res.status(200).json({
      success: true,
      message: 'Cart synchronized successfully.',
      cart: summary,
    })
  } catch (err: any) {
    console.error('[cartController:syncCart] Error:', err)
    res.status(500).json({ success: false, message: 'Failed to sync cart.' })
  }
}
