import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  syncCart,
} from '../controllers/cartController'

const cartRouter = Router()

// All customer cart endpoints strictly require verified authentication
cartRouter.use(requireAuth)

cartRouter.get('/', getCart)
cartRouter.post('/items', addItem)
cartRouter.put('/', syncCart)
cartRouter.patch('/items/:itemId', updateItemQuantity)
cartRouter.delete('/items/:itemId', removeItem)
cartRouter.delete('/', clearCart)

export default cartRouter
