import { UserProfile, DietPlan, WorkoutPlan, MealVisionResult, WorkoutVisionResult } from "../types";

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('accessToken');
    return token;
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
};

export const isApiKeyAvailable = () => true; // Backend handles API key

export const analyzeMealImage = async (base64: string): Promise<MealVisionResult> => {
    try {
        const result = await apiCall('/ai/analyze-meal', {
            method: 'POST',
            body: JSON.stringify({ base64Image: base64 }),
        });
        return result.result;
    } catch (error) {
        console.error('Meal analysis error:', error);
        // Return fallback data
        return {
            dishName: "Sample Dish",
            calories: 500,
            macronutrients: {
                protein: "20g",
                carbs: "60g",
                fats: "15g"
            },
            ayurvedicInsight: "Unable to analyze meal at this time",
            healthScore: 7
        };
    }
};

export const analyzeWorkoutImage = async (base64: string): Promise<WorkoutVisionResult> => {
    try {
        const result = await apiCall('/ai/analyze-workout', {
            method: 'POST',
            body: JSON.stringify({ base64Image: base64 }),
        });
        return result.result;
    } catch (error) {
        console.error('Workout analysis error:', error);
        // Return fallback data
        return {
            identifiedExercise: "Exercise Analysis",
            formAnalysis: "Unable to analyze workout form at this time. Please ensure good lighting and clear view of the exercise.",
            musclesWorked: ["General"],
            safetyRating: 75,
            tip: "Maintain proper form and consult a trainer if unsure about technique."
        };
    }
};

export const getAarogyaNews = async (user: UserProfile): Promise<string[]> => {
    return [
        `Welcome back, ${user.name}! Your ${user.dosha} dosha is balanced today.`,
        `${user.region} seasonal foods are in abundance - perfect for your diet plan.`,
        `Your fitness level: ${user.fitnessLevel} - Keep pushing towards ${user.goal}!`
    ];
};

export const generateDietPlan = async (user: UserProfile): Promise<DietPlan> => {
    try {
        const result = await apiCall('/ai/diet-plan', {
            method: 'POST',
        });
        return result.plan;
    } catch (error: any) {
        console.error('Diet plan generation error:', error);
        throw new Error(error.message || 'Failed to generate diet plan');
    }
};

export const generateWorkoutPlan = async (user: UserProfile): Promise<WorkoutPlan> => {
    try {
        const result = await apiCall('/ai/workout-plan', {
            method: 'POST',
        });
        return result.plan;
    } catch (error: any) {
        console.error('Workout plan generation error:', error);
        throw new Error(error.message || 'Failed to generate workout plan');
    }
};

export const generateVedicStoryText = async (user: UserProfile): Promise<string> => {
    return `A tale of ${user.dosha} balance awaits...`;
};

export const generateVedicStoryAudio = async (text: string): Promise<string | null> => {
    return null;
};

export const chatWithCoach = async (history: any[], user: UserProfile, message: string) => {
    try {
        const result = await apiCall('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
        return result.response;
    } catch (error: any) {
        console.error('Chat error:', error);
        throw new Error(error.message || 'Failed to chat with coach');
    }
};

export const generateProgressAnalysis = async (user: UserProfile, workouts: any[], meals: any[], sleep: any[]): Promise<string> => {
    return `Your progress is remarkable, ${user.name}! Keep maintaining your ${user.dosha} balance.`;
};

export const generateMealImage = async (dishName: string): Promise<string | null> => {
    return null;
};

export const processVoiceLog = async (base64: string, mimeType: string): Promise<any> => {
    try {
        const result = await apiCall('/ai/voice-log', {
            method: 'POST',
            body: JSON.stringify({ base64Audio: base64, mimeType }),
        });
        return result.result;
    } catch (error: any) {
        console.error('Voice processing error:', error);
        throw new Error(error.message || 'Failed to process voice log');
    }
};
