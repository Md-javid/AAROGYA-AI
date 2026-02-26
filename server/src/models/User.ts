import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    isEmailVerified: boolean;
    verifiedAt?: Date;
    profile: {
        name: string;
        age: number;
        gender: 'Male' | 'Female' | 'Other';
        weight: number;
        height: number;
        region: string;
        dietaryPreference: string;
        language: string;
        goal: string;
        activityLevel: string;
        fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
        hasInjuries: boolean;
        injuries?: string;
        medicalConditions?: string;
        motto?: string;
        dosha?: 'Vata' | 'Pitta' | 'Kapha' | 'Unset';
    };
    subscription: {
        plan: 'free' | 'premium' | 'pro' | 'enterprise';
        status: 'active' | 'cancelled' | 'expired';
        startDate?: Date;
        endDate?: Date;
        stripeCustomerId?: string;
        razorpayCustomerId?: string;
    };
    usage: {
        aiDietPlans: number;
        aiWorkoutPlans: number;
        aiChats: number;
        lastReset: Date;
    };
    oauth?: {
        provider: 'google' | 'microsoft';
        providerId: string;
    };
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
        profile: {
            name: { type: String, required: true },
            age: { type: Number, required: true },
            gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
            weight: { type: Number, required: true },
            height: { type: Number, required: true },
            region: { type: String, required: true },
            dietaryPreference: { type: String, required: true },
            language: { type: String, default: 'English' },
            goal: { type: String, required: true },
            activityLevel: { type: String, required: true },
            fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
            hasInjuries: { type: Boolean, default: false },
            injuries: String,
            medicalConditions: String,
            motto: String,
            dosha: { type: String, enum: ['Vata', 'Pitta', 'Kapha', 'Unset'], default: 'Unset' },
        },
        subscription: {
            plan: { type: String, enum: ['free', 'premium', 'pro', 'enterprise'], default: 'free' },
            status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
            startDate: Date,
            endDate: Date,
            stripeCustomerId: String,
            razorpayCustomerId: String,
        },
        usage: {
            aiDietPlans: { type: Number, default: 0 },
            aiWorkoutPlans: { type: Number, default: 0 },
            aiChats: { type: Number, default: 0 },
            lastReset: { type: Date, default: Date.now },
        },
        oauth: {
            provider: { type: String, enum: ['google', 'microsoft'] },
            providerId: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.plan': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
