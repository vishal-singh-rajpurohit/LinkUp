FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 5000

# Run the server
CMD ["npm", "start"]
