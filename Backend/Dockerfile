FROM node:20-slim

# Install build tools and Python required for compiling native modules (mediasoup worker)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python-is-python3 \
    build-essential \
    ca-certificates \
 && ln -sf /usr/bin/python3 /usr/bin/python \
 && rm -rf /var/lib/apt/lists/*

# Configure environment for mediasoup worker build
ENV PYTHON=python3
ENV PIP_BREAK_SYSTEM_PACKAGES=1

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
