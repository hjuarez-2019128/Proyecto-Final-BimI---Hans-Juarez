import express from 'express'
import {validateJwt,isAdmin, isClient, deleteAccount, updateProfile} from '../middlewares/validate-jwt.js'

import {test, registerUser ,login, getUserPurchaseHistory, registerAdmin} from './user.controller.js'

const api = express.Router()

//registrar usuario 
api.post('/register', registerUser)
//Logear el usuario
api.post('/login', login)
//registrar usuario como Administrador
api.post('/Admins', registerAdmin)
//Rutas valida la información admin
api.get('/test', [validateJwt, isAdmin], test)
// Actualiza el usuario
api.put('/updates', [validateJwt],updateProfile)

api.get('/history', validateJwt, getUserPurchaseHistory);
// Eliminar el usuario segun su token

api.delete('/delete-account', validateJwt, async (req, res) => {
    try {
        const { confirmation, password } = req.body;
        const headers = req.headers;
        const result = await deleteAccount(headers, confirmation, password);
        res.send(result);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default api    
