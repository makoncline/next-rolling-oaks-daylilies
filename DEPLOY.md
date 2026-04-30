# Deploy Rolling Oaks Daylilies

This app deploys as a Docker image on a single VPS. Public traffic reaches the container through Cloudflare Tunnel, local Caddy, and the shared Docker network `edge`.

## App Contract

- App name: `rolling-oaks-daylilies`
- Internal port: `3000`
- Container bind host: `0.0.0.0`
- Health endpoint: `GET /api/health`
- Smoke-test path: `/api/health`
- GHCR image: `ghcr.io/makoncline/rolling-oaks-daylilies`
- Persistent volumes: public snapshot cache at `/app/.public-data`

The container runs the Next.js standalone server from the image. The source repo is not required on the VPS at runtime. Public catalog pages render from a local public-data snapshot stored in persistent storage, not in the immutable image. On startup, the container validates `/app/.public-data/manifest.json`; if it points to an existing snapshot file, Next starts immediately from that snapshot and a refresh runs in the background after `/api/health` responds. If the manifest or snapshot file is missing, startup performs a one-time bootstrap build before Next starts so the first deployment has data.

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
- `PUBLIC_SNAPSHOT_DIR`: writable directory for the public read-model snapshot. The Docker image defaults this to `/app/.public-data`; production should mount persistent storage there.
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
mkdir -p /tmp/rolling-oaks-public-data
docker run --rm --env-file .env.local \
  -v /tmp/rolling-oaks-public-data:/app/.public-data \
  -p 3000:3000 \
  rolling-oaks-daylilies:local
curl -fsS http://localhost:3000/api/health
```

Test a GHCR image:

```sh
docker pull ghcr.io/makoncline/rolling-oaks-daylilies:TAG
mkdir -p /tmp/rolling-oaks-public-data
docker run --rm --env-file .env.local \
  -v /tmp/rolling-oaks-public-data:/app/.public-data \
  -p 3000:3000 \
  ghcr.io/makoncline/rolling-oaks-daylilies:TAG
curl -fsS http://localhost:3000/api/health
```

To verify startup reuse locally:

1. Remove and recreate an empty test volume: `rm -rf /tmp/rolling-oaks-public-data && mkdir -p /tmp/rolling-oaks-public-data`.
2. Start the container with `-v /tmp/rolling-oaks-public-data:/app/.public-data`; the logs should include `public_snapshot_missing`, then `public_snapshot_build_succeeded`, then `public_snapshot_manifest_updated`.
3. Stop the container and start it again with the same volume; the logs should include `public_snapshot_existing_loaded` before Next starts, not a blocking rebuild.
4. After `/api/health` responds, the logs should include `public_snapshot_background_refresh_started`; `/api/health` reports `publicSnapshot.version`, `generatedAt`, `ageSeconds`, and `refreshing`.

## VPS Compose

Use this under `/srv/stacks/rolling-oaks-daylilies/compose.yaml`, replacing `${IMAGE_TAG}` with a pushed full commit SHA.

```yaml
services:
  rolling-oaks-daylilies:
    image: ghcr.io/makoncline/rolling-oaks-daylilies:${IMAGE_TAG}
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./public-data:/app/.public-data
    networks:
      - edge

networks:
  edge:
    external: true
```

The service does not publish host ports. Caddy reaches it over the external `edge` Docker network. The `./public-data` bind mount preserves the generated public snapshot across container recreates. It is safe to delete because the app can rebuild it from Turso, but deleting it makes the next startup perform the bootstrap build before Next starts.

Create the bind-mounted directory with ownership that the non-root container user can write:

```sh
mkdir -p /srv/stacks/rolling-oaks-daylilies/public-data
chown 1001:1001 /srv/stacks/rolling-oaks-daylilies/public-data
```

## Public Snapshot Refresh

Public catalog, listing, and sitemap routes read from a local snapshot instead of querying Turso on request. The app bootstraps the snapshot at startup only when no valid persistent snapshot exists. To refresh it manually, set `PUBLIC_SNAPSHOT_REFRESH_TOKEN` and open the protected endpoint:

```sh
curl --fail-with-body \
  "http://rolling-oaks-daylilies:3000/api/public-snapshot/refresh?token=${PUBLIC_SNAPSHOT_REFRESH_TOKEN}"
```

The app also self-refreshes: every normal container start launches a background refresh after Next is listening, snapshots are fresh for 1 hour, and stale snapshots are served while a background refresh runs. Refreshes take a lock in `PUBLIC_SNAPSHOT_DIR`, write a new snapshot file first, then atomically replace `manifest.json`. If a refresh fails, the app keeps serving the previous snapshot from the `public-data` mount and `/api/health` reports the snapshot age/status.

Only one refresh should run at a time across the server process and the startup helper process. If another refresh is already running, the app keeps using the current snapshot.

Snapshot refreshes emit structured JSON logs with `component: "public-snapshot"` and events such as `public_snapshot_existing_loaded`, `public_snapshot_missing`, `public_snapshot_background_refresh_started`, `public_snapshot_build_started`, `public_snapshot_build_succeeded`, `public_snapshot_build_failed`, `public_snapshot_manifest_updated`, `public_snapshot_written`, and `public_snapshot_manual_refresh_requested`. These are intended for VPS log inspection.

## Caddy Route

Add this route to the local Caddy config behind the existing Cloudflare Tunnel:

```caddy
@rolling_oaks_daylilies host rolling-oaks-daylilies.makon.dev
handle @rolling_oaks_daylilies {
  reverse_proxy rolling-oaks-daylilies:3000
}
```

If the production domain should also serve this app, include it in the matcher:

```caddy
@rolling_oaks_daylilies host rolling-oaks-daylilies.makon.dev rollingoaksdaylilies.com www.rollingoaksdaylilies.com
```

## Reverse Proxy Notes

The app expects the original `Host` header from Caddy and does not require public port publishing. TLS terminates before the container, so the app serves plain HTTP on port `3000` inside Docker.
