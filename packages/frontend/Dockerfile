# Frontend Dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY packages/frontend/package*.json ./
RUN npm ci

# Copy source code
COPY packages/frontend/ ./

# Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy package files
COPY packages/frontend/package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
