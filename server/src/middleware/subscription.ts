import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from './auth.js';

// Plan limits
const PLAN_LIMITS = {
    free: {
        aiDietPlans: 3,
        aiWorkoutPlans: 3,
        aiChats: 20,
    },
    premium: {
        aiDietPlans: 50,
        aiWorkoutPlans: 50,
        aiChats: 200,
    },
    pro: {
        aiDietPlans: -1, // unlimited
        aiWorkoutPlans: -1,
        aiChats: -1,
    },
    enterprise: {
        aiDietPlans: -1,
        aiWorkoutPlans: -1,
        aiChats: -1,
    },
};

export const checkUsageLimit = (feature: 'aiDietPlans' | 'aiWorkoutPlans' | 'aiChats') => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const plan = user.subscription.plan;
            const limit = PLAN_LIMITS[plan][feature];

            // Check if usage needs reset (weekly reset)
            const now = new Date();
            const lastReset = new Date(user.usage.lastReset);
            const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceReset >= 7) {
                // Reset usage
                user.usage.aiDietPlans = 0;
                user.usage.aiWorkoutPlans = 0;
                user.usage.aiChats = 0;
                user.usage.lastReset = now;
                await user.save();
            }

            // Check limit (-1 means unlimited)
            if (limit !== -1 && user.usage[feature] >= limit) {
                res.status(403).json({
                    error: 'Usage limit reached',
                    message: `You've reached your ${plan} plan limit for ${feature}. Upgrade to get more!`,
                    currentUsage: user.usage[feature],
                    limit,
                    plan,
                });
                return;
            }

            // Increment usage
            user.usage[feature]++;
            await user.save();

            next();
        } catch (error) {
            res.status(500).json({ error: 'Failed to check usage limit' });
        }
    };
};
