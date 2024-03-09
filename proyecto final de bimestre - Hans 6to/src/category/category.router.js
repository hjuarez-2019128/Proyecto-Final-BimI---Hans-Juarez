import express from 'express'
import {validateJwt,isAdmin, isClient} from '../middlewares/validate-jwt.js'
import { aggregate, updateCategory, getAllCategories, CategoryPredetermined } from './category.cotroller.js'

const api = express.Router()

api.post('/register',[validateJwt, isAdmin], aggregate)
api.put('/update/:id', [validateJwt, isAdmin],updateCategory)
api.get('/visualize',[validateJwt], getAllCategories)
api.delete('/:id/delete', [validateJwt, isAdmin],CategoryPredetermined)

export default api
