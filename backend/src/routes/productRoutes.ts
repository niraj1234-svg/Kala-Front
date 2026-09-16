import { Router } from 'express'
import { getProducts, getProductById } from '../controllers/productController'

export const productRouter = Router()

// GET /api/products
productRouter.get('/', getProducts)

// GET /api/products/:id
productRouter.get('/:id', getProductById)

export default productRouter
