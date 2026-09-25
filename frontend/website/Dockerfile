FROM node:24-alpine AS base
WORKDIR /app

# Dependencies (cached until the lockfile changes)
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/app/.next/cache npm run build

# Runtime: standalone output only, no npm or source code
FROM base AS runtime
# Docker sets HOSTNAME to the container id, which would make Next listen on it only
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn* /usr/local/bin/yarn*

COPY --from=build /app/public ./public
# .next must be writable by the app for ISR and image cache
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
