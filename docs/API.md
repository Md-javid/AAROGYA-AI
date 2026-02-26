# 📡 ELLAURA — API Documentation

Complete REST API reference for the ELLAURA backend.

**Base URL:** `http://localhost:5000`

---

## Authentication

All authenticated endpoints require a `Authorization: Bearer <token>` header.

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": "free",
    "createdAt": "2026-01-15T..."
  }
}
```

### OAuth

```
GET /api/auth/google          → Redirects to Google OAuth
GET /api/auth/google/callback  → Google callback handler
GET /api/auth/microsoft        → Redirects to Microsoft OAuth
GET /api/auth/microsoft/callback → Microsoft callback handler
```

---

## Activity Logs

### Workout Logs

```http
POST /api/logs/workout
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "strength",
  "exercise": "Bench Press",
  "duration": 45,
  "calories": 350,
  "notes": "4 sets of 12 reps"
}
```

```http
GET /api/logs/workout
Authorization: Bearer <token>
```

### Meal Logs

```http
POST /api/logs/meal
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grilled Chicken Salad",
  "calories": 450,
  "protein": 42,
  "carbs": 15,
  "fat": 22,
  "mealType": "lunch"
}
```

```http
GET /api/logs/meal
Authorization: Bearer <token>
```

### Sleep Logs

```http
POST /api/logs/sleep
Authorization: Bearer <token>
Content-Type: application/json

{
  "hours": 7.5,
  "quality": "good",
  "notes": "Slept well, no interruptions"
}
```

```http
GET /api/logs/sleep
Authorization: Bearer <token>
```

### Water Logs

```http
POST /api/logs/water
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "unit": "ml"
}
```

```http
GET /api/logs/water
Authorization: Bearer <token>
```

### Daily Stats

```http
GET /api/logs/stats/2026-01-15
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "date": "2026-01-15",
  "totalCaloriesConsumed": 2100,
  "totalCaloriesBurned": 550,
  "totalWater": 2500,
  "sleepHours": 7.5,
  "workoutCount": 2,
  "mealCount": 3
}
```

---

## AI Features

### Generate Diet Plan

```http
POST /api/ai/diet-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal": "weight_loss",
  "preferences": "vegetarian",
  "allergies": ["nuts"],
  "targetCalories": 1800
}
```

### Generate Workout Plan

```http
POST /api/ai/workout-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal": "muscle_gain",
  "fitnessLevel": "intermediate",
  "equipment": ["dumbbells", "barbell"],
  "daysPerWeek": 4
}
```

### Analyze Meal (Vision)

```http
POST /api/ai/analyze-meal
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "base64-encoded-image-data"
}
```

### Chat with AI Coach

```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What should I eat before a morning workout?",
  "context": "weight_loss"
}
```

### Voice Log

```http
POST /api/ai/voice-log
Authorization: Bearer <token>
Content-Type: application/json

{
  "transcript": "I just finished a 30 minute run and burned about 300 calories"
}
```

---

## Grocery Concierge

### Smart Grocery List

```http
POST /api/grocery/smart-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipe": "Paneer Tikka Masala",
  "servings": 4
}
```

---

## Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — Invalid input |
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — Subscription limit reached |
| `404` | Not Found — Resource doesn't exist |
| `429` | Too Many Requests — Rate limit exceeded |
| `500` | Internal Server Error |

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- When exceeded: `429 Too Many Requests`
