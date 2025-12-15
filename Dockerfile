# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/
# Install all dependencies (including dev) for build
RUN npm ci
COPY . .
# Build both frontend and backend
RUN npm run build -w packages/backend
RUN npm run build -w packages/frontend

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# Security: Run as non-root user
USER node

# Backend Port
EXPOSE 3000

# Start Backend (which serves Frontend static files)
CMD ["node", "packages/backend/dist/index.js"]
