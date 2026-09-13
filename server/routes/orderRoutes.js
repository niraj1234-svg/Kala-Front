import express from 'express';
import { OrderService } from '../models/Order.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders - create new order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, phone, items, subtotal, shippingAddress, notes } = req.body;
    if (!customerName || !customerEmail || !phone || !items || !items.length) {
      return res.status(400).json({ error: 'Customer details and at least one item are required.' });
    }

    const order = await OrderService.create({
      userId: req.body.userId || null,
      customerName,
      customerEmail,
      phone,
      items,
      subtotal: subtotal || items.reduce((acc, it) => acc + it.price * it.quantity, 0),
      shippingAddress: shippingAddress || {},
      notes: notes || ''
    });

    return res.status(201).json({
      message: 'Order created successfully (Pending verification)',
      order
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET /api/orders - Admin lists all; or authenticated user lists own
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'ADMIN') {
      filter.userId = req.user.id;
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await OrderService.getAll(filter);
    return res.json({ count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - retrieve order details by ID for tracking
router.get('/:id', async (req, res) => {
  try {
    const order = await OrderService.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/status - Admin update order status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await OrderService.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ message: 'Order status updated', order: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
