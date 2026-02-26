<p align="center">
  <img src="docs/assets/ellaura-banner.png" alt="ELLAURA Banner" width="100%" />
</p>

<h1 align="center">🧘 ELLAURA — AI Fitness & Wellness Coach</h1>

<p align="center">
  <strong>A production-ready, AI-powered fitness and wellness platform with Ayurvedic insights, built on the MERN stack.</strong>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-▶-green?style=for-the-badge" /></a>
  <a href="#-docker-deployment"><img src="https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" /></a>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Subscription Plans](#-subscription-plans)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Category | Feature | Description |
|----------|---------|-------------|
| 🤖 **AI Coach** | Personalized Plans | Diet & workout plans via Google Gemini AI |
| 💬 **AI Chat** | 24/7 Wellness Assistant | Chat with an AI-powered fitness coach |
| 📊 **Tracking** | Activity Logs | Track workouts, meals, sleep & water intake |
| 📈 **Analytics** | Progress Dashboard | Visual charts, streaks & gamified XP system |
| 🧘 **Wellness** | Dhyana (Meditation) | Guided meditation & mental wellness tools |
| 🍎 **Nutrition** | Meal Vision | AI-powered meal photo analysis |
| 🏋️ **Fitness** | Workout Vision | AI form-check from camera/photos |
| 🎤 **Voice** | Voice Logging | Log activities via voice commands |
| 🛒 **Shopping** | Grocery Concierge | Smart grocery lists with affiliate links |
| 🏪 **Marketplace** | Food Marketplace | Discover healthy food options nearby |
| 🏋️ **Trainers** | Trainer Connect | Find & connect with fitness trainers |
| 🗺️ **Gym Finder** | Gym Locator | Discover gyms near you |
| 🎯 **Gamification** | XP & Levels | Duolingo-style progress system with streaks |
| 🔐 **Auth** | Secure Login | JWT + OAuth (Google, Microsoft) |
| 💳 **Subscription** | Tiered Plans | Free, Premium & Pro plans |
| 🤖 **ML Model** | AI Agent | Python-based ML model with LangChain integration |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      ELLAURA                            │
├──────────┬──────────────┬────────────┬──────────────────┤
│  Client  │    Server    │  ML Model  │    Database      │
│  (React) │  (Express)   │  (Python)  │   (MongoDB)      │
│          │              │            │                  │
│  Vite    │  TypeScript  │  Flask     │  Mongoose ODM    │
│  Tailwind│  JWT Auth    │  LangChain │                  │
│  Recharts│  Gemini API  │  Scikit    │                  │
│          │  Passport.js │  LangGraph │                  │
└────┬─────┴──────┬───────┴─────┬──────┴────────┬─────────┘
     │            │             │               │
     │   REST API │   REST API  │    Mongo Wire │
     └────────────┴─────────────┴───────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend** | Node.js, Express 4, TypeScript, Passport.js |
| **Database** | MongoDB 6+ with Mongoose ODM |
| **AI / ML** | Google Gemini API, LangChain, LangGraph, Scikit-learn |
| **Auth** | JWT (access + refresh tokens), bcrypt, Google OAuth 2.0, Microsoft OAuth |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD |
| **Security** | Helmet.js, CORS, express-rate-limit, input validation (Joi) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)
- **Python 3.10+** (optional, for ML model) — [Download](https://www.python.org/)

### 1. Clone the Repository

```bash
git clone https://github.com/Md-javid/ELLAURA.git
cd ELLAURA
```

### 2. Install Dependencies

```bash
# Install root + client + server dependencies
npm run install:all
```

### 3. Configure Environment Variables

Copy the example env files and fill in your values:

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your API keys

# Client (optional — defaults work for local dev)
cp client/.env.example client/.env
```

**Minimum required in `server/.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/ellaura
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-random-secret-key
JWT_REFRESH_SECRET=your-random-refresh-secret
```

> 💡 **Tip:** Generate secure secrets with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Start Development Servers

```bash
npm run dev
```

This launches both servers concurrently:
- 🌐 **Frontend:** http://localhost:3002
- 🔌 **Backend API:** http://localhost:5000
- 🏥 **Health Check:** http://localhost:5000/health

### 5. (Optional) Start ML Model Server

```bash
cd ml_model
pip install -r requirements.txt
python model_server.py
```

---

## 🐳 Docker Deployment

### Quick Docker Start

```bash
# Build and start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | `3002` | React app served via Nginx |
| `backend` | `5000` | Express API server |
| `ml-model` | `5001` | Python ML/AI agent server |
| `mongodb` | `27017` | MongoDB database |

### Docker Architecture

```
docker compose up
  ├── frontend    (Node build → Nginx)  :3002
  ├── backend     (Node + TypeScript)   :5000
  ├── ml-model    (Python + Flask)      :5001
  └── mongodb     (Mongo 6)            :27017
        └── volume: ellaura-mongo-data
```

### Production Deployment

```bash
# Build production images
docker compose -f docker-compose.yml build

# Deploy with environment variables
GEMINI_API_KEY=your-key docker compose up -d
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | JWT signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token secret |
| `JWT_EXPIRE` | No | `7d` | Access token TTL |
| `JWT_REFRESH_EXPIRE` | No | `30d` | Refresh token TTL |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| `CORS_ORIGIN` | No | `http://localhost:3002` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `MICROSOFT_CLIENT_ID` | No | — | Microsoft OAuth client ID |
| `MICROSOFT_CLIENT_SECRET` | No | — | Microsoft OAuth client secret |
| `N8N_GROCERY_WEBHOOK` | No | — | n8n grocery concierge webhook URL |

### Client (`client/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new account | No |
| `POST` | `/api/auth/login` | Login with email/password | No |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `GET` | `/api/auth/google` | Google OAuth login | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback | No |
| `GET` | `/api/auth/microsoft` | Microsoft OAuth login | No |

### Activity Logs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/logs/workout` | Log a workout | ✅ |
| `GET` | `/api/logs/workout` | Get workout history | ✅ |
| `POST` | `/api/logs/meal` | Log a meal | ✅ |
| `GET` | `/api/logs/meal` | Get meal history | ✅ |
| `POST` | `/api/logs/sleep` | Log sleep data | ✅ |
| `GET` | `/api/logs/sleep` | Get sleep history | ✅ |
| `POST` | `/api/logs/water` | Log water intake | ✅ |
| `GET` | `/api/logs/water` | Get water history | ✅ |
| `GET` | `/api/logs/stats/:date` | Get aggregated daily stats | ✅ |

### AI Features

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/diet-plan` | Generate personalized diet plan | ✅ |
| `POST` | `/api/ai/workout-plan` | Generate workout plan | ✅ |
| `POST` | `/api/ai/analyze-meal` | Analyze meal from image | ✅ |
| `POST` | `/api/ai/chat` | Chat with AI wellness coach | ✅ |
| `POST` | `/api/ai/voice-log` | Process voice command | ✅ |

### Grocery Concierge

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/grocery/smart-list` | Generate smart grocery list | ✅ |

---

## 📁 Project Structure

```
ELLAURA/
├── client/                     # React Frontend
│   ├── components/             # UI Components
│   │   ├── Auth.tsx            # Authentication views
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Chat.tsx            # AI chat interface
│   │   ├── FoodTracker.tsx     # Meal tracking
│   │   ├── MovementTracker.tsx # Workout tracking
│   │   ├── ProgressView.tsx    # Analytics & charts
│   │   ├── DhyanaView.tsx      # Meditation module
│   │   ├── SettingsView.tsx    # User settings
│   │   ├── GymLocatorView.tsx  # Gym finder
│   │   ├── TrainerConnectView.tsx # Trainer marketplace
│   │   ├── ShoppingView.tsx    # Shopping lists
│   │   ├── FoodMarketplaceView.tsx # Food marketplace
│   │   └── ...                 # Other components
│   ├── services/               # API service layer
│   ├── src/                    # App entry, auth pages
│   ├── App.tsx                 # Root component
│   ├── types.ts                # TypeScript types
│   ├── constants.ts            # App constants
│   ├── Dockerfile              # Client Docker config
│   ├── nginx.conf              # Nginx SPA config
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # DB, env, passport config
│   │   ├── controllers/        # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── aiController.ts
│   │   │   └── logController.ts
│   │   ├── middleware/         # Auth & subscription guards
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Business logic (AI service)
│   │   ├── utils/              # Helpers (JWT, email)
│   │   └── server.ts           # App entry point
│   ├── Dockerfile              # Server Docker config
│   └── package.json
│
├── ml_model/                   # Python ML Service
│   ├── agent.py                # LangChain AI agent
│   ├── model_server.py         # Flask API server
│   ├── train.py                # Model training script
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # ML service Docker config
│
├── docs/                       # Documentation
│   ├── QUICKSTART.md           # Quick start guide
│   ├── CONFIGURATION.md        # Detailed config guide
│   ├── API.md                  # Full API documentation
│   ├── DEPLOYMENT.md           # Production deployment
│   └── CONTRIBUTING.md         # Contribution guidelines
│
├── .github/workflows/          # CI/CD pipelines
├── docker-compose.yml          # Multi-service orchestration
├── package.json                # Root workspace scripts
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## 💰 Subscription Plans

| Feature | Free | Premium ($9.99/mo) | Pro ($19.99/mo) |
|---------|------|---------------------|------------------|
| Diet Plans / week | 3 | 50 | Unlimited |
| Workout Plans / week | 3 | 50 | Unlimited |
| AI Chat Messages / week | 20 | 200 | Unlimited |
| Meal Vision Analysis | ❌ | ✅ | ✅ |
| Workout Form Check | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

---

## 🔒 Security

- **Helmet.js** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **Rate Limiting** — 100 requests per 15 minutes (configurable)
- **JWT Authentication** — Access + refresh token rotation
- **bcrypt** — Password hashing with salt rounds
- **Joi Validation** — Request body/params validation
- **XSS Protection** — Input sanitization

---

## 🤝 Contributing

We welcome contributions! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

```bash
# Fork & clone
git clone https://github.com/your-username/ELLAURA.git

# Create a feature branch
git checkout -b feature/awesome-feature

# Make changes, commit
git commit -m "feat: add awesome feature"

# Push and create PR
git push origin feature/awesome-feature
```

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [LangChain](https://www.langchain.com/) for ML agent framework
- [MongoDB](https://www.mongodb.com/) for database
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

---

<p align="center">
  Built with ❤️ by the ELLAURA Team
</p>
