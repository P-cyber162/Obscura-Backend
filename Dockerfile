# Build stage
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy all root files
COPY . .

# Install dependencies
RUN npm ci --omit=dev

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-bookworm

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p uploads

# Expose port (adjust if needed)
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npm", "start"]