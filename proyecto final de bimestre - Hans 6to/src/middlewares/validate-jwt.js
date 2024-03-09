'use strict'

import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'

export const validateJwt = async (req, res, next) => {
    try {
        //Obtener la llave de acceso al token
        let secretKey = process.env.SECRET_KEY
        //obtener el token de los headers
        let { token } = req.headers
        //Verificar si viene el token
        if (!token) return res.status(401).send({ message: 'Unauthorized' })
        //Obtener el uid del usuario que envió el token
        let { uid } = jwt.verify(token, secretKey)
        //Validar si aún existe en la BD
        let user = await User.findOne({ _id: uid })
        if (!user)
            return res
                .status(404)
                .send({ message: 'User not found - Unauthorized' })
        req.user = user
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).send({ message: 'Invalid token' })
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        let { user } = req
        if (!user || user.role !== 'ADMIN')
            return res
                .status(403)
                .send({
                    message: `You dont have access | username: ${user.username}`,
                })
        next()
    } catch (err) {
        console.error(err)
        return res.status(403).send({ message: 'Unauthorized is not Admin' })
    }
}

export const isClient = async (req, res, next) => {
    try {
        let { user } = req
        if (!user || user.role !== 'CLIENT')
            return res
                .status(403)
                .send({
                    message: `You dont have access | username: ${user.username}`,
                })
        next()
    } catch (err) {
        console.error(err)
        return res.status(403).send({ message: 'Unauthorized is not Client' })
    }
}

export const deleteAccount = async (headers, confirmation, password) => {
    try {
        const token = headers.token

        // Verificar si viene el token
        if (!token) {
            throw new Error('Unauthorized')
        }

        // Verificar si se proporcionó la contraseña
        if (!password) {
            throw new Error('Password is required')
        }

        // Obtener la llave de acceso al token
        const secretKey = process.env.SECRET_KEY

        // Obtener el uid del usuario que envió el token
        const { uid } = jwt.verify(token, secretKey)

        // Validar si aún existe en la BD
        const user = await User.findOne({ _id: uid })

        if (!user) {
            throw new Error('User not found - Unauthorized')
        }

        // Verificar la contraseña para mayor seguridad
        if (!(await user.comparePassword(password))) {
            throw new Error('Invalid password')
        }

        // Verificar que la confirmación sea "acepto"
        if (confirmation !== 'acepto') {
            throw new Error('Confirmation must be "acepto" to delete account.')
        }

        // Marcar la cuenta para eliminación
        await User.findOneAndDelete({ _id: uid })
    } catch (error) {
        throw new Error(error.message)
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { name, username, password, email, age, phone } = req.body
        const token = req.headers.token
        if (!token) {
            return res.status(401).send('Unauthorized')
        }
        const secretKey = process.env.SECRET_KEY
        const { uid } = jwt.verify(token, secretKey)
        const user = await User.findOne({ _id: uid })

        if (!user) {
            return res.status(404).send('User not found - Unauthorized')
        }

        // Verificar que se haya proporcionado la contraseña
        if (!password) {
            return res
                .status(400)
                .send('Password is required for profile update.')
        }

        // Verificar la contraseña para mayor seguridad
        if (!(await user.comparePassword(password))) {
            return res.status(401).send('Invalid password')
        }

        // Actualizar solo los datos proporcionados
        if (name) user.name = name
        if (username) user.username = username
        if (email) user.email = email
        if (age) user.age = age
        if (phone) user.phone = phone

        await user.save()

        return res.status(200).send('Profile updated successfully.')
    } catch (error) {
        return res.status(500).send(error.message)
    }
}
