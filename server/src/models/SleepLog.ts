import mongoose, { Schema, Document } from 'mongoose';

export interface ISleepLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    durationHours: number;
    quality: 1 | 2 | 3 | 4 | 5;
    createdAt: Date;
}

const SleepLogSchema = new Schema<ISleepLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        durationHours: { type: Number, required: true },
        quality: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
    },
    { timestamps: true }
);

SleepLogSchema.index({ userId: 1, date: -1 });

export const SleepLog = mongoose.model<ISleepLog>('SleepLog', SleepLogSchema);
