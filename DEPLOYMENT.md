# VPS Deployment Notes

This app is a Next.js app in `packages/app`.

## Runtime

- Internal port: `3000`
- Start command: `npm run start -w @packages/app`
- Production build command: `npm run build -w @packages/app`
- The app should run behind the VPS Caddy route with traffic proxied to port `3000`.
- This repo uses `packages/design-system` as a git submodule. Initialize submodules before building the Docker image.

## Image Build

```sh
git submodule update --init --recursive
docker build -t ghcr.io/example/rolling-oaks-daylilies:latest .
```

## Required Environment

- `TURSO_DATABASE_URL`: Turso database URL.
- `TURSO_DATABASE_AUTH_TOKEN`: Turso auth token.
- `SMTP_USER`: Gmail account used for SMTP auth, for example `sendtomakon@gmail.com`.
- `SMTP_PASS`: Google app password for `SMTP_USER`.

## Optional Environment

- `CONTACT_TO_EMAIL`: comma-separated recipients for contact/cart messages. Defaults to `kaymcline@gmail.com`.
- `CONTACT_BCC_EMAIL`: optional comma-separated BCC recipients for contact/cart messages.
- `NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET`: image bucket host prefix used by `components/Image.tsx`, if the resized-image flow is in use.

## Compose Service

```yaml
services:
  app:
    image: ghcr.io/example/rolling-oaks-daylilies:latest
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - edge

networks:
  edge:
    external: true
```

## Caddy Route

```caddy
@rolling_oaks host rollingoaksdaylilies.example.com
handle @rolling_oaks {
  reverse_proxy app:3000
}
```

No persistent volume is required by the app itself; state lives in Turso and email is sent through Gmail SMTP.
