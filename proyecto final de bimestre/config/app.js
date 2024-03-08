//Levantar servidor HTTP (express)
//ESModules 
'use strict'

//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import productRoutes from '../src/product/product.router.js'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.router.js'
import shoppingCartRoutes from '../src/ShoppingCart/shoppingCart.router.js'
import billRoutes from '../src/bills/bill.router.js'
//Configuraciones
const app = express()
config();
const port = process.env.PORT || 3056

//Configuración del servidor
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors()) //Aceptar o denegar solicitudes de diferentes orígenes (local, remoto) / políticas de acceso
app.use(helmet()) //Aplica capa de seguridad básica al servidor
app.use(morgan('dev')) //Logs de solicitudes al servidor HTTP

//Declaración de rutas

//app.use(userRoutes)
//app.use('/animal', animalRoutes)
app.use(productRoutes)
app.use(userRoutes)
app.use('/category', categoryRoutes)
app.use('/carts',shoppingCartRoutes)
app.use('/bill',billRoutes)

//Levantar el servidor
export const initServer = ()=>{
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}