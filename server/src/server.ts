import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';
import oauthRoutes from './routes/oauth.js';
import groceryRoutes from './routes/grocery.js';

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/grocery', groceryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
