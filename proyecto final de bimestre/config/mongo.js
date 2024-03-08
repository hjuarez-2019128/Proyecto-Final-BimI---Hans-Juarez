'use strict';

import mongoose from 'mongoose';

export const connect = async () => {
    try {
        // Proceso de conexión
        mongoose.connection.on('error', () => {
            console.log('MongoDB | no se pudo conectar a MongoDB');
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | intentando conectar');
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | conectado a MongoDB');
        });
        mongoose.connection.once('open', () => {
            console.log('MongoDB | conectado a la base de datos');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | reconectado a MongoDB');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | desconectado');
        });
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50
        });
    } catch (err) {
        console.error('La conexión a la base de datos falló', err);
    }
};
