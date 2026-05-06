import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.mongodbUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`[OK]    MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error(`[ERROR] MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[WARN]  MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error(`[ERROR] Failed to connect to MongoDB: ${error}`);
        process.exit(1);
    }
};
