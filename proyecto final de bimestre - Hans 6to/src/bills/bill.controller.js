import { model } from 'mongoose'
import Bill from './bill.model.js'




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
