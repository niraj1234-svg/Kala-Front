import mongoose from 'mongoose';
import { isMongoConnected, getFallbackStore, saveFallbackStore } from '../config/db.js';

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: null, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: 'M' },
    color: { type: String, default: 'Black' },
    image: { type: String, default: '' },
    customNote: { type: String, default: '' }
  }],
  subtotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, default: 'PENDING' },
  notes: { type: String, default: '' },
  shippingAddress: {
    addressLine: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const MongoOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

export const OrderService = {
  async getAll(filter = {}) {
    if (isMongoConnected) {
      const q = {};
      if (filter.status) q.status = filter.status;
      if (filter.userId) q.userId = filter.userId;
      return await MongoOrder.find(q).sort({ createdAt: -1 }).lean();
    }

    let orders = [...getFallbackStore().orders];
    if (filter.status) orders = orders.filter(o => o.status === filter.status);
    if (filter.userId) orders = orders.filter(o => o.userId === filter.userId);
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    if (isMongoConnected) {
      return await MongoOrder.findOne({ id }).lean();
    }
    return getFallbackStore().orders.find(o => o.id === id) || null;
  },

  async create(orderData) {
    const id = orderData.id || `KALA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      ...orderData,
      id,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: orderData.paymentStatus || 'PENDING',
      status: orderData.status || 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const created = await MongoOrder.create(newOrder);
      return created.toObject();
    }

    const store = getFallbackStore();
    store.orders.unshift(newOrder);
    saveFallbackStore();
    return newOrder;
  },

  async updateStatus(id, status) {
    const updatedAt = new Date().toISOString();
    if (isMongoConnected) {
      return await MongoOrder.findOneAndUpdate({ id }, { $set: { status, updatedAt } }, { new: true }).lean();
    }

    const store = getFallbackStore();
    const idx = store.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    store.orders[idx].status = status;
    store.orders[idx].updatedAt = updatedAt;
    saveFallbackStore();
    return store.orders[idx];
  }
};
