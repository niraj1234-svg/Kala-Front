import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

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

export interface AuthResult {
  user?: AuthenticatedUser
  error?: string
}

/**
 * Safely extracts authenticated user from req.user or Authorization header without failing on guest requests.
 */
export function getAuthenticatedUser(req: Request): AuthResult {
  if (
    req.user &&
    typeof req.user.userId === 'string' &&
    req.user.userId.trim() &&
    typeof req.user.email === 'string' &&
    req.user.email.trim()
  ) {
    return { user: req.user }
  }

  const authHeader = req.headers.authorization
  if (!authHeader || typeof authHeader !== 'string') {
    return {}
  }

  const parts = authHeader.trim().split(/\s+/)
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return { error: 'Authentication required: Invalid Authorization header format.' }
  }

  const token = parts[1]
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error('[authMiddleware] JWT_SECRET is missing in environment variables.')
    return { error: 'Authentication service configuration error.' }
  }

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
      return { error: 'Invalid or expired authentication token.' }
    }

    return {
      user: {
        userId: decoded.userId.trim(),
        email: decoded.email.trim(),
      },
    }
  } catch {
    return { error: 'Invalid or expired authentication token.' }
  }
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
  } catch (error: unknown) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    })
  }
}

/**
 * Express middleware to verify that the authenticated user possesses the 'admin' role.
 * Must be preceded by requireAuth in the middleware chain.
 * Queries MongoDB to authoritatively verify user existence and admin status.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Verify user identity was established by preceding auth middleware
  if (!req.user || !req.user.userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  try {
    // 2. Query MongoDB by verified userId (passwordHash remains unselected by default)
    const user = await User.findOne({ userId: req.user.userId })

    // 3. User does not exist in database
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    // 4. User role is not admin (customer or undefined)
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required.',
      })
      return
    }

    // 5. User is verified admin; proceed to next handler
    next()
  } catch (error: unknown) {
    console.error(
      '[authMiddleware] requireAdmin error:',
      error instanceof Error ? error.message : 'Database query failure'
    )
    res.status(500).json({
      success: false,
      message: 'Authorization service error.',
    })
  }
}

export default requireAuth
