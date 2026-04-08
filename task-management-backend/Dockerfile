# Use Debian slim to provide stable native build tooling for bcrypt and native deps
FROM node:22-bullseye-slim AS deps
WORKDIR /app

# Install system build deps required for some native modules during install
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  build-essential \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack to ensure yarn is available in the environment
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package manifests and install via yarn (use frozen-lockfile when present)
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --network-concurrency 1 || yarn install --network-concurrency 1

FROM node:22-bullseye-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production runner: copy only runtime artifacts
FROM node:22-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
# Install production deps using yarn for a clean runtime state
RUN corepack enable && corepack prepare yarn@stable --activate && yarn install --production --frozen-lockfile --network-concurrency 1 || true
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
