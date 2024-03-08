import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    units_available: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        require: true
    }
}, {
    versionKey: false 
});


const Product = mongoose.model('Product', productSchema); // Registrar el modelo "Product"

export default Product;

