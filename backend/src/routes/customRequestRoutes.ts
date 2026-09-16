import { Router } from 'express'
import {
  createCustomRequest,
  getCustomRequestById,
} from '../controllers/customRequestController'

export const customRequestRouter = Router()

// POST /api/custom-requests
customRequestRouter.post('/', createCustomRequest)

// GET /api/custom-requests/:requestId
customRequestRouter.get('/:requestId', getCustomRequestById)

export default customRequestRouter
