import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { sendOTPEmail } from '../utils/email.js';

// Generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for registration
export const sendRegistrationOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists with this email' });
            return;
        }

        // Generate OTP
        const otpCode = generateOTP();

        // Delete any existing OTPs for this email and purpose
        await OTP.deleteMany({ email, purpose: 'registration' });

        // Create new OTP
        await OTP.create({
            email,
            otp: otpCode,
            purpose: 'registration',
        });

        // Send OTP via email (for now, we'll log it - in production, use a real email service)
        console.log(`📧 OTP for ${email}: ${otpCode}`);

        // In production, uncomment this:
        // await sendOTPEmail(email, otpCode, 'registration');

        res.status(200).json({
            message: 'OTP sent successfully to your email',
            // For development only - remove in production
            otp: otpCode,
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP and register user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, otp, profile } = req.body;

        // Validate required fields
        if (!email || !password || !otp || !profile) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({
            email,
            otp,
            purpose: 'registration',
            verified: false,
        });

        if (!otpRecord) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        if (otpRecord.expiresAt < new Date()) {
            res.status(400).json({ error: 'OTP has expired' });
            return;
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Create new user
        const user = await User.create({
            email,
            password,
            profile,
            isEmailVerified: true,
            verifiedAt: new Date(),
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

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                subscription: user.subscription,
                isEmailVerified: user.isEmailVerified,
            },
            accessToken,
            refreshToken,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login existing user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
        const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                subscription: user.subscription,
                usage: user.usage,
                isEmailVerified: user.isEmailVerified,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Get current user
export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile,
                subscription: user.subscription,
                usage: user.usage,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }

        // Verify refresh token (implement JWT verification)
        // For now, simplified version
        const accessToken = generateAccessToken({ userId: 'temp', email: 'temp' });

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
