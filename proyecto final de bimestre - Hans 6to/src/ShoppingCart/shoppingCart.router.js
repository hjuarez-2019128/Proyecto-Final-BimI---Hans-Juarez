import express from 'express'
import { addToCart, completePurchase, deleteCartItem } from './shoppingCart.Controller.js'
import { validateJwt, isClient } from '../middlewares/validate-jwt.js'
const api = express.Router()

// Ruta para agregar un producto al carrito
api.post('/add-product', [validateJwt, isClient], addToCart)
api.post('/purchase', [validateJwt, isClient], completePurchase)
api.delete('/deleteCartItem',[validateJwt, isClient],deleteCartItem)

export default api
