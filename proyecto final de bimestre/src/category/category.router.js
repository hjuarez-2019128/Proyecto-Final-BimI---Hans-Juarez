import express from 'express'

import { aggregate, updateCategory, getAllCategories, CategoryPredetermined } from './category.cotroller.js'

const api = express.Router()

api.post('/register', aggregate)
api.put('/update/:id', updateCategory)
api.get('/visualize', getAllCategories)
api.post('/:id/delete', CategoryPredetermined)

export default api
