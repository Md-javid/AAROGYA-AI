import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { User } from '../models/User.ts';
import { config } from './env.js';

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (config.googleClientId && config.googleClientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.googleClientId,
                clientSecret: config.googleClientSecret,
                callbackURL: `${config.backendUrl}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ email: profile.emails?.[0]?.value });

                    if (user) {
                        // Update OAuth info
                        user.oauth = {
                            provider: 'google',
                            providerId: profile.id,
                        };
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        email: profile.emails?.[0]?.value,
                        password: Math.random().toString(36).slice(-8), // Random password (won't be used)
                        profile: {
                            name: profile.displayName || 'User',
                            age: 25,
                            gender: 'Other',
                            weight: 70,
                            height: 170,
                            region: 'India',
                            dietaryPreference: 'Vegetarian',
                            language: 'English',
                            goal: 'General Fitness',
                            activityLevel: 'Moderate',
                            fitnessLevel: 'Beginner',
                            hasInjuries: false,
                            dosha: 'Pitta',
                        },
                        oauth: {
                            provider: 'google',
                            providerId: profile.id,
                        },
                        subscription: {
                            plan: 'free',
                            status: 'active',
                            startDate: new Date(),
                        },
                        usage: {
                            aiDietPlans: 0,
                            aiWorkoutPlans: 0,
                            aiChats: 0,
                            lastReset: new Date(),
                        },
                    });

                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
}

// Microsoft OAuth Strategy
if (config.microsoftClientId && config.microsoftClientSecret) {
    passport.use(
        new MicrosoftStrategy(
            {
                clientID: config.microsoftClientId,
                clientSecret: config.microsoftClientSecret,
                callbackURL: `${config.backendUrl}/api/auth/microsoft/callback`,
                scope: ['user.read'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ email: profile.emails?.[0]?.value });

                    if (user) {
                        // Update OAuth info
                        user.oauth = {
                            provider: 'microsoft',
                            providerId: profile.id,
                        };
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        email: profile.emails?.[0]?.value,
                        password: Math.random().toString(36).slice(-8),
                        profile: {
                            name: profile.displayName || 'User',
                            age: 25,
                            gender: 'Other',
                            weight: 70,
                            height: 170,
                            region: 'India',
                            dietaryPreference: 'Vegetarian',
                            language: 'English',
                            goal: 'General Fitness',
                            activityLevel: 'Moderate',
                            fitnessLevel: 'Beginner',
                            hasInjuries: false,
                            dosha: 'Pitta',
                        },
                        oauth: {
                            provider: 'microsoft',
                            providerId: profile.id,
                        },
                        subscription: {
                            plan: 'free',
                            status: 'active',
                            startDate: new Date(),
                        },
                        usage: {
                            aiDietPlans: 0,
                            aiWorkoutPlans: 0,
                            aiChats: 0,
                            lastReset: new Date(),
                        },
                    });

                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
}

export default passport;
