import { Schema, model } from "mongoose";

const shoppingCartSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        quantity: {
            type: Number,
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        subTotal: {
            type: Number,
            required: false
        }
    }],
    total: {
        type: Number,
        required: true
    }
}, {
    versionKey: false
})

export default model('ShoppingCart', shoppingCartSchema);