# Multi-stage Dockerfile for Standalone Backend (Node 20 Full)
# Context: packages/backend (NOT Monorepo Root)

# Stage 1: Dependencies
FROM node:20 AS deps
WORKDIR /app

# Install build dependencies (Safety net)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Copy project definition (Relative to packages/backend)
COPY package*.json ./

# Install dependencies (Standalone mode)
# No --workspace flag because we are inside the package itself
# Added verbose logging to debug build failures
RUN npm config set strict-ssl false
RUN npm install --legacy-peer-deps --verbose

# Stage 2: Builder
FROM node:20 AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (Relative to packages/backend)
COPY . .

# Build
RUN npm run build

# Stage 3: Runner
FROM node:20 AS runner
WORKDIR /app

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs backend

# Copy built app and dependencies
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

USER backend

EXPOSE 8080

# Health check
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/src/index.js"]
