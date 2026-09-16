import { Router } from 'express'
import {
  createBusinessRequest,
  getBusinessRequestById,
} from '../controllers/businessRequestController'

export const businessRequestRouter = Router()

// POST /api/business-requests
businessRequestRouter.post('/', createBusinessRequest)

// GET /api/business-requests/:requestId
businessRequestRouter.get('/:requestId', getBusinessRequestById)

export default businessRequestRouter
