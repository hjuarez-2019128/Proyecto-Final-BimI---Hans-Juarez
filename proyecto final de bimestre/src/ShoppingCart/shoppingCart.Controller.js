import mongoose from 'mongoose'
import ShoppingCart from './shoppingCart.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
import Bill from '../bills/bill.model.js'
import fs from 'fs'
import PDFDocument from 'pdfkit'

export const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body
        // Validar que el usuario exista
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado.' })
        }
        // Validar que el producto exista
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({ message: 'Producto no encontrado.' })
        }
        // Calcular el subtotal
        const subTotal = product.price * quantity
        // Crear el objeto para agregar al carrito
        const cartItem = {
            quantity,
            product: productId,
            subTotal,
        }
        // Buscar el carrito del usuario
        let cart = await ShoppingCart.findOne({ user: userId })
        // Si el usuario no tiene un carrito, crear uno nuevo
        if (!cart) {
            cart = new ShoppingCart({
                user: userId,
                products: [],
                total: 0,
            })
        }
        // Encontrar o agregar el producto al carrito
        const existingProductIndex = cart.products.findIndex(
            (item) => item.product.toString() === productId
        )
        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, actualizar la cantidad y el subtotal
            cart.products[existingProductIndex].quantity += quantity
            cart.products[existingProductIndex].subTotal += subTotal
        } else {
            // Si el producto no está en el carrito, añadirlo
            cart.products.push(cartItem)
        }
        // Recalcular el total del carrito
        cart.total += subTotal
        await cart.save()
        return res
            .status(200)
            .send({
                message: 'Producto agregado al carrito exitosamente.',
                cart,
            })
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error)
        return res
            .status(500)
            .send({
                message: 'Ocurrió un error al agregar producto al carrito.',
                error,
            })
    }
}

export const completePurchase = async (req, res) => {
    try {
        const { nit, products } = req.body
        const userIdFromToken = req.user._id // Obtener el ID de usuario del token decodificado

        // Buscar el carrito del usuario
        const cart = await ShoppingCart.findOne({ user: userIdFromToken })

        if (!cart || cart.products.length === 0) {
            return res
                .status(400)
                .send({ message: 'El carrito de compras está vacío.' })
        }

        // Calcular el total de la compra
        let total = 0
        for (const item of cart.products) {
            total += item.subTotal
        }

        // Crear la factura
        const bill = new Bill({
            user: userIdFromToken, // Utilizar el ID del usuario del token para la factura
            nit,
            products,
            total,
        })

        // Guardar la factura en la base de datos
        await bill.save()

        // Reducir las unidades disponibles de los productos en la base de datos
        for (const item of products) {
            const product = await Product.findById(item.product)
            if (!product) {
                console.error('Producto no encontrado:', item.product)
                continue
            }
            product.units_available -= item.quantity
            await product.save()
        }

        // Limpiar el carrito de compras
        await ShoppingCart.findOneAndUpdate(
            { user: userIdFromToken },
            { $set: { products: [], total: 0 } }
        )

        // Generar PDF de la factura
        const doc = new PDFDocument()
        doc.pipe(fs.createWriteStream(`factura_${bill._id}.pdf`)) // Guardar el PDF con un nombre único basado en el ID de la factura

        // Agregar contenido al PDF
        doc.fontSize(12).text(`Factura ID: ${bill._id}`)
        doc.fontSize(12).text(`Usuario: ${userIdFromToken}`)
        doc.fontSize(12).text(`Nit: ${nit}`)
        doc.fontSize(12).text('Productos:')
        for (const item of products) {
            doc.fontSize(12).text(
                `${item.quantity} x ${item.name} - ${item.subTotal}`
            )
        }
        doc.fontSize(12).text(`Total: ${total}`)
        doc.end()

        return res
            .status(200)
            .json({ message: 'Compra completada con éxito.', bill })
    } catch (error) {
        console.error('Error al completar la compra:', error)
        return res
            .status(500)
            .json({
                message: 'Ocurrió un error al completar la compra.',
                error,
            })
    }
}

export const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user._id // Obtener el ID del usuario desde la sesión
        const purchases = await Bill.find({ user: userId }).populate({
            path: 'products.product',
            model: 'Product',
        })
        res.status(200).send(purchases)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}
// VISUALIZAR PRODUCTOS
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.getAllProducts()
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}
