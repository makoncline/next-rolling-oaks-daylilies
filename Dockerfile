FROM node:22-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/app/package.json packages/app/package.json
COPY packages/design-system/package.json packages/design-system/package.json

RUN npm ci

FROM base AS builder

WORKDIR /app

ARG NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET=images.daylilycatalog.com
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET=${NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/app/node_modules ./packages/app/node_modules
COPY --from=deps /app/packages/design-system/node_modules ./packages/design-system/node_modules
COPY . .

RUN npm run build -w @packages/app

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PUBLIC_SNAPSHOT_DIR=/app/.public-data

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/.public-data \
  && chown nextjs:nodejs /app/.public-data

COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/node_modules/@libsql ./packages/app/node_modules/@libsql
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/static ./packages/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/public ./packages/app/public

USER nextjs

EXPOSE 3000

CMD ["node", "packages/app/server.js"]
