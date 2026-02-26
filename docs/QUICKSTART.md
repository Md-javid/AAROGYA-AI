# 🚀 ELLAURA — Quick Start Guide

Get ELLAURA running locally in under 5 minutes.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| MongoDB | 6+ | [mongodb.com](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

**Optional:**
- Python 3.10+ (for ML model)
- Docker & Docker Compose (for containerized deployment)

---

## Method 1: Local Development (Recommended for Development)

### Step 1: Clone & Install

```bash
git clone https://github.com/Md-javid/ELLAURA.git
cd ELLAURA

# Install all dependencies (root + server + client)
npm run install:all
```

### Step 2: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key

### Step 3: Configure Environment

```bash
# Copy example env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set at minimum:
```env
MONGODB_URI=mongodb://localhost:27017/ellaura
GEMINI_API_KEY=paste-your-key-here
JWT_SECRET=any-random-string-here
JWT_REFRESH_SECRET=another-random-string-here
```

> 💡 Generate secure secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Step 4: Start MongoDB

If using local MongoDB:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

If using MongoDB Atlas, just update `MONGODB_URI` in `server/.env` with your Atlas connection string.

### Step 5: Launch!

```bash
npm run dev
```

🎉 **That's it!** Open your browser:
- **App:** http://localhost:3002
- **API:** http://localhost:5000/health

---

## Method 2: Docker (Recommended for Production)

### Step 1: Clone

```bash
git clone https://github.com/Md-javid/ELLAURA.git
cd ELLAURA
```

### Step 2: Set Environment

Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-random-secret
JWT_REFRESH_SECRET=your-random-refresh-secret
```

### Step 3: Launch All Services

```bash
docker compose up -d
```

### Step 4: Verify

```bash
# Check all services are running
docker compose ps

# Check backend health
curl http://localhost:5000/health
```

🎉 Open http://localhost:3002 in your browser!

---

## First Steps After Setup

1. **Register** — Create your account on the app
2. **Onboarding** — Complete the wellness questionnaire
3. **Generate Plans** — Get your first AI diet & workout plan
4. **Track** — Log your first meal, workout, or water intake
5. **Chat** — Ask the AI coach anything about fitness

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on MongoDB | Make sure MongoDB is running locally or Atlas URI is correct |
| `GEMINI_API_KEY is not configured` | Add your Gemini API key to `server/.env` |
| Port 5000 already in use | Change `PORT` in `server/.env` |
| Port 3002 already in use | Edit `server` port in `client/vite.config.ts` |
| `MODULE_NOT_FOUND` errors | Run `npm run install:all` again |
| Docker build fails | Ensure Docker Desktop is running; try `docker compose build --no-cache` |

---

## Need More Help?

- 📖 [Full Configuration Guide](CONFIGURATION.md)
- 📡 [API Documentation](API.md)
- 🚢 [Production Deployment](DEPLOYMENT.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
