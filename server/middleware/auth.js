import jwt from 'jsonwebtoken';
import { UserService } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kala_super_secret_jwt_key_2026';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserService.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Administrator role required.' });
    }
  });
}
