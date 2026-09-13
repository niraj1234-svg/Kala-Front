import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root or server
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database (MongoDB or local sync fallback)
await connectDB();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    brand: 'KALA',
    message: 'KALA Print-on-Demand & Branding Studio API',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  KALA STUDIO BACKEND RUNNING ON http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Products API: http://localhost:${PORT}/api/products`);
  console.log(`  Meetings API: http://localhost:${PORT}/api/meetings`);
  console.log(`====================================================`);
});
