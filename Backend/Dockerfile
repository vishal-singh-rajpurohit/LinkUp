FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Pre-install official prebuilt mediasoup-worker binary to eliminate heavy C++ compilation and avoid Out-Of-Memory (OOM) crashes
ADD https://github.com/versatica/mediasoup/releases/download/3.19.2/mediasoup-worker-3.19.2-linux-x64-kernel6.tgz /tmp/mediasoup-worker.tgz
RUN tar -xzf /tmp/mediasoup-worker.tgz -C /usr/local/bin/ \
 && chmod +x /usr/local/bin/mediasoup-worker \
 && rm /tmp/mediasoup-worker.tgz

ENV MEDIASOUP_WORKER_BIN="/usr/local/bin/mediasoup-worker"

# Copy package files
COPY package*.json ./

# Install dependencies (production only) - skips compiling mediasoup worker
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 5000

# Run the server
CMD ["npm", "start"]
