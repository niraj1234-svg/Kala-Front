import { Router } from 'express'
import { register, login, getMe } from '../controllers/authController'
import { requireAuth } from '../middleware/authMiddleware'

export const authRouter = Router()

// POST /api/auth/register
authRouter.post('/register', register)

// POST /api/auth/login
authRouter.post('/login', login)

// GET /api/auth/me (Protected)
authRouter.get('/me', requireAuth, getMe)

export default authRouter

