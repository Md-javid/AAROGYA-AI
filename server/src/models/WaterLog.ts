import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    amount: number;
    unit: 'Glasses' | 'Liters';
    createdAt: Date;
}

const WaterLogSchema = new Schema<IWaterLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        amount: { type: Number, required: true },
        unit: { type: String, enum: ['Glasses', 'Liters'], required: true },
    },
    { timestamps: true }
);

WaterLogSchema.index({ userId: 1, date: -1 });

export const WaterLog = mongoose.model<IWaterLog>('WaterLog', WaterLogSchema);
