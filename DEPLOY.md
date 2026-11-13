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

The container runs the Next.js standalone server from the image. The source repo is not required on the VPS at runtime. Public catalog pages render from a local public-data snapshot stored in persistent storage, not in the immutable image. On startup, the container validates `/app/.public-data/manifest.json`; if it points to an existing snapshot file, Next starts immediately from that snapshot. If the manifest or snapshot file is missing, startup performs a one-time bootstrap build before Next starts so the first deployment has data. The server then refreshes a stale snapshot on its own schedule; see [Public Snapshot Refresh](#public-snapshot-refresh).

## External Services

- Turso/libSQL database
- Gmail SMTP for contact and cart emails
- Cloudflare Turnstile for contact and cart form verification
- Resized image CDN at `images.daylilycatalog.com`

`/api/health` reports public snapshot status and performs a lightweight Turso database check with `SELECT 1`. SMTP is intentionally not checked because a probe would need to log in to Gmail on every request and can be slow or rate-limited; successful contact/cart form submissions exercise SMTP separately.

## Environment

Create `/srv/stacks/rolling-oaks-daylilies/.env` on the VPS from `.env.example`.

Required secrets:

- `TURSO_DATABASE_URL`
- `TURSO_DATABASE_AUTH_TOKEN`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SECRET_KEY`: runtime secret from the Turnstile widget.

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

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: required public site key. Set the GitHub Actions repository variable with this name. The Docker build passes it to Next.js. Use the site key from the same widget as the runtime secret.

- `NEXT_PUBLIC_S3_RESIZED_IMAGE_BUCKET`: optional image bucket host override used by `packages/app/components/Image.tsx`. The Dockerfile defaults it to `images.daylilycatalog.com` during image build and Next.js bakes it into the client bundle, so setting it only in the VPS runtime `.env` will not affect browser-rendered image URLs.

Build-time environment is validated with T3 Env before `next build`; missing or blank build variables fail the image build before Next.js compiles.

## Turnstile Setup

Create a Managed Turnstile widget in Cloudflare. Allow `rollingoaksdaylilies.com` and `rolling-oaks-daylilies.makon.dev`; Cloudflare also permits subdomains of an allowed hostname. Keep local test hosts out of the production widget.

Pull request image builds use Cloudflare's public test site key and never deploy. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as a GitHub Actions repository variable before the production image build. Set `TURNSTILE_SECRET_KEY` in the VPS runtime `.env` before deploying that image. Do not put the secret key in a build argument or a public environment variable. Rebuild the image after a site key change. The server checks the token, form action, and request hostname before it sends email. Missing configuration or failed verification blocks email.

For local browser checks, use Cloudflare's public test site key `1x00000000000000000000AA`. For tests that call Siteverify, use its public test secret `1x0000000000000000000000000000000AA`. Never use these test keys in production. The form integration tests mock Siteverify and SMTP. The browser tests replace the widget script and form response, so they send no email.

## Build Image

Build locally:

```sh
git submodule update --init --recursive
docker build --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY -t rolling-oaks-daylilies:local .
```

During PR testing, GitHub Actions builds the image once, pushes it to GHCR with the full commit SHA tag, then pulls that same image back down for both `GET /api/health` and end-to-end verification. Pull requests do not deploy. Pushes to `main` build and verify the merge commit image, then deploy that immutable SHA tag through the VPS webhook.

## Local Production-Image Test

Test a locally built image:

```sh
docker build --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY -t rolling-oaks-daylilies:local .
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
4. When Next starts, a fresh snapshot should log `public_snapshot_refresh_skipped` with `reason: "fresh_snapshot"`; a stale snapshot should log `public_snapshot_build_started`. `/api/health` reports `publicSnapshot.version`, `generatedAt`, `ageSeconds`, and `refreshing`.

## VPS Compose

Use this under `/srv/stacks/rolling-oaks-daylilies/compose.yaml`, replacing `${IMAGE_TAG}` with a pushed full commit SHA.

```yaml
services:
  rolling-oaks-daylilies:
    image: ghcr.io/makoncline/rolling-oaks-daylilies:${IMAGE_TAG}
    restart: unless-stopped
    mem_limit: 700m
    memswap_limit: 700m
    env_file:
      - .env
    environment:
      NODE_OPTIONS: --max-old-space-size=512
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

The server also refreshes the snapshot on a timer, independently of traffic. Cloudflare serves most public requests, so origin traffic cannot drive freshness. When the server starts and every 5 minutes after, it refreshes the snapshot if the snapshot is older than 1 hour. Page and API reads never start a refresh. They serve the current snapshot while a refresh runs and also while refreshes fail. The 24-hour `maxStaleSeconds` value in `/api/health` changes only the reported status from `stale` to `expired`. It does not stop the app from serving the snapshot. If the process exits during a refresh, the app removes its refresh lock. A lock that remains after a hard kill expires after 30 minutes. Refreshes take a lock in `PUBLIC_SNAPSHOT_DIR`, write a new snapshot file first, then atomically replace `manifest.json`. After the manifest is published, the app retains the active snapshot and the newest rollback snapshots, up to 48 exact `public-snapshot.<16-character-lowercase-hex-hash>.json` files in total. Cleanup failures do not fail the refresh. If a fetch/network/DNS refresh failure repeats, the app records retry backoff in `refresh-state.json` next to the manifest and keeps serving the previous snapshot from the `public-data` mount. `/api/health` reports the snapshot age/status.

Only one refresh should run at a time across the server process and the startup helper process. If another refresh is already running, the app keeps using the current snapshot.

Snapshot refreshes emit structured JSON logs with `component: "public-snapshot"` and events such as `public_snapshot_existing_loaded`, `public_snapshot_missing`, `public_snapshot_refresh_skipped`, `public_snapshot_build_started`, `public_snapshot_build_retry_scheduled`, `public_snapshot_build_succeeded`, `public_snapshot_build_failed`, `public_snapshot_refresh_backoff_updated`, `public_snapshot_manifest_updated`, `public_snapshot_cleanup_completed`, `public_snapshot_cleanup_incomplete`, `public_snapshot_cleanup_failed`, `public_snapshot_written`, `public_snapshot_manual_refresh_requested`, and `public_snapshot_scheduled_refresh_failed`. These are intended for VPS log inspection.

## Cloudflare Response Cache

Cloudflare caches public responses. Next does not cache pages: there is no ISR, and data-backed pages use `getServerSideProps`. The app sends the cache policy in each response, and one Cloudflare Cache Rule makes those responses eligible for caching. `packages/app/lib/cdnCache.ts` holds the policy.

### App Headers

Cacheable responses send these headers:

```http
Cloudflare-CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400, stale-if-error=86400
Cache-Tag: rolling-oaks-site
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
```

Cloudflare reads `Cloudflare-CDN-Cache-Control` and `Cache-Tag` and removes them before the response goes to the browser. A cached copy is fresh for 1 hour. For the next 24 hours, Cloudflare can serve the stale copy while it gets a new copy from the origin. It can also serve the stale copy for up to 24 hours when the origin fails. Browsers get `Cache-Control: no-store`. A browser therefore never keeps old stock or prices, and a purge takes effect at once.

| Response | Edge policy |
|---|---|
| `/`, `/catalogs`, `/catalog/[catalog]` and all query variants, `/[listing]` | Public, after the data is found |
| Their `/_next/data/<buildId>/...json` routes | Public (same `getServerSideProps`) |
| `/api/catalogs`, `/api/catalog/[catalog]`, `/api/listings/[listing]` | Public on `200` only |
| `/sitemap.xml`, `/openapi.json`, `/.well-known/api-catalog` | Public |
| `/cart`, `/thanks`, `/blog`, `/blog/dorothy-and-toto` (static) | Public, from `next.config.ts` |
| `404`/`5xx` pages, `400`/`404` API errors | Not cached: Next `private, no-store`, or `Cloudflare-CDN-Cache-Control: no-store` |
| `/api/health`, `/api/public-snapshot/refresh`, `/api/forms` | `Cloudflare-CDN-Cache-Control: no-store` |
| `Accept: text/markdown` responses (from `proxy.ts`, same URLs as HTML) | `Cloudflare-CDN-Cache-Control: no-store` |
| Pages Router prefetch (`x-middleware-prefetch`, returns `{}`) | Next `private, no-store` |
| `/_next/static/*` | Next `immutable`, no tag, so a deploy purge keeps it |
| Files in `public/` | Next `public, max-age=0` (unchanged) |

Public responses do not set cookies and do not change with cookies or `Authorization`. The cart uses browser storage. Each full URL is one cache entry, so every name, filter, sort, and page combination is separate. HTML and `_next/data` JSON have different URLs. Cloudflare ignores `Vary` on these responses. The markdown and prefetch variants share URLs with cached responses, so the app sends them as uncacheable and the rule also excludes them.

### Cloudflare Cache Rule

Create one Cache Rule in the `rollingoaksdaylilies.com` zone (**Caching > Cache Rules**). The Free plan supports Cache Rules, `Cloudflare-CDN-Cache-Control`, and purge by tag. Before you create the rule, examine the existing Cache Rules in the zone. Do not add a Cache Response Rule or a Worker for these responses. Paste the expression into the dashboard expression editor and make sure that it is valid before you deploy the rule.

- Rule name: `Rolling Oaks app response cache`
- Expression:

  ```text
  (http.host eq "rollingoaksdaylilies.com" or http.host eq "www.rollingoaksdaylilies.com")
  and (http.request.method eq "GET" or http.request.method eq "HEAD")
  and not starts_with(http.request.uri.path, "/_next/image")
  and not any(http.request.headers["authorization"][*] ne "")
  and not any(http.request.headers["x-middleware-prefetch"][*] ne "")
  and not any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")
  ```

- Cache eligibility: **Eligible for cache**.
- Edge TTL: **Use cache-control header if present, bypass cache if not** (`bypass_by_default`). Do not set a TTL for successful responses.
- Status code TTL: `400`-`599` → **No store** (`-1`).
- Browser TTL: **Respect origin**.
- Cache key: the default full URL, query string included.

API shape (`PUT /zones/{zone_id}/rulesets/phases/http_request_cache_settings/entrypoint`; this replaces the entry point, so include any rules that already exist):

```json
{
  "description": "Rolling Oaks app response cache",
  "expression": "<expression above>",
  "action": "set_cache_settings",
  "action_parameters": {
    "cache": true,
    "edge_ttl": {
      "mode": "bypass_by_default",
      "status_code_ttl": [
        { "status_code_range": { "from": 400, "to": 599 }, "value": -1 }
      ]
    },
    "browser_ttl": { "mode": "respect_origin" }
  }
}
```

The rule excludes `/_next/image` because the optimizer chooses its image format from `Accept` and Cloudflare Free does not vary on it. Static Next assets keep Cloudflare's default caching. The status code guard is a second defense: no error response sends a public CDN header.

### Deploy Purge

After the VPS webhook succeeds, the `Deploy to VPS` job waits until `https://rollingoaksdaylilies.com/api/health` responds and then purges the `rolling-oaks-site` tag. The webhook returns only after the new container replaces the old one, or it fails and rolls back. The purge removes old HTML and `_next/data` that point to chunks from the old build. Immutable `/_next/static` files have no tag and stay cached, so open tabs can still load old chunks. Data edits in Daylily Catalog do not purge. They reach visitors through the hourly snapshot plus the 1-hour edge freshness.

Required GitHub Actions configuration:

- Repository variable `CLOUDFLARE_ZONE_ID`: the `rollingoaksdaylilies.com` zone ID.
- Repository secret `CLOUDFLARE_CACHE_PURGE_TOKEN`: an API token with only **Zone > Cache Purge > Purge** for that zone.

If either value is missing, the job logs a warning and skips the purge, and the deploy still succeeds. Add both before you enable the Cache Rule. After that, a failed purge fails the job.

### Rollout Check

1. Deploy the app. Without the rule, Cloudflare continues to report `cf-cache-status: DYNAMIC`.
2. Add the GitHub variable and secret.
3. Create the Cache Rule.
4. Send two anonymous `curl -sI` requests to each public route, including a filtered `/catalog/all?...` URL and a `_next/data` URL. The first response should be `MISS` and the second `HIT`. Browser `cache-control` should stay `private, no-cache, no-store, ...`.
5. Make sure that `/api/health`, a `404` page, an `Accept: text/markdown` request, and a `POST /api/forms` never return `HIT`.
6. Deploy again, then make sure that the next HTML request returns `MISS` with the new `buildId` and that the browser console shows no chunk `404`s.

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
