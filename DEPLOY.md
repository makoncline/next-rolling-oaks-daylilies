# Deploy Rolling Oaks Daylilies

This app deploys as a Docker image on a single VPS. Public traffic reaches the container through Cloudflare Tunnel, local Caddy, and the shared Docker network `edge`.

## App Contract

- App name: `rolling-oaks-daylilies`
- Internal port: `3000`
- Container bind host: `0.0.0.0`
- Health endpoint: `GET /api/health`
- Smoke-test path: `/api/health`
- GHCR image: `ghcr.io/makoncline/rolling-oaks-daylilies`
- Persistent volumes: none

The container runs the Next.js standalone server from the image. The source repo is not required on the VPS at runtime.

## External Services

- Turso/libSQL database
- Gmail SMTP for contact and cart emails
- Optional resized-image bucket host configured by `NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET`

`/api/health` performs a lightweight Turso database check with `SELECT 1`. SMTP is intentionally not checked because a probe would need to log in to Gmail on every request and can be slow or rate-limited; successful contact/cart form submissions exercise SMTP separately.

## Environment

Create `/srv/stacks/rolling-oaks-daylilies/.env` on the VPS from `.env.example`.

Required secrets:

- `TURSO_DATABASE_URL`
- `TURSO_DATABASE_AUTH_TOKEN`
- `SMTP_USER`
- `SMTP_PASS`

Required non-secret config:

- `CONTACT_TO_EMAIL`: comma-separated recipient list for contact/cart messages.

Optional config:

- `CONTACT_BCC_EMAIL`: comma-separated BCC recipient list.
- `NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET`: image bucket host prefix used by `packages/app/components/Image.tsx`.

Build-time-only variables:

- None.

## Build Image

Build locally:

```sh
git submodule update --init --recursive
docker build -t rolling-oaks-daylilies:local .
```

During PR testing, GitHub Actions builds the image once, pushes it to GHCR with the full commit SHA tag, then pulls that same image back down for both `GET /api/health` and Playwright verification. Re-enable the commented `push` trigger when `main` should publish images automatically.

## Local Production-Image Test

Test a locally built image:

```sh
docker build -t rolling-oaks-daylilies:local .
docker run --rm --env-file .env.local -p 3000:3000 rolling-oaks-daylilies:local
curl -fsS http://localhost:3000/api/health
```

Test a GHCR image:

```sh
docker pull ghcr.io/makoncline/rolling-oaks-daylilies:TAG
docker run --rm --env-file .env.local -p 3000:3000 ghcr.io/makoncline/rolling-oaks-daylilies:TAG
curl -fsS http://localhost:3000/api/health
```

## VPS Compose

Use this under `/srv/stacks/rolling-oaks-daylilies/compose.yaml`, replacing `${IMAGE_TAG}` with a pushed full commit SHA or `main`.

```yaml
services:
  app:
    image: ghcr.io/makoncline/rolling-oaks-daylilies:${IMAGE_TAG}
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - edge

networks:
  edge:
    external: true
```

The service does not publish host ports. Caddy reaches it over the external `edge` Docker network.

## Caddy Route

Add this route to the local Caddy config behind the existing Cloudflare Tunnel:

```caddy
@rolling_oaks_daylilies host rollingoaksdaylilies.com
handle @rolling_oaks_daylilies {
  reverse_proxy app:3000
}
```

If `www.rollingoaksdaylilies.com` should also serve this app, include it in the matcher:

```caddy
@rolling_oaks_daylilies host rollingoaksdaylilies.com www.rollingoaksdaylilies.com
```

## Reverse Proxy Notes

The app expects the original `Host` header from Caddy and does not require public port publishing. TLS terminates before the container, so the app serves plain HTTP on port `3000` inside Docker.
