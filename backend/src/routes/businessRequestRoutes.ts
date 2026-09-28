import { Router } from 'express'
import {
  createBusinessRequest,
  getBusinessRequestById,
  getBookedSlots,
} from '../controllers/businessRequestController'

export const businessRequestRouter = Router()

// GET /api/business-requests/booked-slots
businessRequestRouter.get('/booked-slots', getBookedSlots)

// POST /api/business-requests
businessRequestRouter.post('/', createBusinessRequest)

// GET /api/business-requests/:requestId
businessRequestRouter.get('/:requestId', getBusinessRequestById)

export default businessRequestRouter
