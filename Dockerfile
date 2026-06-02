# --- Stage 1: Build Frontend React Application ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend dependency manifests
COPY frontend/package*.json ./

# Install development dependencies for build
RUN npm ci

# Copy frontend source files
COPY frontend/ ./

# Compile frontend static assets to /app/frontend/dist
RUN npm run build

# --- Stage 2: Serve Application via Express Backend ---
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3001

# Copy backend dependency manifests
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN cd backend && npm ci --only=production

# Copy backend source files
COPY backend/ ./backend/

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port 3001
EXPOSE 3001

# Start the unified backend
CMD ["node", "backend/index.js"]
