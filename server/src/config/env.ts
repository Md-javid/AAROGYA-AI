import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aarogya',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    corsOrigin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:5173'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
    microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    // Grocery Concierge (n8n)
    n8nGroceryWebhook: process.env.N8N_GROCERY_WEBHOOK || 'http://localhost:5678/webhook/grocery-concierge',
    n8nApiKey: process.env.N8N_API_KEY || '',
    blinkitAffiliateTag: process.env.BLINKIT_AFFILIATE_TAG || 'aarogya-ai',
    amazonAffiliateTag: process.env.AMAZON_AFFILIATE_TAG || 'aarogyaai-21',
};

export const isProd = config.nodeEnv === 'production';
export const isDev = config.nodeEnv === 'development';
