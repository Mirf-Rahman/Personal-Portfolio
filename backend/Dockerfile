# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Declare build args so DO App Platform build-time env vars are available
# during 'next build' (Kaniko passes them via --build-arg)
# NOTE: Only SPACES_* and CORS_ORIGINS needed at build time for webpack inlining.
# Do NOT add NODE_ENV here - it causes npm ci to skip devDependencies.
ARG SPACES_ENDPOINT
ARG SPACES_ACCESS_KEY
ARG SPACES_SECRET_KEY
ARG SPACES_BUCKET
ARG SPACES_REGION
ARG SPACES_CDN_URL
ARG SPACES_FOLDER_PREFIX
ARG CORS_ORIGINS

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install postgresql-client for potential db scripts
RUN apk add --no-cache postgresql-client

# Copy package files from build stage
COPY --from=build /app/package.json /app/package-lock.json* ./


RUN npm ci


ENV NODE_ENV=production

# Copy built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/src/lib/db ./src/lib/db
COPY --from=build /app/seed.ts ./seed.ts

# Copy scripts if any
COPY scripts ./scripts

# Convert line endings from CRLF to LF (Windows to Unix)
RUN find ./scripts -type f -name "*.sh" -exec sed -i 's/\r$//' {} \; 2>/dev/null || true

# Make scripts executable
RUN find ./scripts -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the application with seed
CMD ["./scripts/startup.sh"]
