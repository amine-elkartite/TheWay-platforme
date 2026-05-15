FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
COPY API/package*.json ./API/
RUN cd API && npm ci

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/API/node_modules ./API/node_modules
COPY . .
WORKDIR /app/API
EXPOSE 3001
CMD ["node", "server.js"]
