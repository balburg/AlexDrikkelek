# Backend Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY packages/backend/package*.json ./
RUN npm ci

# Copy source code
COPY packages/backend/ ./

# Build
RUN npm run build

# Production image
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY packages/backend/package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]
