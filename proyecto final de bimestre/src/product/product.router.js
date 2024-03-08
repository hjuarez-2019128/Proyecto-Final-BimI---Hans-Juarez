// routes.js

import express from 'express'
const api = express.Router();
import {validateJwt,isAdmin, isClient} from '../middlewares/validate-jwt.js'
import {getProductsByCategory, update, getNoProducts, deleteProduct, createProduct, getAllProducts, getProductById,getPopularProducts, searchProductsByName, getAllCategories} from './product.controller.js'


//  visualizar el catálogo completo
api.get('/products', [validateJwt, isAdmin, isClient] , getAllProducts);

// Ruta para crear un nuevo producto
api.post('/save',  [validateJwt, isAdmin], createProduct)
// visualizar tanto productos individuales
api.get('/products/:productId', getProductById);

// ver productos sin existencia
api.get('/getNoProducts',[validateJwt, isAdmin], getNoProducts)
//Eliminar productos
api.delete('/delete/:id', [validateJwt, isAdmin], deleteProduct)
//Segundo metodo actualizar
api.put('/update/:id',[validateJwt, isAdmin], update)

// OPCIONES DEL CLIENTE  Exploración de Productos

// Ruta para obtener los productos más vendidos
api.get('/popular', [validateJwt, isClient], getPopularProducts);

// Ruta para obtener todas las categorías existentes
api.get('/categories',[validateJwt, isClient], getAllCategories);

// Ruta para buscar productos por nombre
api.get('/search',[validateJwt, isClient], searchProductsByName);

api.get('/categories/products/:categoryId',[validateJwt, isClient], getProductsByCategory);

export default api