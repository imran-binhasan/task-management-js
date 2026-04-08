# Use Debian slim to provide stable native build tooling for bcrypt and native deps
FROM node:22-bullseye-slim AS deps
WORKDIR /app

# Install system build deps required for some native modules during install
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  build-essential \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack and pin Yarn to v1 for stability
RUN corepack enable && corepack prepare yarn@1.22.19 --activate

# Copy package manifests and install via yarn (use immutable for Yarn 4+)
COPY package.json yarn.lock* ./
RUN yarn install --immutable || yarn install

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
# Install production deps using yarn v1 for a clean runtime state
RUN corepack enable && corepack prepare yarn@1.22.19 --activate && yarn install --production --immutable || true
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
