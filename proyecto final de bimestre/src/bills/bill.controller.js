import { model } from 'mongoose'
import Bill from './bill.model.js'
import User from '../user/user.model.js'
import Product from '../product/product.model.js'

export const updateBill = async (req, res) => {
    try {
        const { id } = req.params
        const { updatedProduct } = req.body

        // Obtener el producto actualizado
        const { product, quantity } = updatedProduct

        // Verificar si la factura existe
        const bill = await Bill.findById(id)
        if (!bill) {
            return res.status(404).send({ error: 'Bill not found' })
        }

        // Verificar si el producto existe
        const existingProduct = await Product.findById(product)
        if (!existingProduct) {
            return res.status(404).send({ error: 'Product not found' })
        }

        // Verificar si la cantidad actualizada excede la cantidad disponible en el inventario
        if (quantity > existingProduct.units_available) {
            return res
                .status(400)
                .send({ error: 'Quantity exceeds available units for product' })
        }

        // Actualizar la factura con el producto actualizado
        const updatedBill = await Bill.findByIdAndUpdate(
            id,
            { $set: { 'products.$[elem]': updatedProduct } },
            { new: true, arrayFilters: [{ 'elem.product': product }] }
        )

        res.sebd(updatedBill)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Función para encontrar todas las facturas asociadas a un usuario específico con detalles de productos
export const findDetailedBillsByUser = async (req, res) => {
    const { userId } = req.params
    try {
        const bills = await Bill.find({ user: userId }).populate({
            path: 'products.product',
            model: 'Product',
            select: 'name price',
        })
        res.send(bills)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}
