import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Buffer } from 'buffer';
import { config } from '../config/env.js';
import { UserContext, CoachTone } from '../utils/contextAnalyzer.js';

// ─── Init ──────────────────────────────────────────────────────
let genAI: GoogleGenerativeAI | null = null;

try {
    if (config.geminiApiKey) {
        genAI = new GoogleGenerativeAI(config.geminiApiKey);
        console.log('[OK]    Gemini AI initialized successfully');
    } else {
        console.warn('[WARN]  GEMINI_API_KEY not found. AI features will be disabled.');
    }
} catch (error) {
    console.error('[ERROR] Failed to initialize Gemini AI:', error);
}

const getModel = (json = true): GenerativeModel => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');
    return genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: json ? { responseMimeType: 'application/json' } : {},
    });
};

export const isApiKeyAvailable = () => !!genAI;

// ─── Auto-retry on 429 (rate limit) ────────────────────────────
const withRetry = async <T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const status = err?.status ?? err?.statusCode ?? err?.httpStatusCode;
            if (status !== 429) throw err;
            if (attempt === maxAttempts) break;
            const waitMs = attempt * 5000 + 2000;
            console.warn(`[RETRY] Rate limited (429). Waiting ${Math.round(waitMs / 1000)}s before retry ${attempt + 1}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }
    throw lastError;
};

// ─── Gemini text helper ─────────────────────────────────────────
const geminiJSON = async (prompt: string): Promise<any> => {
    const model = getModel(true);
    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();
    // Strip markdown fences if present
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(clean);
};

const geminiText = async (system: string, user: string): Promise<string> => {
    const model = getModel(false);
    const combined = `${system}\n\nUser message: ${user}`;
    const result = await withRetry(() => model.generateContent(combined));
    return result.response.text().trim();
};

// ─── Tone Templates ────────────────────────────────────────────
const TONE_INSTRUCTIONS: Record<CoachTone, string> = {
    encouraging: `
TONE — ENCOURAGING:
The user is making solid progress. Be warm, supportive, and positive.
Acknowledge their recent wins specifically. Gently suggest improvements without lecturing.
Language style: "You're doing great — here's how to go even further."`,

    corrective: `
TONE — CORRECTIVE:
The user has specific gaps (sleep, water, consistency, nutrition). Be calm, direct, and constructive.
Name the exact issue and give a precise, actionable fix. No sugarcoating, but no negativity either.
Language style: "You missed X — here's exactly how to fix it today."`,

    motivating: `
TONE — MOTIVATING:
The user is slumping — missed workouts, poor sleep, possibly stressed.
Be energetic and uplifting. Remind them why they started. Make it feel doable, not overwhelming.
Use short punchy sentences. Lead with empathy, then a clear simple action step.
Language style: "It's okay — today is a fresh start. Here's ONE thing to do right now."`,

    celebratory: `
TONE — CELEBRATORY:
The user is crushing it — great streak, good sleep, good nutrition.
Go all in on celebrating their consistency. Make them feel genuinely proud.
Then give a "level up" challenge to keep the momentum.
Language style: "You're on fire 🔥 — let's push it even further."`,
};

// ─── Context Block Builder ─────────────────────────────────────
const buildContextBlock = (ctx: UserContext): string => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER'S LAST 7 DAYS — REAL DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ctx.summary}

ISSUES DETECTED:
${ctx.issues.length ? ctx.issues.map(i => `  ⚠ ${i}`).join('\n') : '  ✓ No major issues — user is on track'}

HIGHLIGHTS:
${ctx.highlights.length ? ctx.highlights.map(h => `  ★ ${h}`).join('\n') : '  (No standout highlights this week)'}

${TONE_INSTRUCTIONS[ctx.tone]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

// ─── Diet Plan ─────────────────────────────────────────────────
export const generateDietPlan = async (userProfile: any, ctx?: UserContext): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const dietAdjustments = ctx ? buildDietAdjustments(ctx) : '';
    const contextBlock = ctx ? buildContextBlock(ctx) : '';

    const prompt = `You are an expert Indian nutritionist and Ayurvedic wellness coach.

${contextBlock}

USER PROFILE:
- Region: ${userProfile.region || 'India'}
- Goal: ${userProfile.goal || 'General Health'}
- Wellness Personality: ${userProfile.dosha || 'Balanced'}
- Dietary Preference: ${userProfile.dietaryPreference || 'Vegetarian'}
- Age: ${userProfile.age || 'Not specified'} | Activity Level: ${userProfile.activityLevel || 'Moderate'}

DYNAMIC ADJUSTMENTS BASED ON THIS WEEK'S DATA:
${dietAdjustments}

INSTRUCTIONS:
1. Generate a 1-day personalized Indian meal plan
2. Each meal must include an "coachNote" field — a 1-sentence note that references the user's actual week
3. The "hydrationTip" must reference the user's actual water intake if context is available

Return JSON:
{
  "breakfast": {
    "dishName": "...", "quantity": "...", "calories": 350,
    "protein": "18g", "prepTime": "15 minutes",
    "ingredients": [], "instructions": [],
    "coachNote": "..."
  },
  "lunch": { "dishName": "...", "calories": 400, "protein": "20g", "prepTime": "...", "ingredients": [], "instructions": [], "coachNote": "..." },
  "snack": { "dishName": "...", "calories": 200, "protein": "5g", "prepTime": "...", "ingredients": [], "instructions": [], "coachNote": "..." },
  "dinner": { "dishName": "...", "calories": 350, "protein": "15g", "prepTime": "...", "ingredients": [], "instructions": [], "coachNote": "..." },
  "hydrationTip": "...",
  "regionalSpecialty": "...",
  "weeklyInsight": "One sentence about what this diet plan addresses from the user's recent patterns"
}`;

    return geminiJSON(prompt);
};

// ─── Workout Plan ──────────────────────────────────────────────
export const generateWorkoutPlan = async (userProfile: any, ctx?: UserContext): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const workoutAdjustments = ctx ? buildWorkoutAdjustments(ctx) : '';
    const contextBlock = ctx ? buildContextBlock(ctx) : '';

    const prompt = `You are an expert Indian fitness coach specializing in home workouts and yoga.

${contextBlock}

USER PROFILE:
- Goal: ${userProfile.goal || 'General Fitness'}
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Wellness Personality: ${userProfile.dosha || 'Balanced'}
- Age: ${userProfile.age} | Has Injuries: ${userProfile.hasInjuries ? `Yes — ${userProfile.injuries}` : 'No'}

DYNAMIC ADJUSTMENTS BASED ON THIS WEEK'S TRENDS:
${workoutAdjustments}

INSTRUCTIONS:
1. Generate a 1-day home workout plan tailored to the user's ACTUAL week, not just their profile
2. If they've had poor sleep, reduce intensity and add recovery exercises
3. If they broke a streak, make it emotionally easy to re-engage — short and achievable
4. Each exercise must include a "coachNote" motivating based on their actual week

Return JSON:
{
  "warmup": [{ "name": "...", "instruction": "...", "duration": "5 min", "coachNote": "..." }],
  "mainWorkout": [{ "name": "...", "sets": "3", "reps": "12", "instruction": "...", "coachNote": "..." }],
  "cooldown": [{ "name": "...", "instruction": "...", "duration": "5 min" }],
  "yogaPose": "...",
  "difficulty": "Beginner/Intermediate/Advanced",
  "sessionGoal": "One sentence on what this session is designed to achieve given user's recent patterns",
  "recoveryTip": "Specific tip based on their sleep/stress data this week"
}`;

    return geminiJSON(prompt);
};

// ─── Chat Coach ────────────────────────────────────────────────
export const chatWithCoach = async (message: string, userProfile: any, ctx?: UserContext): Promise<string> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const contextBlock = ctx ? buildContextBlock(ctx) : '';

    const systemPrompt = `You are Aarogya Coach — a smart, context-aware AI fitness and wellness assistant specializing in Indian health practices.

${contextBlock}

USER PROFILE:
- Name: ${userProfile.name || 'User'}
- Goal: ${userProfile.goal || 'General Health'}
- Wellness Personality: ${userProfile.dosha || 'Balanced'}
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Dietary Preference: ${userProfile.dietaryPreference || 'Vegetarian'}

RULES:
1. Always respond in the TONE specified above — do NOT ignore it
2. If the user's question is about diet/workout/sleep, reference their actual 7-day data in your answer
3. If issues were detected, proactively mention ONE fix even if the user didn't ask about it
4. Keep responses conversational, warm, and under 200 words unless detail is specifically requested
5. Be culturally aware — reference Indian food, festivals, seasons where relevant`;

    const reply = await geminiText(systemPrompt, message);
    return reply || "I'm here to help! Could you please rephrase your question?";
};

// ─── Meal Image Analysis ───────────────────────────────────────
export const analyzeMealImage = async (base64: string, userProfile?: any): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const wellnessType = userProfile?.dosha || 'Balanced';

    const prompt = `Analyze this image carefully. FIRST, determine if the image actually contains food or beverages. If it is NOT food (e.g., a person, a cat, an object, a landscape), you MUST set "isFood" to false and provide an error message in "dishName", with all other fields zeroed out.

If it IS food, analyze it for a ${wellnessType} wellness profile user.

Return strictly this JSON format:
{
  "isFood": true/false,
  "dishName": "...", // If isFood is false, put "Not a food item detected" here
  "calories": 450, // 0 if not food
  "macronutrients": { "protein": "20g", "carbs": "60g", "fats": "15g" }, // "0g" if not food
  "ayurvedicInsight": "...", // Empty if not food
  "wellnessCompatibility": "...", // Empty if not food
  "healthScore": 8, // 0 if not food
  "improvementTip": "..." // Empty if not food
}`;

    // Strip data URI prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    const model = getModel(true);
    const result = await withRetry(() => model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
    ]));

    const text = result.response.text().trim();
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(clean);
};

// ─── Voice Log ─────────────────────────────────────────────────
export const processVoiceLog = async (base64: string, mimeType: string): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    try {
        const base64Data = base64.replace(/^data:audio\/\w+;base64,/, '');
        let safeMimeType = mimeType;
        if (!safeMimeType || safeMimeType === 'audio/webm;codecs=opus') safeMimeType = 'audio/webm';

        const prompt = `Listen to this audio recording in which a user is logging a fitness or nutrition activity.
Extract the relevant details and return ONLY JSON:
{
  "type": "meal" or "workout",
  "mealType": "breakfast/lunch/dinner/snack (if meal, else null)",
  "items": "Description of food items (if meal, else null)",
  "calories": 500,
  "workoutType": "cardio/strength/yoga (if workout, else null)",
  "duration": 30,
  "intensity": "low/medium/high",
  "caloriesBurned": 200
}`;

        const model = getModel(true);
        const result = await withRetry(() => model.generateContent([
            { text: prompt },
            { inlineData: { mimeType: safeMimeType, data: base64Data } }
        ]));

        const text = result.response.text().trim();
        const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        return JSON.parse(clean);
    } catch (e) {
        console.error('Error in voice log:', e);
        throw e;
    }
};

// ─── Adjustment Helpers ────────────────────────────────────────
function buildDietAdjustments(ctx: UserContext): string {
    const lines: string[] = [];

    if (ctx.hasHighStress)
        lines.push('⚠ HIGH STRESS: Include magnesium-rich foods (banana, dark chocolate, nuts), anti-inflammatory spices (turmeric, ashwagandha), and easy-to-digest meals. Reduce spicy or heavy foods.');

    if (ctx.hasLowProtein)
        lines.push(`⚠ LOW CALORIES DETECTED (avg ${ctx.avgDailyCalories} kcal): Increase calorie density. Add paneer, eggs, dal, nuts, seeds. Each meal should hit at least 400 kcal.`);

    if (ctx.hasLowWater)
        lines.push(`⚠ DEHYDRATION RISK (avg ${ctx.avgWaterLiters}L/day): Include water-rich foods (cucumber, watermelon, coconut water). Hydration tip must be specific and urgent.`);

    if (ctx.hasPoorSleep)
        lines.push('⚠ POOR SLEEP: Include sleep-supporting foods in dinner — warm milk, tryptophan-rich foods (banana, milk, sesame seeds). Avoid caffeinated items after 2pm.');

    if (ctx.hasStreakRisk)
        lines.push('⚠ LOW ACTIVITY: Increase protein and fiber to support muscle retention during lower-activity period. Avoid excess carbs.');

    if (ctx.highlights.length && lines.length === 0)
        lines.push('✓ User is performing well — optimize for performance: slightly increase protein, add pre/post workout nutrition tips.');

    return lines.length ? lines.join('\n') : '✓ No specific dietary adjustments needed — standard balanced plan.';
}

function buildWorkoutAdjustments(ctx: UserContext): string {
    const lines: string[] = [];

    if (ctx.hasHighStress) {
        lines.push('⚠ HIGH STRESS MODE: Drop intensity to LOW. Focus on yoga, breathwork, and light movement. Session should feel restorative, not draining. Max 25 minutes.');
        return lines.join('\n');
    }

    if (ctx.hasPoorSleep)
        lines.push(`⚠ POOR SLEEP (avg ${ctx.avgSleepHours}h): Reduce main workout intensity by one level. Add extra cooldown (10 min). Include Yoga Nidra or Shavasana at end.`);

    if (ctx.hasStreakRisk && ctx.currentStreak === 0)
        lines.push('⚠ BROKEN STREAK — RE-ENGAGEMENT SESSION: Make this short (20–25 min), fun, and achievable. The goal is to break inertia, not set records. Lead with an exercise the user can complete easily.');

    if (ctx.currentStreak >= 5)
        lines.push(`✓ STRONG STREAK (${ctx.currentStreak} days): Push with a challenging session. Add progressive overload. Reward consistency with a harder variant.`);

    if (ctx.totalWorkoutMins > 180)
        lines.push('✓ HIGH VOLUME WEEK: Include active recovery elements. Add foam rolling or stretching to prevent overuse injury.');

    if (ctx.hasLowWater)
        lines.push('⚠ LOW HYDRATION: Shorten high-intensity blocks. Add hydration reminders inside each exercise note.');

    return lines.length ? lines.join('\n') : '✓ No specific workout adjustments — generate standard plan based on profile.';
}

// ─── 4-Week Roadmap Generator ──────────────────────────────────
export const generateFourWeekRoadmap = async (
    userProfile: any,
    weekDates: Array<{ start: string; end: string }>
): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const wellnessProfiles: Record<string, string> = {
        Vata: 'Vata type: natural tendency toward inconsistency — needs routine, warm-up emphasis, and restorative sessions. Avoid overtraining. Best exercises: yoga, swimming, pilates, gentle strength.',
        Pitta: 'Pitta type: competitive and intense — needs moderation, cooling exercises, structured rest. Avoid burnout. Best exercises: strength training, moderate cardio, martial arts.',
        Kapha: 'Kapha type: steady but slow to start — needs high-energy, varied, and progressive intensity to keep motivated. Best exercises: HIIT, cycling, CrossFit, dance.',
    };
    const wellnessNote = wellnessProfiles[userProfile.dosha] || 'Balanced wellness profile — standard progressive approach.';

    const injuryNote = userProfile.hasInjuries
        ? `CRITICAL: User has injuries — ${userProfile.injuries}. Modify ALL exercises to avoid aggravating this.`
        : 'No injuries — full exercise range available.';

    const prompt = `You are an elite Indian fitness coach designing a structured 4-week transformation plan.

USER PROFILE:
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Primary Goal: ${userProfile.goal || 'General Fitness'}
- Wellness Personality: ${userProfile.dosha || 'Balanced'}
- Activity Level: ${userProfile.activityLevel || 'Moderate'}
- Age: ${userProfile.age || 25} | Weight: ${userProfile.weight || 70}kg | Height: ${userProfile.height || 170}cm
- Dietary Preference: ${userProfile.dietaryPreference || 'Vegetarian'}

WELLNESS PERSONALITY GUIDANCE: ${wellnessNote}
INJURY STATUS: ${injuryNote}

WEEK DATE RANGES:
- Week 1: ${weekDates[0].start} to ${weekDates[0].end}
- Week 2: ${weekDates[1].start} to ${weekDates[1].end}
- Week 3: ${weekDates[2].start} to ${weekDates[2].end}
- Week 4: ${weekDates[3].start} to ${weekDates[3].end}

DESIGN RULES:
1. Each week MUST be more challenging than the previous
2. All exercises must be home-friendly
3. Include Indian food in diet guidelines

Return ONLY this JSON:
{
  "roadmapTitle": "Your 4-Week Transformation",
  "overview": "...",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Foundation",
      "philosophy": "...",
      "startDate": "${weekDates[0].start}",
      "endDate": "${weekDates[0].end}",
      "weeklyTargets": {
        "minWorkoutDays": 3,
        "targetSleepHours": 7.5,
        "waterTargetLiters": 2.5,
        "calorieTarget": 1800,
        "proteinTarget": "80g"
      },
      "workoutSchedule": [
        {
          "day": "Monday",
          "type": "Strength",
          "sessionName": "...",
          "durationMinutes": 35,
          "estimatedCaloriesBurn": 180,
          "exercises": [
            { "name": "Squats", "sets": "3", "reps": "12", "rest": "60s", "instruction": "...", "coachNote": "..." }
          ]
        }
      ],
      "dietGuidelines": {
        "strategy": "...",
        "calorieTarget": 1800,
        "proteinTarget": "80g",
        "focusFoods": ["Dal", "Paneer"],
        "avoidFoods": ["Fried snacks"],
        "mealTiming": "...",
        "hydrationTip": "...",
        "sampleMeal": "..."
      },
      "weeklyChallenge": "...",
      "successCriteria": "..."
    }
  ]
}`;

    return geminiJSON(prompt);
};

// ─── Weekly Feedback Generator ────────────────────────────────
export const generateWeeklyFeedback = async (data: any): Promise<string> => {
    if (!genAI) return generateFallbackFeedback(data);

    const gaps: string[] = [];
    const wins: string[] = [];

    if (data.actual.workoutDays >= data.targets.minWorkoutDays) wins.push(`completed ${data.actual.workoutDays} workout days`);
    else gaps.push(`only ${data.actual.workoutDays}/${data.targets.minWorkoutDays} workout days`);

    if (data.actual.avgSleepHours >= data.targets.targetSleepHours) wins.push(`great sleep`);
    else gaps.push(`low sleep`);

    if (data.actual.avgWater >= data.targets.waterTargetLiters) wins.push(`hydration on point`);
    else gaps.push(`low water`);

    const prompt = `You are Aarogya Coach giving a motivating but honest weekly performance review.

SCORE: ${data.score}/100
WINS: ${wins.join(', ')}
GAPS: ${gaps.join(', ')}

Write a 3-4 sentence personal feedback message celebrating wins and addressing gaps. No bullet points.`;

    const reply = await withRetry(() => getModel(false).generateContent(prompt));
    return reply.response.text().trim() || generateFallbackFeedback(data);
};

function generateFallbackFeedback(data: any): string {
    if (data.score >= 80) return `Incredible Week — you scored ${data.score}/100!`;
    if (data.score >= 60) return `Week done — ${data.score}/100. Solid start.`;
    return `Week complete with a score of ${data.score}/100. It was tough, but you showed up. Let's go!`;
}
