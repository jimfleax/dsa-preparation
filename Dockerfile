# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy the rest of the backend source
COPY backend/ ./

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built server from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the requested port
EXPOSE 7860

# Start the server
CMD ["node", "dist/server.cjs"]
