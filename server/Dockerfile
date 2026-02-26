# ═══════════════════════════════════════════════
# ELLAURA Server — Multi-Stage Docker Build
# Stage 1: Build TypeScript to JavaScript
# Stage 2: Run production server
# ═══════════════════════════════════════════════

# ── Stage 1: Build ──
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (including devDependencies for TypeScript build)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ── Stage 2: Production ──
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --omit=dev && npm cache clean --force

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S ellaura && \
    adduser -S ellaura -u 1001 -G ellaura
USER ellaura

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
