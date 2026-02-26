import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import * as aiService from '../services/aiService.js';

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
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const plan = await aiService.generateDietPlan(user.profile);
        res.json({ plan });
    } catch (error: any) {
        console.error('Diet plan generation error:', error);
        res.status(500).json({
            error: 'Failed to generate diet plan',
            message: error.message || 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

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
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const plan = await aiService.generateWorkoutPlan(user.profile);
        res.json({ plan });
    } catch (error: any) {
        console.error('Workout plan generation error:', error);
        res.status(500).json({
            error: 'Failed to generate workout plan',
            message: error.message || 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const analyzeMeal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured. Please add it to your .env file.',
                helpUrl: 'https://aistudio.google.com/app/apikey'
            });
            return;
        }

        const { base64Image } = req.body;
        if (!base64Image) {
            res.status(400).json({ error: 'base64Image is required' });
            return;
        }

        const result = await aiService.analyzeMealImage(base64Image);
        res.json({ result });
    } catch (error: any) {
        console.error('Meal analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze meal',
            message: error.message || 'An unexpected error occurred'
        });
    }
};

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
        if (!message) {
            res.status(400).json({ error: 'message is required' });
            return;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const response = await aiService.chatWithCoach(message, user.profile);
        res.json({ response });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process chat',
            message: error.message || 'An unexpected error occurred'
        });
    }
};

export const processVoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({
                error: 'AI service unavailable',
                message: 'GEMINI_API_KEY is not configured. Please add it to your .env file.',
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
