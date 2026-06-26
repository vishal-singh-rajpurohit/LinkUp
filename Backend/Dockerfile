FROM node:22.13.0 AS deps
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# RUN npm ci


FROM node:22.13.0 AS dev
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
USER appuser
EXPOSE 5000
CMD ["npx", "nodemon", "--watch", "src", "src/index.js"]

FROM node:22.13.0 AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup ./src ./src
COPY --chown=appuser:appgroup package.json ./
USER appuser
EXPOSE 5000
CMD ["node", "src/index.js"]