import mongoose from 'mongoose'

const billSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        nit: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        products: [
            {
                quantity: {
                    type: Number,
                    required: true,
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                subtotal: {
                    type: Number,
                },
            },
        ],
        total: {
            type: Number,
            required: true,
        },
    },
    {
        versionKey: false,
    }
)

export default mongoose.model('Bill', billSchema)
