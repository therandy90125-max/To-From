# React Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Health check (Vite dev server)
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=20s \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]

