import { Router } from 'express'
import { register, login, getMe, adminLogin } from '../controllers/authController'
import { requireAuth } from '../middleware/authMiddleware'

export const authRouter = Router()

// POST /api/auth/register
authRouter.post('/register', register)

// POST /api/auth/login
authRouter.post('/login', login)

// POST /api/auth/admin/login
authRouter.post('/admin/login', adminLogin)

// GET /api/auth/me (Protected)
authRouter.get('/me', requireAuth, getMe)

export default authRouter

