FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

# Copy workspace configs and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json of backend and local workspace dependencies
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/db/package.json ./packages/db/package.json

# Install dependencies (development dependencies are required for compilation)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Compile the TypeScript files in backend
RUN pnpm --filter @abdimas/backend build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

# Copy workspace definition files
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy node_modules (we copy the full workspace node_modules)
COPY --from=base /app/node_modules ./node_modules

# Copy dependency packages (needed at runtime because contracts/db are referenced as source TS files)
COPY --from=base /app/packages ./packages

# Copy the backend package
COPY --from=base /app/apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["pnpm", "start"]
