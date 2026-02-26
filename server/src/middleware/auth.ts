import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);

        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
