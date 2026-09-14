import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kala_super_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const user = await UserService.create({ name, email, password, phone });
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await UserService.updateLastLogin(user.id);
    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ error: 'Google email and ID are required.' });
    }

    let user = await UserService.findByEmail(email);
    if (!user) {
      user = await UserService.create({
        name: name || email.split('@')[0],
        email,
        authProvider: 'GOOGLE',
        googleId,
        avatar: avatar || ''
      });
    } else {
      await UserService.updateLastLogin(user.id);
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Google authentication successful',
      user: safeUser,
      token
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
