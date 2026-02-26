import mongoose, { Schema, Document } from 'mongoose';

export interface IMealLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
    items: string;
    calories: number;
    createdAt: Date;
}

const MealLogSchema = new Schema<IMealLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner'], required: true },
        items: { type: String, required: true },
        calories: { type: Number, required: true },
    },
    { timestamps: true }
);

MealLogSchema.index({ userId: 1, date: -1 });

export const MealLog = mongoose.model<IMealLog>('MealLog', MealLogSchema);
