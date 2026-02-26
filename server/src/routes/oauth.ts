import express, { Request, Response } from 'express';
import passport from '../config/passport.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` }),
    (req: Request, res: Response) => {
        const user = req.user as any;

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

        // Redirect to frontend with tokens
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    }
);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));

router.get(
    '/microsoft/callback',
    passport.authenticate('microsoft', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` }),
    (req: Request, res: Response) => {
        const user = req.user as any;

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

        // Redirect to frontend with tokens
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    }
);

export default router;
