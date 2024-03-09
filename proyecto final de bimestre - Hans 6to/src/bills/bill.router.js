import { Router } from 'express'
import {findDetailedBillsByUser } from './bill.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'
const api = Router()


api.get('/user/:userId', [validateJwt, isAdmin], findDetailedBillsByUser)



export default api
