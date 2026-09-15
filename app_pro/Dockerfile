# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Declare build arguments
ARG VITE_BASE_URL
ARG VITE_API_EMOJI_API_KEY
ARG VITE_API
ARG VITE_API_
ARG VITE_API_CHAT_SECRET_KEY

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_API_EMOJI_API_KEY=$VITE_API_EMOJI_API_KEY
ENV VITE_API=$VITE_API
ENV VITE_API_=$VITE_API_
ENV VITE_API_CHAT_SECRET_KEY=$VITE_API_CHAT_SECRET_KEY

# Copy dependency definitions first
COPY package*.json ./

# Install packages
RUN npm install

# Now copy the rest of the frontend source code
COPY . .

# Build static assets
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]