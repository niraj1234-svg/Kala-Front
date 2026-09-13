import mongoose from 'mongoose';
import { isMongoConnected, getFallbackStore, saveFallbackStore } from '../config/db.js';

const contactSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  channel: { type: String, default: 'Website Form' }, // Website Form, WhatsApp, Chatbot
  status: { type: String, enum: ['NEW', 'RESPONDED', 'RESOLVED'], default: 'NEW' },
  createdAt: { type: Date, default: Date.now }
});

export const MongoContact = mongoose.models.ContactRequest || mongoose.model('ContactRequest', contactSchema);

export const ContactService = {
  async getAll() {
    if (isMongoConnected) {
      return await MongoContact.find().sort({ createdAt: -1 }).lean();
    }
    return [...getFallbackStore().contactRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(data) {
    const id = `kala-contact-${Date.now()}`;
    const newEntry = {
      ...data,
      id,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const created = await MongoContact.create(newEntry);
      return created.toObject();
    }

    const store = getFallbackStore();
    store.contactRequests.unshift(newEntry);
    saveFallbackStore();
    return newEntry;
  },

  async updateStatus(id, status) {
    if (isMongoConnected) {
      return await MongoContact.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean();
    }
    const store = getFallbackStore();
    const entry = store.contactRequests.find(c => c.id === id);
    if (entry) {
      entry.status = status;
      saveFallbackStore();
    }
    return entry;
  }
};
