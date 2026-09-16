import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

/**
 * Generates a unique server-side user ID
 * Format: KALA-USR-XXXXXX (6 random uppercase alphanumeric chars)
 */
function generateUserId(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KALA-USR-${randomSuffix}`
}

/**
 * POST /api/auth/register
 * Handles customer registration, password hashing, and JWT token issuance.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    // 1. Validate required fields
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      res.status(400).json({
        success: false,
        message: 'First name is required.',
      })
      return
    }

    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      res.status(400).json({
        success: false,
        message: 'Last name is required.',
      })
      return
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
      return
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      })
      return
    }

    // Clean common phone formatting (strip spaces, hyphens, plus, and leading 91 country code if 12 digits)
    const cleanPhone = phone.trim().replace(/[\s-+]/g, '').replace(/^91(?=[6-9]\d{9}$)/, '')
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(cleanPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian phone number.',
      })
      return
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      })
      return
    }

    // 2. Check duplicate email in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
      return
    }

    // 3. Hash password using bcryptjs
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 4. Generate unique server-side user ID
    let userId = generateUserId()
    let existingId = await User.findOne({ userId })
    while (existingId) {
      userId = generateUserId()
      existingId = await User.findOne({ userId })
    }

    // 5. Create User document in MongoDB
    const newUser = await User.create({
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      passwordHash,
    })

    // 6. Sign JWT
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('[AuthController] JWT_SECRET is not configured in environment variables.')
      res.status(500).json({
        success: false,
        message: 'Authentication service configuration error.',
      })
      return
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
    const token = jwt.sign(
      {
        userId: newUser.userId,
        email: newUser.email,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn as any }
    )

    // 7. Return HTTP 201 with token and user object
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[AuthController] register error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while processing registration.',
    })
  }
}

/**
 * POST /api/auth/login
 * Validates customer credentials, compares bcrypt password hash, and issues JWT.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // 1. Validate required fields
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
      return
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
      return
    }

    // 2. Find user in MongoDB explicitly selecting passwordHash (which has select: false)
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')

    // Generic error message for both non-existent user and invalid password
    const genericAuthError = 'Invalid email or password.'

    if (!user) {
      res.status(401).json({
        success: false,
        message: genericAuthError,
      })
      return
    }

    // 3. Verify password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: genericAuthError,
      })
      return
    }

    // 4. Sign JWT
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error('[AuthController] JWT_SECRET is not configured in environment variables.')
      res.status(500).json({
        success: false,
        message: 'Authentication service configuration error.',
      })
      return
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn as any }
    )

    // 5. Return HTTP 200 with token and user object (never password/passwordHash)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[AuthController] login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while processing login.',
    })
  }
}

/**
 * GET /api/auth/me
 * Returns currently authenticated customer's profile using req.user.userId.
 * Protected by requireAuth middleware.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user
    if (!authUser || !authUser.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    const user = await User.findOne({ userId: authUser.userId })
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      })
      return
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[AuthController] getMe error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user profile.',
    })
  }
}


