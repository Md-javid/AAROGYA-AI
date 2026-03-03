import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import * as aiService from '../services/aiService.js';
import { analyzeUserContext } from '../utils/contextAnalyzer.js';

// ─── Helper: fetch context (non-blocking on failure) ──────────
const getContext = async (userId: string) => {
    try {
        return await analyzeUserContext(userId);
    } catch (err) {
        console.warn('⚠ Context analysis failed (non-fatal):', err);
        return undefined;
    }
};

// ─── Diet Plan ─────────────────────────────────────────────────
export const generateDietPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured. Please add it to your .env file.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const user = await User.findById(req.userId);
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        // Analyze last 7 days before generating plan
        const ctx = await getContext(req.userId!);

        const plan = await aiService.generateDietPlan(user.profile, ctx);

        res.json({
            plan,
            context: ctx ? {
                tone: ctx.tone,
                issues: ctx.issues,
                highlights: ctx.highlights,
            } : null,
        });
    } catch (error: any) {
        console.error('Diet plan generation error:', error);
        res.status(500).json({
            error: 'Failed to generate diet plan',
            message: error.message || 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ─── Workout Plan ──────────────────────────────────────────────
export const generateWorkoutPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured. Please add it to your .env file.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const user = await User.findById(req.userId);
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const ctx = await getContext(req.userId!);

        const plan = await aiService.generateWorkoutPlan(user.profile, ctx);

        res.json({
            plan,
            context: ctx ? {
                tone: ctx.tone,
                issues: ctx.issues,
                highlights: ctx.highlights,
            } : null,
        });
    } catch (error: any) {
        console.error('Workout plan generation error:', error);
        res.status(500).json({
            error: 'Failed to generate workout plan',
            message: error.message || 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// ─── Chat ──────────────────────────────────────────────────────
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured. Please add it to your .env file.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const { message } = req.body;
        if (!message) { res.status(400).json({ error: 'message is required' }); return; }

        const user = await User.findById(req.userId);
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        const ctx = await getContext(req.userId!);

        const response = await aiService.chatWithCoach(message, user.profile, ctx);

        res.json({
            response,
            coachTone: ctx?.tone ?? 'encouraging',
        });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process chat',
            message: error.message || 'An unexpected error occurred'
        });
    }
};

// ─── Meal Image Analysis ───────────────────────────────────────
export const analyzeMeal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const { base64Image } = req.body;
        if (!base64Image) { res.status(400).json({ error: 'base64Image is required' }); return; }

        const user = await User.findById(req.userId);

        const result = await aiService.analyzeMealImage(base64Image, user?.profile);
        res.json({ result });
    } catch (error: any) {
        console.error('Meal analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze meal',
            message: error.message || 'An unexpected error occurred'
        });
    }
};

// ─── Voice Log ─────────────────────────────────────────────────
export const processVoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const { base64Audio, mimeType } = req.body;
        if (!base64Audio || !mimeType) {
            res.status(400).json({ error: 'base64Audio and mimeType are required' });
            return;
        }

        const result = await aiService.processVoiceLog(base64Audio, mimeType);
        res.json({ result });
    } catch (error: any) {
        console.error('Voice processing error:', error);
        res.status(500).json({
            error: 'Failed to process voice log',
            message: error.message || 'An unexpected error occurred'
        });
    }
};
