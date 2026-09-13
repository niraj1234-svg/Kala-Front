import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export let isMongoConnected = false;

// In-memory / file fallback store
let fallbackStore = {
  users: [],
  products: [],
  meetings: [],
  orders: [],
  contactRequests: [],
  faq: []
};

// Load existing file data if available
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    fallbackStore = { ...fallbackStore, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('[DB] Could not parse local store.json, using fresh store.', err.message);
  }
}

export function saveFallbackStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(fallbackStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed saving local fallback store:', err.message);
  }
}

export function getFallbackStore() {
  return fallbackStore;
}

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.log('[DB] No MONGODB_URI provided in .env. Running on built-in synced JSON database storage.');
    console.log('[DB] All product updates, meeting requests, users, and orders will persist locally in server/data/store.json.');
    isMongoConnected = false;
    return;
  }

  try {
    console.log('[DB] Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[DB] Successfully connected to MongoDB cluster.');
  } catch (error) {
    console.warn('[DB] MongoDB connection failed:', error.message);
    console.log('[DB] Seamlessly falling back to local synced JSON storage in server/data/store.json.');
    isMongoConnected = false;
  }
}
