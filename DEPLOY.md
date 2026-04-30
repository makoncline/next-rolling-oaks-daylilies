# Deploy Rolling Oaks Daylilies

This app deploys as a Docker image on a single VPS. Public traffic reaches the container through Cloudflare Tunnel, local Caddy, and the shared Docker network `edge`.

## App Contract

- App name: `rolling-oaks-daylilies`
- Internal port: `3000`
- Container bind host: `0.0.0.0`
- Health endpoint: `GET /api/health`
- Smoke-test path: `/api/health`
- GHCR image: `ghcr.io/makoncline/rolling-oaks-daylilies`
- Persistent volumes: optional public snapshot cache at `/app/.public-data`

The container runs the Next.js standalone server from the image. The source repo is not required on the VPS at runtime. Public catalog pages render from a local public-data snapshot. If the snapshot is missing, the app rebuilds it from Turso on first use and writes it to `PUBLIC_SNAPSHOT_DIR` or `/app/.public-data`. If the snapshot is older than the app's freshness window, requests keep serving the stale snapshot and trigger one background refresh.

## External Services

- Turso/libSQL database
- Gmail SMTP for contact and cart emails
- Resized image CDN at `images.daylilycatalog.com`

`/api/health` reports public snapshot status and performs a lightweight Turso database check with `SELECT 1`. SMTP is intentionally not checked because a probe would need to log in to Gmail on every request and can be slow or rate-limited; successful contact/cart form submissions exercise SMTP separately.

## Environment

Create `/srv/stacks/rolling-oaks-daylilies/.env` on the VPS from `.env.example`.

Required secrets:

- `TURSO_DATABASE_URL`
- `TURSO_DATABASE_AUTH_TOKEN`
- `SMTP_USER`
- `SMTP_PASS`

Required non-secret config:

- `SMTP_HOST`: SMTP server host. Defaults to `smtp.gmail.com`.
- `SMTP_PORT`: SMTP server port. Defaults to `587`.
- `SMTP_SECURE`: `true` for implicit TLS, `false` for STARTTLS. Defaults to `false`.
- `CONTACT_TO_EMAIL`: comma-separated recipient list for contact/cart messages.

Optional config:

- `CONTACT_BCC_EMAIL`: comma-separated BCC recipient list.
- `PUBLIC_SNAPSHOT_DIR`: writable directory for the public read-model snapshot. Defaults to `.public-data` under the app working directory.
- `PUBLIC_SNAPSHOT_REFRESH_TOKEN`: enables protected `GET /api/public-snapshot/refresh?token=...` for manual refreshes.

Build-time-only variables:

- `NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET`: optional image bucket host override used by `packages/app/components/Image.tsx`. The Dockerfile defaults it to `images.daylilycatalog.com` during image build and Next.js bakes it into the client bundle, so setting it only in the VPS runtime `.env` will not affect browser-rendered image URLs.

Build-time environment is validated with T3 Env before `next build`; missing or blank build variables fail the image build before Next.js compiles.

## Build Image

Build locally:

```sh
git submodule update --init --recursive
docker build -t rolling-oaks-daylilies:local .
```

During PR testing, GitHub Actions builds the image once, pushes it to GHCR with the full commit SHA tag, then pulls that same image back down for both `GET /api/health` and end-to-end verification. Pull requests do not deploy. Pushes to `main` build and verify the merge commit image, then deploy that immutable SHA tag through the VPS webhook.

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

Use this under `/srv/stacks/rolling-oaks-daylilies/compose.yaml`, replacing `${IMAGE_TAG}` with a pushed full commit SHA.

```yaml
services:
  app:
    image: ghcr.io/makoncline/rolling-oaks-daylilies:${IMAGE_TAG}
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - public-data:/app/.public-data
    networks:
      - edge

volumes:
  public-data:

networks:
  edge:
    external: true
```

The service does not publish host ports. Caddy reaches it over the external `edge` Docker network. The `public-data` volume preserves the generated public snapshot across container recreates; it is safe to delete because the app can rebuild it from Turso.

## Public Snapshot Refresh

Public catalog, listing, and sitemap routes read from a local snapshot instead of querying Turso on request. The app builds the snapshot on first use if it is missing. To refresh it manually, set `PUBLIC_SNAPSHOT_REFRESH_TOKEN` and open the protected endpoint:

```sh
curl --fail-with-body \
  "http://app:3000/api/public-snapshot/refresh?token=${PUBLIC_SNAPSHOT_REFRESH_TOKEN}"
```

The app also self-refreshes: snapshots are fresh for 1 hour, and stale snapshots are served while a background refresh runs. Use this endpoint for an explicit refresh after admin data changes or when you want to refresh immediately. If a refresh fails, the app keeps serving the previous snapshot from the `public-data` volume and `/api/health` reports the snapshot age/status.

Self-refresh is request-driven. If nobody visits the site and no one calls the refresh endpoint, the container does not rebuild snapshots unnecessarily.

Snapshot refreshes emit structured JSON logs with `component: "public-snapshot"` and events such as `public_snapshot_build_started`, `public_snapshot_build_succeeded`, `public_snapshot_written`, `public_snapshot_build_failed`, and `public_snapshot_manual_refresh_requested`. These are intended for VPS log inspection.

## Caddy Route

Add this route to the local Caddy config behind the existing Cloudflare Tunnel:

```caddy
@rolling_oaks_daylilies host rolling-oaks-daylilies.makon.dev
handle @rolling_oaks_daylilies {
  reverse_proxy app:3000
}
```

If the production domain should also serve this app, include it in the matcher:

```caddy
@rolling_oaks_daylilies host rolling-oaks-daylilies.makon.dev rollingoaksdaylilies.com www.rollingoaksdaylilies.com
```

## Reverse Proxy Notes

The app expects the original `Host` header from Caddy and does not require public port publishing. TLS terminates before the container, so the app serves plain HTTP on port `3000` inside Docker.
