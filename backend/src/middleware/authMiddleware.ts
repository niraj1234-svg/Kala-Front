import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedUser {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

/**
 * Express middleware to verify JWT in Authorization: Bearer <token> header.
 * Attaches verified { userId, email } to req.user.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  // 1. Validate presence of Authorization header
  if (!authHeader || typeof authHeader !== 'string') {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  // 2. Validate Bearer scheme format
  const parts = authHeader.trim().split(/\s+/)
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  const token = parts[1]

  // 3. Verify JWT Secret exists in environment
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error('[authMiddleware] JWT_SECRET is missing in environment variables.')
    res.status(500).json({
      success: false,
      message: 'Authentication service configuration error.',
    })
    return
  }

  // 4. Verify token and required payload fields
  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      !decoded.userId.trim() ||
      typeof decoded.email !== 'string' ||
      !decoded.email.trim()
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      })
      return
    }

    // 5. Attach verified identity to request context
    req.user = {
      userId: decoded.userId.trim(),
      email: decoded.email.trim(),
    }

    next()
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    })
  }
}

export default requireAuth
