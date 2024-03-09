'use strict'

import User from './user.model.js'
import Bill from '../bills/bill.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}
export const registerUser = async (req, res) => {
    try {
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)
        //Asignar el rol por defecto
        data.role = 'CLIENT'
        //Guardar la información en la BD
        let user = new User(data)
        await user.save() //Guardar en la BD
        //Responder al usuario
        return res.send({
            message: `Registered successfully, can be logged with username ${user.username}`,
        })
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .send({ message: 'Error registering user', err: err })
    }
}

export const registerAdmin = async (req, res) => {
    try {
        let data = req.body
        //Encriptar la contraseña
        data.password = await encrypt(data.password)
        //Asignar el rol para la administrador
        data.role = 'ADMIN'
        //Guardar la información en la BD
        let user = new User(data)
        await user.save() //Guardar en la BD
        //Responder al usuario
        return res.send({
            message: `Registered successfully, can be logged with username ${user.username}`,
        })
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .send({ message: 'Error registering Admin', err: err })
    }
}

export const login = async (req, res) => {
    try {
        //Capturar los datos (body)
        let { username, password } = req.body
        //Validar que el usuario exista
        let user = await User.findOne({ username }) //buscar un solo registro
        //Verifico que la contraseña coincida
        if (user && (await checkPassword(password, user.password))) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
            }
            //Generar el Token
            let token = await generateJwt(loggedUser)
            //Respondo al usuario
            return res.send({
                message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token,
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

// obtener el historial de compras del usuario
export const getUserPurchaseHistory = async (req, res) => {
    try {
        // Obtener el ID del usuario del token
        const userIdFromToken = req.user._id

        // Buscar todas las facturas asociadas con el usuario
        const purchaseHistory = await Bill.find({ user: userIdFromToken })

        // Devolver las facturas encontradas
        res.status(200).send(purchaseHistory)
    } catch (error) {
        console.error(
            'Error al obtener el historial de compras del usuario:',
            error
        )
        res.status(500).send({
            message:
                'Ocurrió un error al obtener el historial de compras del usuario.',
        })
    }
}
