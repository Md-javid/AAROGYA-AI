import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.mongodbUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};
