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

    // 1. Validate First Name (required, min 2 chars, letters & spaces only)
    const trimmedFirstName = typeof firstName === 'string' ? firstName.trim() : ''
    if (!trimmedFirstName) {
      res.status(400).json({
        success: false,
        message: 'First name is required.',
      })
      return
    }

    const nameRegex = /^[A-Za-z\s]+$/
    if (trimmedFirstName.length < 2) {
      res.status(400).json({
        success: false,
        message: 'First name must be at least 2 characters long.',
      })
      return
    }

    if (!nameRegex.test(trimmedFirstName)) {
      res.status(400).json({
        success: false,
        message: 'First name can only contain letters and spaces.',
      })
      return
    }

    // 2. Validate Last Name (required, min 2 chars, letters & spaces only)
    const trimmedLastName = typeof lastName === 'string' ? lastName.trim() : ''
    if (!trimmedLastName) {
      res.status(400).json({
        success: false,
        message: 'Last name is required.',
      })
      return
    }

    if (trimmedLastName.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Last name must be at least 2 characters long.',
      })
      return
    }

    if (!nameRegex.test(trimmedLastName)) {
      res.status(400).json({
        success: false,
        message: 'Last name can only contain letters and spaces.',
      })
      return
    }

    // 3. Validate Email (required, valid email format, normalized to lowercase)
    const trimmedEmail = typeof email === 'string' ? email.trim() : ''
    if (!trimmedEmail) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
      })
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const normalizedEmail = trimmedEmail.toLowerCase()
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      })
      return
    }

    // 4. Validate Phone (required, strictly 10 digits starting with 6, 7, 8, or 9; no +91, spaces, letters, or special characters)
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : ''
    if (!trimmedPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      })
      return
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(trimmedPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.',
      })
      return
    }

    // 5. Validate Password (required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Password is required.',
      })
      return
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      })
      return
    }

    if (!/[A-Z]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter.',
      })
      return
    }

    if (!/[a-z]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter.',
      })
      return
    }

    if (!/[0-9]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one number.',
      })
      return
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character.',
      })
      return
    }

    // 6. Check duplicate email in MongoDB (case-insensitively via normalized email)
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
      return
    }

    // 7. Hash password using bcryptjs
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 8. Generate unique server-side user ID
    let userId = generateUserId()
    let existingId = await User.findOne({ userId })
    while (existingId) {
      userId = generateUserId()
      existingId = await User.findOne({ userId })
    }

    // 9. Create User document in MongoDB
    const newUser = await User.create({
      userId,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalizedEmail,
      phone: trimmedPhone,
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
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
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

/**
 * POST /api/auth/admin/login
 * Validates admin credentials, verifies user has database role === 'admin', and issues JWT.
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
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

    // 4. Verify authoritative database role === 'admin'
    // Never trust client-provided role in body, headers, or query parameters
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required.',
      })
      return
    }

    // 5. Sign JWT with minimal payload matching existing auth middleware
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
    const signOptions: jwt.SignOptions = {
      expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'],
    }
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
      },
      jwtSecret,
      signOptions
    )

    // 6. Return HTTP 200 with token and safe admin user data (never password/passwordHash)
    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: 'admin',
      },
    })
  } catch (error: unknown) {
    console.error(
      '[AuthController] adminLogin error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    res.status(500).json({
      success: false,
      message: 'Server error while processing admin login.',
    })
  }
}



