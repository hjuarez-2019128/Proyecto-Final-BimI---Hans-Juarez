import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },

    description: {
        type: String,
        require: true
    }
},
{
    versionKey: false
})

export default mongoose.model('category', categorySchema)