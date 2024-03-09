import mongoose from 'mongoose'
import ShoppingCart from './shoppingCart.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'
import Bill from '../bills/bill.model.js'
import fs from 'fs'
import PDFDocument from 'pdfkit'

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // Obtener el ID de usuario del token decodificado
        const userId = req.user._id;

        // Validar que el producto exista
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ message: 'Producto no encontrado.' });
        }

        // Verificar si hay suficientes unidades disponibles
        if (product.units_available < quantity) {
            return res.status(400).send({ message: 'No hay suficientes unidades disponibles.' });
        }

        // Calcular el subtotal
        const subTotal = product.price * quantity;
        
        // Crear el objeto para agregar al carrito
        const cartItem = {
            quantity,
            product: productId,
            subTotal,
        };
        
        // Buscar el carrito del usuario
        let cart = await ShoppingCart.findOne({ user: userId });
        
        // Si el usuario no tiene un carrito, crear uno nuevo
        if (!cart) {
            cart = new ShoppingCart({
                user: userId,
                products: [],
                total: 0,
            });
        }
        
        // Encontrar o agregar el producto al carrito
        const existingProductIndex = cart.products.findIndex(
            (item) => item.product.toString() === productId
        );
        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, actualizar la cantidad y el subtotal
            cart.products[existingProductIndex].quantity += quantity;
            cart.products[existingProductIndex].subTotal += subTotal;
        } else {
            // Si el producto no está en el carrito, añadirlo
            cart.products.push(cartItem);
        }
        
        // Recalcular el total del carrito
        cart.total += subTotal;
        
        // Guardar los cambios en el carrito
        await cart.save();
        
        return res.status(200).send({
            message: 'Producto agregado al carrito exitosamente.',
            cart,
        });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        return res.status(500).send({
            message: 'Ocurrió un error al agregar producto al carrito.',
            error,
        });
    }
};


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

        // Validar que los productos en la solicitud coincidan con los del carrito
        for (const item of products) {
            const cartProduct = cart.products.find(
                (cartItem) => cartItem.product.toString() === item.product
            )
            if (!cartProduct) {
                return res.status(400).send({
                    message: `El producto con ID ${item.product} no se encuentra en el carrito.`,
                })
            }
            if (item.quantity !== cartProduct.quantity) {
                return res.status(400).send({
                    message: `La cantidad del producto con ID ${item.product} no coincide con la del carrito.`,
                })
            }
        }

        // Calcular el total de la compra
        const total = cart.total

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
        const fileName = `factura_${bill._id}.pdf`
        doc.pipe(fs.createWriteStream(fileName)) // Guardar el PDF con un nombre único basado en el ID de la factura

        // Agregar contenido al PDF
        doc.fontSize(16)
            .text(`Factura ID: ${bill._id}`, { underline: true })
            .moveDown()
        doc.fontSize(12).text(`Usuario: ${userIdFromToken}`).moveDown()
        doc.fontSize(12).text(`Nit: ${nit}`).moveDown()
        doc.fontSize(14).text('Productos:', { underline: true }).moveDown()
        for (const item of products) {
            const product = await Product.findById(item.product)
            if (!product) {
                console.error('Producto no encontrado:', item.product)
                continue
            }
            doc.fontSize(12)
                .text(`${item.quantity} x ${product.name}`)
                .moveDown()
        }
        doc.fontSize(14)
            .text(`Total: $${total}`, { underline: true })
            .moveDown()

        doc.end()

        return res
            .status(200)
            .json({ message: 'Compra completada con éxito.', bill })
    } catch (error) {
        console.error('Error al completar la compra:', error)
        return res.status(500).json({
            message: 'Ocurrió un error al completar la compra.',
            error,
        })
    }
}

export const deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;
        // Buscar el carrito del usuario
        let cart = await ShoppingCart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).send({ message: 'Carrito de compras no encontrado.' });
        }
        // Encontrar el índice del producto en el carrito
        const index = cart.products.findIndex(item => item.product.toString() === productId);

        if (index === -1) {
            return res.status(404).send({ message: 'Producto no encontrado en el carrito.' });
        }
        // Eliminar el producto del carrito
        const deletedProduct = cart.products.splice(index, 1)[0];
        // Recalcular el total del carrito
        cart.total -= deletedProduct.subTotal;
        // Guardar los cambios en el carrito
        await cart.save();
        return res.status(200).send({
            message: 'Producto eliminado del carrito exitosamente.',
            deletedProduct,
            cart,
        });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        return res.status(500).send({
            message: 'Ocurrió un error al eliminar producto del carrito.',
            error,
        });
    }
};
