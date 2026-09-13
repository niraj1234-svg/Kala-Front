import mongoose from 'mongoose';
import { isMongoConnected, getFallbackStore, saveFallbackStore } from '../config/db.js';

const meetingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  companyName: { type: String, default: '' },
  purpose: { type: String, required: true },
  date: { type: String, required: true, index: true }, // Format YYYY-MM-DD
  time: { type: String, required: true },               // e.g. "11:00 AM"
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
    index: true
  },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const MongoMeeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);

export const MeetingService = {
  async getAll(filter = {}) {
    if (isMongoConnected) {
      const q = {};
      if (filter.status) q.status = filter.status;
      if (filter.date) q.date = filter.date;
      return await MongoMeeting.find(q).sort({ createdAt: -1 }).lean();
    }

    let list = [...getFallbackStore().meetings];
    if (filter.status) {
      list = list.filter(m => m.status === filter.status);
    }
    if (filter.date) {
      list = list.filter(m => m.date === filter.date);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    if (isMongoConnected) {
      return await MongoMeeting.findOne({ id }).lean();
    }
    return getFallbackStore().meetings.find(m => m.id === id) || null;
  },

  async getBookedSlotsForDate(date) {
    if (isMongoConnected) {
      const meetings = await MongoMeeting.find({
        date,
        status: { $in: ['PENDING', 'CONFIRMED'] }
      }).select('time').lean();
      return meetings.map(m => m.time);
    }

    return getFallbackStore().meetings
      .filter(m => m.date === date && (m.status === 'PENDING' || m.status === 'CONFIRMED'))
      .map(m => m.time);
  },

  async create(data) {
    // Check for double booking
    const booked = await this.getBookedSlotsForDate(data.date);
    if (booked.includes(data.time)) {
      throw new Error(`The selected time slot (${data.time}) on ${data.date} is already reserved. Please choose another slot.`);
    }

    const id = `kala-meet-${Date.now()}`;
    const meetingData = {
      ...data,
      id,
      status: 'PENDING',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const created = await MongoMeeting.create(meetingData);
      return created.toObject();
    }

    const store = getFallbackStore();
    store.meetings.unshift(meetingData);
    saveFallbackStore();
    return meetingData;
  },

  async updateStatus(id, newStatus, adminNotes = '') {
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updatedAt = new Date().toISOString();

    if (isMongoConnected) {
      const updated = await MongoMeeting.findOneAndUpdate(
        { id },
        { $set: { status: newStatus, adminNotes, updatedAt } },
        { new: true }
      ).lean();
      return updated;
    }

    const store = getFallbackStore();
    const idx = store.meetings.findIndex(m => m.id === id);
    if (idx === -1) return null;
    store.meetings[idx].status = newStatus;
    if (adminNotes) store.meetings[idx].adminNotes = adminNotes;
    store.meetings[idx].updatedAt = updatedAt;
    saveFallbackStore();
    return store.meetings[idx];
  }
};
