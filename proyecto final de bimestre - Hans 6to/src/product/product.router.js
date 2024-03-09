// routes.js

import express from 'express'
const api = express.Router();
import {validateJwt,isAdmin, isClient} from '../middlewares/validate-jwt.js'
import {getProductsByCategory, update, getNoProducts, deleteProduct, createProduct, getAllProducts, getProductById,getPopularProducts, searchProductsByName, getAllCategories} from './product.controller.js'


//  visualizar el catálogo completo
api.get('/products', [validateJwt] , getAllProducts);

// Ruta para crear un nuevo producto
api.post('/save',  [validateJwt, isAdmin], createProduct)
// visualizar tanto productos individuales
api.get('/products/:productId',[validateJwt, isAdmin], getProductById);

// ver productos sin existencia
api.get('/getNoProducts',[validateJwt, isAdmin], getNoProducts)
//Eliminar productos
api.delete('/delete/:id', [validateJwt, isAdmin], deleteProduct)
//Segundo metodo actualizar
api.put('/update/:id',[validateJwt, isAdmin], update)

// OPCIONES DEL CLIENTE  Exploración de Productos

// Ruta para obtener los productos más vendidos
api.get('/popular',[validateJwt], getPopularProducts);

// Ruta para obtener todas las categorías existentes
api.get('/categories',[validateJwt], getAllCategories);

// Ruta para buscar productos por nombre Búsqueda por coincidencia
api.get('/search',[validateJwt], searchProductsByName);

// POR CATEGORIA
api.get('/categories/products/:categoryId',[validateJwt], getProductsByCategory);

export default api