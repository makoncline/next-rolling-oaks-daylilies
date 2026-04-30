# Napkin

## Corrections

| Date | Source | What Went Wrong | What To Do Instead |
| ---- | ------ | --------------- | ------------------ |
| 2026-04-08 | self | Tried raw LibSQL introspection with plain `node` and got `URL_INVALID` because `.env` is not auto-loaded in ad hoc scripts | For one-off DB inspection in `packages/app`, explicitly `source .env` before running Node/LibSQL commands |
| 2026-04-08 | user | Considered keeping `Listing.ahsId` available as a possible read-path bridge | Treat public cultivar display as `Listing.cultivarReference -> CultivarReference.v2AhsCultivar` only; do not read display data via `Listing.ahsId` |
| 2026-04-09 | self | Regenerated Prisma while `next dev` was already running, then hit `Unknown field cultivarReference` at runtime from the stale in-memory client | After changing `prisma/schema.sqlite.prisma` or regenerating the SQLite client, restart the existing `next dev` server before browser verification |
| 2026-04-09 | self | Investigated broken Netlify preview images assuming missing assets, but the real failure was Netlify IPX crashing on `/_next/image` with `sharp`/`libvips-cpp.so.42` errors | For `packages/app` deploy previews, inspect one failing `/_next/image` URL directly; `images.unoptimized = true` is only a short-term fallback, not the preferred long-term fix |
| 2026-04-09 | self | Treated `images.unoptimized = true` as the primary fix, but the more correct repo-level fix was upgrading from unsupported Next `13.2.3` to Netlify-supported Next `13.5+` | On this repo, keep optimized images by upgrading `next` and `eslint-config-next` to at least `13.5.x`; use `unoptimized` only as a fallback workaround |
| 2026-04-09 | self | Upgrading Next to Netlify’s supported runtime exposed a second deploy blocker: Netlify Forms in React pages no longer count for deploy-time form detection | For this repo, keep form definitions in `packages/app/public/__forms.html` and submit live Next forms to that static file path with URL-encoded POSTs instead of relying on `data-netlify` in React components |
| 2026-04-29 | self | Used broad `find /Users/makon ...` searches for local env files and produced huge output through protected and dependency directories | For this repo, check `/Users/makon/dev/next-rolling-oaks-daylilies/packages/app/.env` directly when the worktree lacks `packages/app/.env` |
| 2026-04-29 | self | Included a `prefix_rule` on a destructive cleanup command for a temporary env file | Never provide `prefix_rule` for destructive commands, even narrow temporary-file cleanup; request one-off escalation without a reusable rule |
| 2026-04-30 | self | Reran Playwright on the default port and got false failures because it reused a different app already running on port 3000 | For focused e2e in this repo, start the current worktree on a separate `PORT` and run Playwright with `CI=1 TEST_BASE_URL=http://localhost:<port>` |
| 2026-04-30 | self | Treated `npm run build`/raw `tsc` as clean verification targets, but the repo currently has unrelated blockers: public/page `sitemap.xml` conflict and TS 6 deprecation errors for `target=ES5`/`baseUrl` | For unrelated app changes, run lint and focused runtime/e2e checks; only expect full build/typecheck to pass after those repo-level blockers are fixed |
| 2026-04-30 | self | Initially read only part of the Browser Use skill even though it explicitly requires a full-file read before browser actions | When Browser Use is requested, `cat` the full skill file in one read before the first browser API call |
| 2026-04-30 | self | Reviewed the cart empty state by accident after a browser click missed the Add to Cart button | For cart UI review in this app, add a product from a visible catalog/search card first, then verify `/cart` contains line items before judging the populated cart layout |

## User Preferences

- Explore the repo first before making changes.

## Patterns That Work

- Start public read-path changes in `packages/app` by tracing Prisma schema, server data fetches in page `getServerSideProps`, and the shared card/detail components before editing UI code.
- The live Turso DB for `packages/app` already contains `CultivarReference` and `V2AhsCultivar`; inspect that DB directly before changing `prisma/schema.sqlite.prisma`.
- `npm run test:e2e` works on this machine once `npx playwright install chromium` has populated `~/Library/Caches/ms-playwright/chromium-1134`.
- For temporary public scanner checks, `rolling-oaks-agent-test.makon.dev` can route to the local named Cloudflare tunnel and serve `packages/app` on `localhost:3000`; verify the emitted `tunnelID` because `cloudflared tunnel route dns` may use the default config tunnel.
- The first `/catalog/*` request in a fresh dev worktree can spend ~35s building `.public-data/public-snapshot.*.json`; wait for `public_snapshot_build_succeeded` in the dev log before treating browser navigation timeouts as page failures.

## Patterns That Don't Work

- Assuming a repo-root `AGENTS.md` or `.codex/napkin.md` exists in this project; check first.

## Session Notes

- 2026-04-30: Enumerated `packages/app/pages` UI routes: index, catalogs, `catalog/[catalog]` (includes `/catalog/search`), dynamic `[listing]`, cart, thanks, blog index, `blog/dorothy-and-toto`, custom `404`. Non-UI: `/api/*`, `sitemap.xml.tsx`, `openapi.json.tsx`, `/sitemap` redirect to API.

## Domain Notes

- Goal for this task: move public cultivar display reads from legacy `Listing.ahsListing` to the repo's real V2 cultivar source without changing writes or adding Prisma migrations.
- Current public listing coverage in the live DB for `userId = "3"`: `3028` visible listings total, `1599` with `cultivarReferenceId`, `1590` with both `cultivarReferenceId` and `ahsId`, `9` V2-only, and `1429` with neither.
- For the VPS migration, contact/cart forms post to `/api/forms` and send through Nodemailer. Runtime requires `SMTP_USER` and `SMTP_PASS`; `CONTACT_TO_EMAIL` defaults to `kaymcline@gmail.com` and accepts comma-separated recipients.
- Form spam protection is enforced in `packages/app/pages/api/forms.ts`: browser forms must include a sane `form-started-at`, empty `bot-field`/`website`/`company` traps, and no more than one link before Nodemailer runs.
- `packages/design-system` has been removed from this repo. Do not assume design-system submodule setup is needed when troubleshooting builds.
- Docker deployment uses Next standalone output and should not require Turso secrets at image-build time. Keep DB-backed dynamic pages on empty `getStaticPaths` with `fallback: "blocking"` or server-side fetching so `docker build` works without `.env`.
