# ⚙️ ELLAURA — Configuration Guide

Detailed guide for configuring all ELLAURA services.

---

## Server Configuration (`server/.env`)

### Core Settings

```env
# Application mode: development | production | test
NODE_ENV=development

# Server port
PORT=5000
```

### Database

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ellaura

# MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ellaura?retryWrites=true&w=majority
```

### Authentication

```env
# JWT secrets — MUST be changed in production
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Token expiration
JWT_EXPIRE=7d            # Access token (short-lived)
JWT_REFRESH_EXPIRE=30d   # Refresh token (long-lived)
```

### AI Integration

```env
# Google Gemini API Key
# Get yours at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIza...your-key
```

### CORS & Security

```env
# Allowed frontend origins (comma-separated)
CORS_ORIGIN=http://localhost:3002,http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes in ms
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window
```

### OAuth Providers (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Navigate to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
```

#### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **App Registrations**
3. Create a new registration
4. Add redirect URI: `http://localhost:5000/api/auth/microsoft/callback`

```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### Grocery Concierge (Optional)

If using n8n for the grocery concierge workflow:

```env
N8N_GROCERY_WEBHOOK=https://your-n8n-instance/webhook/your-webhook-id
N8N_API_KEY=your-n8n-api-key
BLINKIT_AFFILIATE_TAG=your-blinkit-tag
AMAZON_AFFILIATE_TAG=your-amazon-tag
```

---

## Client Configuration (`client/.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# For Docker / production, point to your deployed backend:
# VITE_API_URL=https://api.ellaura.app/api
```

---

## Docker Configuration

### Environment Variables for Docker Compose

Create a `.env` file in the project root (not in server/ or client/):

```env
# Required
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Optional
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

These variables are injected into the containers via `docker-compose.yml`.

### Custom Build Args

```bash
# Build frontend with a custom API URL
docker compose build --build-arg VITE_API_URL=https://api.ellaura.app/api frontend
```

---

## MongoDB Setup Options

### Option 1: Local MongoDB

Install MongoDB Community Edition:
- **macOS:** `brew install mongodb-community`
- **Ubuntu:** [MongoDB APT install](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
- **Windows:** [MongoDB MSI installer](https://www.mongodb.com/try/download/community)

### Option 2: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user
4. Whitelist your IP (or use `0.0.0.0/0` for development)
5. Get your connection string
6. Replace `MONGODB_URI` in `server/.env`

### Option 3: Docker

This is handled automatically by `docker compose up`. MongoDB runs as a container with persistent volume.

---

## Production Checklist

- [ ] Change all default secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- [ ] Use MongoDB Atlas or dedicated MongoDB server
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `CORS_ORIGIN` with your domain
- [ ] Enable HTTPS via reverse proxy (nginx, Cloudflare)
- [ ] Set up proper rate limiting values
- [ ] Configure OAuth redirect URIs for your domain
- [ ] Enable logging and monitoring
- [ ] Set up database backups
