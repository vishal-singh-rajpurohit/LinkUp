FROM node:22.4.1-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.4.1-alpine AS dev
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
USER appuser
EXPOSE 5173
CMD ["npm", "run", "dev"]


FROM node:22.4.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_EMOJI_API_KEY
ARG VITE_API
ARG VITE_API_
ARG VITE_API_CHAT_SECRET_KEY
ENV VITE_API_EMOJI_API_KEY=$VITE_API_EMOJI_API_KEY
ENV VITE_API=$VITE_API
ENV VITE_API_=$VITE_API_
ENV VITE_API_CHAT_SECRET_KEY=$VITE_API_CHAT_SECRET_KEY
RUN npm run build

FROM nginx:1.27-alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/app.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]