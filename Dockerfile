# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install all deps (incl. dev) for the Nest build.
COPY package*.json ./
RUN npm ci

# Compile TypeScript -> dist, then drop dev dependencies.
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy only what's needed to run.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Run as the built-in non-root user.
USER node

EXPOSE 5000
CMD ["node", "dist/main.js"]
