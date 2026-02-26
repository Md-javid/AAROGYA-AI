# ═══════════════════════════════════════════════
# ELLAURA Client — Multi-Stage Docker Build
# Stage 1: Build React app with Vite
# Stage 2: Serve with Nginx
# ═══════════════════════════════════════════════

# ── Stage 1: Build ──
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Copy source and build
COPY . .

# Build args for environment variables
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
