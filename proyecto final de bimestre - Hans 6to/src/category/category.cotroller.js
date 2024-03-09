import Category from './category.model.js'
import Product from '../product/product.model.js'
import { checkUpdate } from '../utils/validator.js'
const DEFAULT_CATEGORY_ID = '65ebdad90087693b53d8c941' // aqui debes pegar el id la categoria que vas a usar por defecto en mi caso este fue el ID

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const aggregate = async (req, res) => {
    try {
        let data = req.body
        let category = new Category(data)
        await category.save()
        return res.send({ message: `The category was added successfully ${category.name}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'error the category was not added' })
    }
}

export const updateCategory = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body

        let update = checkUpdate(data, id) // Asumiendo que checkUpdate es una función que valida los datos de actualización
        if (!update) {
            return res.status(400).send({ message: 'Data has been sent that cannot be updated or data is missing' })
        }

        // Agregar categoría si está presente en la solicitud
        if (req.body.category) {
            data.category = req.body.category
        }

        let updatedCategory = await Category.findOneAndUpdate({ _id: id }, data, { new: true })

        if (!updatedCategory) {
            return res.status(404).send({ message: 'update not found and not updated' })
        }
        return res.send({ message: ' updated successfully', updatedCategory })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error updating category' })
    }
}

// Obtener todos las categorias existentes
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
        res.status(200).send(categories)
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}

// Método para obtener la categoría predeterminada
async function getDefaultCategory() {
    return await Category.findById(DEFAULT_CATEGORY_ID)
}

// Método para eliminar una categoría y transferir productos a la categoría predeterminada
export const CategoryPredetermined = async (req, res) => {
    try {
        const categoryId = req.params.id

        // Busca la categoría que se eliminará
        const categoryToDelete = await Category.findById(categoryId)
        if (!categoryToDelete) {
            return res.status(404).send({ message: 'Categoría no encontrada' })
        }

        // Encuentra la categoría predeterminada
        const defaultCategory = await getDefaultCategory()
        if (!defaultCategory) {
            return res.status(500).send({ message: 'Categoría predeterminada no encontrada' })
        }

        // Transfiere los productos a la categoría predeterminada
        await Product.updateMany({ category: categoryId }, { category: DEFAULT_CATEGORY_ID })

        // Elimina la categoría
        await Category.findByIdAndDelete(categoryId)

        res.status(200).send({ message: 'Categoría eliminada exitosamente' })
    } catch (err) {
        res.status(500).send({ message: err.message })
    }
}
