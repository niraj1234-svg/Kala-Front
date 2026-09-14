import express from 'express';
import { ProductService } from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products - list and filter products
router.get('/', async (req, res) => {
  try {
    const products = await ProductService.getAll(req.query);
    return res.json({
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - single product by id or slug
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductService.getByIdOrSlug(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/products - create product (Admin protected)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, category, subCategory, description, price } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Product name, category, and price are required.' });
    }

    const created = await ProductService.create(req.body);
    return res.status(201).json({
      message: 'Product created successfully',
      product: created
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - update product (Admin protected)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await ProductService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// PATCH /api/products/:id/stock - quick stock / sold out toggle (Admin protected)
router.patch('/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { isSoldOut, inStock } = req.body;
    const updates = {};
    if (isSoldOut !== undefined) updates.isSoldOut = Boolean(isSoldOut);
    if (inStock !== undefined) updates.inStock = Boolean(inStock);

    const updated = await ProductService.update(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({
      message: 'Stock status updated successfully',
      product: updated
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - delete product (Admin protected)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await ProductService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
