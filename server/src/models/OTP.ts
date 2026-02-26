import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    purpose: 'registration' | 'password_reset';
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            enum: ['registration', 'password_reset'],
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for automatic deletion of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ email: 1, purpose: 1 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
