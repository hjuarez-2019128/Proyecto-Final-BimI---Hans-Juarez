import express from 'express'
import { addToCart, completePurchase } from './shoppingCart.Controller.js'
import { validateJwt, isClient } from '../middlewares/validate-jwt.js'
const api = express.Router()

// Ruta para agregar un producto al carrito
api.post('/add-product', [validateJwt, isClient], addToCart)
api.post('/purchase', [validateJwt, isClient], completePurchase)

export default api
