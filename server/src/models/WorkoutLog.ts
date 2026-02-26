import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    type: string;
    durationMinutes: number;
    intensity: 'Low' | 'Medium' | 'High';
    caloriesBurned: number;
    createdAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true },
        type: { type: String, required: true },
        durationMinutes: { type: Number, required: true },
        intensity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
        caloriesBurned: { type: Number, required: true },
    },
    { timestamps: true }
);

WorkoutLogSchema.index({ userId: 1, date: -1 });

export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
