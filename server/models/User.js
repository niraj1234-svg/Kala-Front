import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMongoConnected, getFallbackStore, saveFallbackStore } from '../config/db.js';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
  authProvider: { type: String, enum: ['LOCAL', 'GOOGLE'], default: 'LOCAL' },
  googleId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);

// Initializer to seed default admin
async function ensureAdminExists() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@kala.com').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'admin12345';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPass, salt);

  const defaultAdmin = {
    id: 'kala-user-admin-01',
    name: 'KALA Administrator',
    email: adminEmail,
    passwordHash,
    phone: '9406030116',
    avatar: '',
    role: 'ADMIN',
    authProvider: 'LOCAL',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  const store = getFallbackStore();
  if (!store.users) store.users = [];
  const existingInFallback = store.users.find(u => u.email === adminEmail);
  if (!existingInFallback) {
    store.users.push(defaultAdmin);
    saveFallbackStore();
  }
}
ensureAdminExists();

export const UserService = {
  async findByEmail(email) {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected) {
      return await MongoUser.findOne({ email: normalized }).lean();
    }
    return getFallbackStore().users.find(u => u.email.toLowerCase() === normalized) || null;
  },

  async findById(id) {
    if (isMongoConnected) {
      return await MongoUser.findOne({ id }).select('-passwordHash').lean();
    }
    const user = getFallbackStore().users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },

  async create({ name, email, password, phone = '', role = 'CUSTOMER', authProvider = 'LOCAL', googleId = null }) {
    const normalized = email.toLowerCase().trim();
    const existing = await this.findByEmail(normalized);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const id = `kala-user-${Date.now()}`;
    const userData = {
      id,
      name,
      email: normalized,
      passwordHash,
      phone,
      avatar: '',
      role,
      authProvider,
      googleId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    if (isMongoConnected) {
      const created = await MongoUser.create(userData);
      const safe = created.toObject();
      delete safe.passwordHash;
      return safe;
    }

    const store = getFallbackStore();
    store.users.push(userData);
    saveFallbackStore();

    const { passwordHash: _, ...safeUser } = userData;
    return safeUser;
  },

  async updateLastLogin(id) {
    const now = new Date().toISOString();
    if (isMongoConnected) {
      await MongoUser.updateOne({ id }, { $set: { lastLogin: now } });
      return;
    }
    const store = getFallbackStore();
    const user = store.users.find(u => u.id === id);
    if (user) {
      user.lastLogin = now;
      saveFallbackStore();
    }
  },

  async getAllUsers() {
    if (isMongoConnected) {
      return await MongoUser.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    }
    return getFallbackStore().users.map(u => {
      const { passwordHash: _, ...safe } = u;
      return safe;
    });
  }
};
