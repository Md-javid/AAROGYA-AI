import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { config } from '../config/env.js';

// Initialize the Google Generative AI client
let genAI: GoogleGenerativeAI | null = null;

try {
    if (config.geminiApiKey) {
        genAI = new GoogleGenerativeAI(config.geminiApiKey);
        console.log('✅ Google Generative AI initialized successfully');
    } else {
        console.warn('⚠️  GEMINI_API_KEY not found. AI features will be disabled.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Google Generative AI:', error);
}

export const isApiKeyAvailable = () => !!genAI;

// Safety settings for content generation
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

// Generation config
const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

export const generateDietPlan = async (userProfile: any): Promise<any> => {
    if (!genAI) {
        throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                ...generationConfig,
                responseMimeType: "application/json",
            },
            safetySettings,
        });

        const prompt = `You are an expert Indian nutritionist and Ayurvedic wellness coach. Create a personalized 1-day healthy Indian diet plan based on the following user profile:

Region: ${userProfile.region || 'India'}
Goal: ${userProfile.goal || 'General Health'}
Dosha: ${userProfile.dosha || 'Pitta'}
Dietary Preference: ${userProfile.dietaryPreference || 'Vegetarian'}
Age: ${userProfile.age || 'Not specified'}
Activity Level: ${userProfile.activityLevel || 'Moderate'}

Return a JSON object with the following structure:
{
    "breakfast": {
        "dishName": "Name of the dish",
        "quantity": "Serving size",
        "calories": 300,
        "protein": "15g",
        "prepTime": "15 minutes",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": ["step1", "step2"],
        "videoUrl": "https://youtube.com/example (optional)"
    },
    "lunch": { same structure as breakfast },
    "snack": { same structure as breakfast },
    "dinner": { same structure as breakfast },
    "hydrationTip": "Daily water intake recommendation",
    "regionalSpecialty": "A regional dish recommendation"
}

Make it culturally appropriate, delicious, and aligned with Ayurvedic principles.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error: any) {
        console.error('Diet plan generation error:', error);
        throw new Error(`Failed to generate diet plan: ${error.message}`);
    }
};

export const generateWorkoutPlan = async (userProfile: any): Promise<any> => {
    if (!genAI) {
        throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                ...generationConfig,
                responseMimeType: "application/json",
            },
            safetySettings,
        });

        const prompt = `You are an expert Indian fitness coach specializing in home workouts and yoga. Create a personalized 1-day home workout routine based on the following user profile:

Goal: ${userProfile.goal || 'General Fitness'}
Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
Dosha: ${userProfile.dosha || 'Pitta'}
Age: ${userProfile.age || 'Not specified'}
Has Injuries: ${userProfile.hasInjuries ? 'Yes' : 'No'}
Activity Level: ${userProfile.activityLevel || 'Moderate'}

Return a JSON object with the following structure:
{
    "warmup": [
        {
            "name": "Exercise name",
            "instruction": "How to perform"
        }
    ],
    "mainWorkout": [
        {
            "name": "Exercise name",
            "sets": "3",
            "reps": "12-15",
            "instruction": "How to perform"
        }
    ],
    "cooldown": [
        {
            "name": "Exercise name",
            "instruction": "How to perform"
        }
    ],
    "yogaPose": "Recommended yoga pose for the day",
    "difficulty": "Beginner/Intermediate/Advanced"
}

Make it safe, effective, and suitable for home workouts without equipment.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error: any) {
        console.error('Workout plan generation error:', error);
        throw new Error(`Failed to generate workout plan: ${error.message}`);
    }
};

export const analyzeMealImage = async (base64: string): Promise<any> => {
    if (!genAI) {
        throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                ...generationConfig,
                responseMimeType: "application/json",
            },
            safetySettings,
        });

        const prompt = `Analyze this Indian meal image. Identify the dish, estimate nutritional values, and provide Ayurvedic insights.

Return a JSON object with this structure:
{
    "dishName": "Name of the dish",
    "calories": 450,
    "macronutrients": {
        "protein": "20g",
        "carbs": "60g",
        "fats": "15g"
    },
    "ayurvedicInsight": "Ayurvedic perspective on this meal",
    "healthScore": 8
}`;

        const imagePart = {
            inlineData: {
                data: base64,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error: any) {
        console.error('Meal analysis error:', error);
        throw new Error(`Failed to analyze meal: ${error.message}`);
    }
};

export const chatWithCoach = async (message: string, userProfile: any): Promise<string> => {
    if (!genAI) {
        throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig,
            safetySettings,
        });

        const systemPrompt = `You are Aarogya Coach, an AI fitness and wellness assistant specializing in Ayurveda and Indian health practices.

User Profile:
- Name: ${userProfile.name || 'User'}
- Goal: ${userProfile.goal || 'General Health'}
- Dosha: ${userProfile.dosha || 'Not specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Dietary Preference: ${userProfile.dietaryPreference || 'Vegetarian'}

Be helpful, encouraging, culturally aware, and provide practical advice rooted in both modern fitness science and Ayurvedic wisdom.`;

        const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;

        return response.text() || "I'm here to help! Could you please rephrase your question?";
    } catch (error: any) {
        console.error('Chat error:', error);
        throw new Error(`Failed to process chat: ${error.message}`);
    }
};

export const processVoiceLog = async (base64: string, mimeType: string): Promise<any> => {
    if (!genAI) {
        throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                ...generationConfig,
                responseMimeType: "application/json",
            },
            safetySettings,
        });

        const prompt = `Analyze this voice log and extract fitness/nutrition information.

Return a JSON object with this structure:
{
    "type": "meal" or "workout",
    "mealType": "breakfast/lunch/dinner/snack (if meal)",
    "items": "Description of food items (if meal)",
    "calories": 500,
    "workoutType": "cardio/strength/yoga (if workout)",
    "duration": 30,
    "intensity": "low/medium/high",
    "caloriesBurned": 200
}`;

        const audioPart = {
            inlineData: {
                data: base64,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, audioPart]);
        const response = result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error: any) {
        console.error('Voice processing error:', error);
        throw new Error(`Failed to process voice log: ${error.message}`);
    }
};
