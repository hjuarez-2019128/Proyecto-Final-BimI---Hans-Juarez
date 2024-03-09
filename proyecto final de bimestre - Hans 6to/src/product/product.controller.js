'use strict'

import Product from './product.model.js'
import Category from '../category/category.model.js'
import Bill from '../bills/bill.model.js'
import { checkUpdate } from '../utils/validator.js'

// Crea el producto
export const createProduct = async (req, res) => {
    try {
        const { name, price, units_available, description, category } = req.body
        if (!name || !price || !units_available || !description || !category) {
            return res.status(400).send({ message: 'All fields are required' })
        }
        // Crear el nuevo producto
        const product = await Product.create({
            name,
            price,
            units_available,
            description,
            category,
        })
        res.status(201).send(product)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}

// Obtener un producto unitario por su ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).send({ message: 'Product not found' })
        }
        res.status(200).send(product)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}

// Obtener todos los productos del catálogo
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.status(200).send(products)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}



// Eliminar el producto
export const deleteProduct = async (req, res) => {
    try {
        // Obtener el ID del producto de los parámetros de la solicitud
        let { id } = req.params
        // Eliminar el producto por su ID
        let deletedProduct = await Product.findOneAndDelete({ _id: id })
        // Verificar si se eliminó correctamente
        if (!deletedProduct) {
            return res
                .status(404)
                .send({ message: 'Product not found and not deleted' })
        }
        // Responder con un mensaje de éxito
        return res.send({
            message: `Product with ID ${deletedProduct.name} deleted successfully`,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting product' })
    }
}

//Ver productos con valor a 0
export const getNoProducts = async (req, res) => {
    try {
        // Ver todos los productos con 0 de stock
        const products = await Product.find({ units_available: 0 });
        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'No existen productos con stock igual a 0.' });
        }
        // Retornar todos los productos sin existencia
        return res.send({ products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener los productos.' });
    }
};

// ACTUALIZA EL PRODUCTO
export const update = async (req, res) => {
    try {
        //Capturar la data
        let data = req.body
        //Capturar el id del producto a actualizar
        let { id } = req.params
        //Validar que vengan datos
        let update = checkUpdate(data, false)
        if (!update)
            return res
                .status(400)
                .send({
                    message:
                        'Have submitted some data that cannot be updated or missing data',
                })
        //Actualizar
        let updatedProduct = await Product.findOneAndUpdate({ _id: id }, data, {
            new: true,
        }).populate('category', ['name', 'description']) //Eliminar la información sensible
        //Validar la actualización
        if (!updatedProduct)
            return res
                .status(404)
                .send({ message: 'Product not found and not updated' })
        //Responder si todo sale bien
        return res.send({
            message: 'Product updated successfully',
            updatedProduct,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating Product' })
    }
}

//USUARIOS
//visualizar el catálogo de productos más vendidos
export const getPopularProducts = async (req, res) => {
    try {
        // Obtener los productos más vendidos con sus detalles
        const popularProducts = await Bill.aggregate([
            { $unwind: '$products' }, // Desenrollar los productos para poder agruparlos
            {
                $group: {
                    _id: '$products.product',
                    totalQuantity: { $sum: '$products.quantity' },
                },
            }, // Agrupar por producto y sumar las cantidades
            { $sort: { totalQuantity: -1 } }, // Ordenar en orden descendente por cantidad total
            { $limit: 3 }, // Limitar a los 3 productos más vendidos
            {
                $lookup: { // Realizar un join para obtener los detalles completos del producto
                    from: 'products', // Nombre de la colección de productos
                    localField: '_id', // Campo local a unir
                    foreignField: '_id', // Campo en la colección de productos a unir
                    as: 'productDetails' // Nombre del campo para almacenar los detalles del producto
                }
            },
            { $unwind: '$productDetails' } // Desenrollar los detalles del producto
        ]);

        res.send(popularProducts);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};



//buscar productos por nombre
export const searchProductsByName = async (req, res) => {
    try {
        const { name } = req.body

        // Buscar productos por nombre
        const products = await Product.find({
            name: { $regex: name, $options: 'i' },
        })

        res.send(products)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
        res.send(categories)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}

// Controlador para obtener productos filtrados por categoría
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params

        // Buscar productos por categoría
        const products = await Product.find({ category: categoryId })

        res.send(products)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}
