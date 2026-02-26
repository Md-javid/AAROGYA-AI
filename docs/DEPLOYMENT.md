# 🚢 ELLAURA — Production Deployment Guide

This guide covers deploying ELLAURA to various cloud platforms.

---

## Option 1: Docker Compose (Self-Hosted / VPS)

Ideal for VPS providers like DigitalOcean, Linode, Hetzner, AWS EC2.

### Prerequisites
- A VPS with Docker & Docker Compose installed
- A domain name (optional but recommended)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Md-javid/ELLAURA.git
cd ELLAURA

# 2. Create production environment file
cat > .env << EOF
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF

# 3. Build and deploy
docker compose up -d --build

# 4. Verify
docker compose ps
curl http://localhost:5000/health
```

### Add HTTPS with Nginx Reverse Proxy

Install Nginx and Certbot on your VPS, then create a config:

```nginx
server {
    listen 80;
    server_name ellaura.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name ellaura.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ellaura.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ellaura.yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }
}
```

---

## Option 2: Railway (Backend) + Vercel (Frontend)

### Backend on Railway

1. Go to [Railway](https://railway.app/)
2. Create a new project → Deploy from GitHub
3. Connect your `Md-javid/ELLAURA` repository
4. Set root directory to `server`
5. Add environment variables:
   - `MONGODB_URI` (use MongoDB Atlas)
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN` = your Vercel frontend URL
   - `NODE_ENV` = `production`
6. Deploy!

Railway auto-detects Node.js and runs `npm run build && npm start`.

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import from GitHub → select `Md-javid/ELLAURA`
3. Set root directory to `client`
4. Set framework to **Vite**
5. Add environment variable:
   - `VITE_API_URL` = `https://your-railway-backend.up.railway.app/api`
6. Deploy!

### MongoDB on Atlas

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist Railway IPs (or use `0.0.0.0/0`)
4. Copy the connection string → set as `MONGODB_URI` in Railway

---

## Option 3: AWS / GCP / Azure

### Using Docker

```bash
# Build production images
docker compose build

# Tag for your registry
docker tag ellaura-frontend:latest your-registry/ellaura-frontend:latest
docker tag ellaura-backend:latest your-registry/ellaura-backend:latest

# Push
docker push your-registry/ellaura-frontend:latest
docker push your-registry/ellaura-backend:latest
```

Deploy to:
- **AWS:** ECS, EKS, or App Runner
- **GCP:** Cloud Run or GKE
- **Azure:** Container Instances or AKS

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://api.ellaura.app/health

# Docker container status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Database Backups

```bash
# Manual backup
docker compose exec mongodb mongodump --db ellaura --out /data/backup

# Restore
docker compose exec mongodb mongorestore --db ellaura /data/backup/ellaura
```

### Updating

```bash
git pull origin main
docker compose up -d --build
```

---

## Scaling Estimates

| Users | MongoDB | Backend | Frontend | Est. Cost |
|-------|---------|---------|----------|-----------|
| 0–100 | Atlas M0 (Free) | Railway Free | Vercel Free | **$0/mo** |
| 100–1K | Atlas M2 ($9/mo) | Railway Hobby ($5/mo) | Vercel Free | **$14/mo** |
| 1K–10K | Atlas M10 ($57/mo) | Railway Pro ($20/mo) | Vercel Pro ($20/mo) | **$97/mo** |
| 10K+ | Atlas M30+ | Dedicated VPS | CDN | Custom |
