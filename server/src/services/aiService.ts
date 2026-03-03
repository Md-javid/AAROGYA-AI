import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { config } from '../config/env.js';
import { UserContext, CoachTone } from '../utils/contextAnalyzer.js';

// ─── Init ──────────────────────────────────────────────────────
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

// ─── Shared configs ────────────────────────────────────────────
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

// ─── Auto-retry on 429 (rate limit) ────────────────────────────
// Extracts the retryDelay from the API error response and waits exactly
// that long before retrying — up to 3 attempts total.
const withRetry = async <T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const status = err?.status ?? err?.statusCode;
            if (status !== 429) throw err; // only retry on rate limit
            if (attempt === maxAttempts) break;

            // Parse retryDelay from error details (Google sends e.g. "47s")
            let waitMs = attempt * 20_000; // fallback: 20s, 40s
            try {
                const retryInfo = err?.errorDetails?.find((d: any) =>
                    d['@type']?.includes('RetryInfo'));
                if (retryInfo?.retryDelay) {
                    const secs = parseFloat(retryInfo.retryDelay.replace('s', ''));
                    if (!isNaN(secs)) waitMs = secs * 1000 + 2000; // +2s buffer
                }
            } catch { /* ignore parse errors */ }

            console.warn(`⏳ Rate limited (429). Waiting ${Math.round(waitMs / 1000)}s before retry ${attempt + 1}/${maxAttempts}...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }
    throw lastError;
};


// ─── Tone Templates ────────────────────────────────────────────
// These define HOW the AI should speak based on what the user's week looked like.

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
// Injected into every prompt so Gemini knows what's actually happening in the user's life.

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

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, responseMimeType: 'application/json' },
        safetySettings,
    });

    // Context-driven diet adjustments
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
2. Each meal must include an "coachNote" field — a 1-sentence note that references the user's actual week (e.g. if low calories detected, suggest calorie-dense meals; if stressed, suggest magnesium-rich foods)
3. The "hydrationTip" must reference the user's actual water intake if context is available

Return JSON:
{
  "breakfast": {
    "dishName": "...", "quantity": "...", "calories": 350,
    "protein": "18g", "prepTime": "15 minutes",
    "ingredients": [], "instructions": [],
    "coachNote": "..."
  },
  "lunch":   { same structure },
  "snack":   { same structure },
  "dinner":  { same structure },
  "hydrationTip": "...",
  "regionalSpecialty": "...",
  "weeklyInsight": "One sentence about what this diet plan addresses from the user's recent patterns"
}`;

    const result = await withRetry(() => model.generateContent(prompt));
    return JSON.parse(result.response.text());
};

// ─── Workout Plan ──────────────────────────────────────────────

export const generateWorkoutPlan = async (userProfile: any, ctx?: UserContext): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, responseMimeType: 'application/json' },
        safetySettings,
    });

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

    const result = await withRetry(() => model.generateContent(prompt));
    return JSON.parse(result.response.text());
};

// ─── Chat Coach ────────────────────────────────────────────────

export const chatWithCoach = async (message: string, userProfile: any, ctx?: UserContext): Promise<string> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig,
        safetySettings,
    });

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

    const fullPrompt = `${systemPrompt}\n\nUser says: ${message}`;
    const result = await withRetry(() => model.generateContent(fullPrompt));
    return result.response.text() || "I'm here to help! Could you please rephrase your question?";
};

// ─── Meal Image Analysis ───────────────────────────────────────

export const analyzeMealImage = async (base64: string, userProfile?: any): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, responseMimeType: 'application/json' },
        safetySettings,
    });

    const wellnessType = userProfile?.dosha || 'Balanced';

    const prompt = `Analyze this Indian meal image for a ${wellnessType} wellness profile user.

Return JSON:
{
  "dishName": "...",
  "calories": 450,
  "macronutrients": { "protein": "20g", "carbs": "60g", "fats": "15g" },
  "ayurvedicInsight": "Wellness insight for ${wellnessType} profile",
  "wellnessCompatibility": "Great Choice" | "Decent Choice" | "Avoid This",
  "healthScore": 8,
  "improvementTip": "One simple way to make this meal healthier"
}`;

    const imagePart = { inlineData: { data: base64, mimeType: 'image/jpeg' as const } };
    const result = await withRetry(() => model.generateContent([prompt, imagePart]));
    return JSON.parse(result.response.text());
};

// ─── Voice Log ─────────────────────────────────────────────────

export const processVoiceLog = async (base64: string, mimeType: string): Promise<any> => {
    if (!genAI) throw new Error('AI service not initialized. Please configure GEMINI_API_KEY.');

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, responseMimeType: 'application/json' },
        safetySettings,
    });

    const prompt = `Analyze this voice log and extract fitness/nutrition information.
Return JSON:
{
  "type": "meal" | "workout",
  "mealType": "breakfast/lunch/dinner/snack (if meal)",
  "items": "Description of food items (if meal)",
  "calories": 500,
  "workoutType": "cardio/strength/yoga (if workout)",
  "duration": 30,
  "intensity": "low/medium/high",
  "caloriesBurned": 200
}`;

    const audioPart = { inlineData: { data: base64, mimeType } };
    const result = await withRetry(() => model.generateContent([prompt, audioPart]));
    return JSON.parse(result.response.text());
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

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, responseMimeType: 'application/json', maxOutputTokens: 16384 },
        safetySettings,
    });

    // Map wellness personality to training philosophy
    const wellnessProfiles: Record<string, string> = {
        Vata: 'Vata type: natural tendency toward inconsistency — needs routine, warm-up emphasis, and restorative sessions. Avoid overtraining. Best exercises: yoga, swimming, pilates, gentle strength.',
        Pitta: 'Pitta type: competitive and intense — needs moderation, cooling exercises, structured rest. Avoid burnout. Best exercises: strength training, moderate cardio, martial arts.',
        Kapha: 'Kapha type: steady but slow to start — needs high-energy, varied, and progressive intensity to keep motivated. Best exercises: HIIT, cycling, CrossFit, dance.',
    };
    const wellnessNote = wellnessProfiles[userProfile.dosha] || 'Balanced wellness profile — standard progressive approach.';

    const injuryNote = userProfile.hasInjuries
        ? `CRITICAL: User has injuries — ${userProfile.injuries}. Modify ALL exercises to avoid aggravating this. Substitute impact exercises with low-impact alternatives.`
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
- Week 1 (Foundation):           ${weekDates[0].start} to ${weekDates[0].end}
- Week 2 (Progressive Overload): ${weekDates[1].start} to ${weekDates[1].end}
- Week 3 (Optimization):         ${weekDates[2].start} to ${weekDates[2].end}
- Week 4 (Peak Conditioning):    ${weekDates[3].start} to ${weekDates[3].end}

DESIGN RULES:
1. Each week MUST be more challenging than the previous
2. Week 1: 3 workout days, lower intensity, habit-building focus
3. Week 2: 4 workout days, introduce progressive overload (increase sets/weight)
4. Week 3: 4-5 workout days, optimize timing, refine form, increase intensity
5. Week 4: 5 workout days, peak effort — use all training principles learned
6. Include 2 rest/recovery days per week minimum
7. Calorie and protein targets must increase across weeks for muscle building goals, decrease for weight loss
8. All exercises must be home-friendly (no gym equipment required unless specified)
9. Include Indian food in diet guidelines (dal, sabzi, roti, rice, paneer, etc.)
10. Each exercise needs clear instructions a beginner can follow

Return ONLY this JSON (no markdown, no commentary):
{
  "roadmapTitle": "Your 4-Week [Goal] Transformation",
  "overview": "2-3 sentence overview of the full program",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Foundation",
      "philosophy": "1 sentence on the week's approach",
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
          "sessionName": "Full Body Foundation",
          "durationMinutes": 35,
          "estimatedCaloriesBurn": 180,
          "exercises": [
            { "name": "Squats", "sets": "3", "reps": "12", "rest": "60s", "instruction": "Stand feet shoulder-width...", "coachNote": "Week 1 — focus on form, not speed" }
          ]
        },
        {
          "day": "Tuesday",
          "type": "Rest",
          "sessionName": "Active Recovery",
          "durationMinutes": 0,
          "estimatedCaloriesBurn": 0,
          "exercises": [],
          "restActivity": "10-minute morning walk or light stretching"
        }
      ],
      "dietGuidelines": {
        "strategy": "Caloric maintenance with emphasis on whole foods",
        "calorieTarget": 1800,
        "proteinTarget": "80g",
        "focusFoods": ["Dal", "Paneer", "Oats", "Banana"],
        "avoidFoods": ["Fried snacks", "Packaged foods"],
        "mealTiming": "Breakfast 7am, Lunch 1pm, Snack 4pm, Dinner 7pm",
        "hydrationTip": "Start each morning with 2 glasses of warm water",
        "sampleMeal": "Oats upma for breakfast, Dal rice for lunch, Paneer salad for dinner"
      },
      "weeklyChallenge": "Complete all 3 workout days without skipping",
      "successCriteria": "3+ workout days, 7h+ sleep, 2.5L water daily"
    },
    { "weekNumber": 2, "theme": "Progressive Overload", ... },
    { "weekNumber": 3, "theme": "Optimization", ... },
    { "weekNumber": 4, "theme": "Peak Conditioning", ... }
  ]
}`;

    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();
    return JSON.parse(text);
};

// ─── Weekly Feedback Generator ────────────────────────────────

export const generateWeeklyFeedback = async (data: {
    weekNumber: number;
    theme: string;
    targets: {
        minWorkoutDays: number;
        targetSleepHours: number;
        waterTargetLiters: number;
        calorieTarget: number;
    };
    actual: {
        workoutDays: number;
        avgSleepHours: number;
        avgCalories: number;
        avgWater: number;
    };
    score: number;
    badgesEarned: string[];
    userProfile: { fitnessLevel: string; goal: string };
}): Promise<string> => {
    if (!genAI) return generateFallbackFeedback(data);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        generationConfig: { ...generationConfig, maxOutputTokens: 512 },
        safetySettings,
    });

    const gaps: string[] = [];
    const wins: string[] = [];

    if (data.actual.workoutDays >= data.targets.minWorkoutDays) wins.push(`completed ${data.actual.workoutDays} workout days`);
    else gaps.push(`only ${data.actual.workoutDays}/${data.targets.minWorkoutDays} workout days`);

    if (data.actual.avgSleepHours >= data.targets.targetSleepHours) wins.push(`great sleep (${data.actual.avgSleepHours.toFixed(1)}h avg)`);
    else gaps.push(`low sleep (${data.actual.avgSleepHours.toFixed(1)}h vs ${data.targets.targetSleepHours}h target)`);

    if (data.actual.avgWater >= data.targets.waterTargetLiters) wins.push(`hydration on point (${data.actual.avgWater.toFixed(1)}L)`);
    else gaps.push(`low water (${data.actual.avgWater.toFixed(1)}L vs ${data.targets.waterTargetLiters}L target)`);

    const prompt = `You are Aarogya Coach giving a motivating but honest weekly performance review.

WEEK ${data.weekNumber} — ${data.theme}
Score: ${data.score}/100
Badges earned: ${data.badgesEarned.join(', ') || 'None'}
User goal: ${data.userProfile.goal} | Level: ${data.userProfile.fitnessLevel}

WINS this week: ${wins.join(', ') || 'None'}
GAPS this week: ${gaps.join(', ') || 'None'}

Write a 3-4 sentence personal feedback message:
- Start with an honest assessment of the score (${data.score}/100)
- Celebrate specific wins (use the exact numbers)
- Address gaps with ONE concrete fix for next week
- End with strong motivation for Week ${data.weekNumber + 1 <= 4 ? data.weekNumber + 1 : 'completion'}
Keep it personal, warm, direct. No bullet points — just flowing text.`;

    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text().trim();
};

function generateFallbackFeedback(data: {
    weekNumber: number; score: number; actual: { workoutDays: number };
}): string {
    if (data.score >= 80) {
        return `Incredible Week ${data.weekNumber} — you scored ${data.score}/100! With ${data.actual.workoutDays} workout days under your belt, you're showing real commitment. Keep this momentum into the next phase of your transformation.`;
    }
    if (data.score >= 60) {
        return `Week ${data.weekNumber} done — ${data.score}/100. You got ${data.actual.workoutDays} workouts in, which is a solid start. Next week, focus on consistency and hitting your daily targets to unlock higher scores.`;
    }
    return `Week ${data.weekNumber} complete with a score of ${data.score}/100. It was a tough week, but you showed up. The next week is a fresh start — small daily actions compound into massive results. Let's go!`;
}
