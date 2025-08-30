# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies using npm ci for production builds
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose the port the app runs on
EXPOSE 5001

# Define environment variables with defaults
ENV NODE_ENV=production
ENV PORT=5001

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check to ensure the server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["npm", "start"]