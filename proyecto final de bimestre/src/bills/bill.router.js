import { Router } from 'express'
import { updateBill, findDetailedBillsByUser } from './bill.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'
const api = Router()

api.put('/update/:id', [validateJwt, isAdmin], updateBill)

api.get('/user/:userId', [validateJwt, isAdmin], findDetailedBillsByUser)

// Ruta para obtener el historial de compras del usuario

export default api
