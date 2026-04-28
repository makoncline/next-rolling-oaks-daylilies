FROM node:18.18.0-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/app/package.json packages/app/package.json
COPY packages/design-system/package.json packages/design-system/package.json

RUN npm ci

FROM node:18.18.0-bookworm-slim AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/app/node_modules ./packages/app/node_modules
COPY --from=deps /app/packages/design-system/node_modules ./packages/design-system/node_modules
COPY . .

RUN npm run build -w @packages/app

FROM node:18.18.0-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/app ./packages/app
COPY --from=builder /app/packages/design-system ./packages/design-system

RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@packages/app"]
