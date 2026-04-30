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

## User Preferences

- Explore the repo first before making changes.

## Patterns That Work

- Start public read-path changes in `packages/app` by tracing Prisma schema, server data fetches in page `getServerSideProps`, and the shared card/detail components before editing UI code.
- The live Turso DB for `packages/app` already contains `CultivarReference` and `V2AhsCultivar`; inspect that DB directly before changing `prisma/schema.sqlite.prisma`.
- `npm run test:e2e` works on this machine once `npx playwright install chromium` has populated `~/Library/Caches/ms-playwright/chromium-1134`.

## Patterns That Don't Work

- Assuming a repo-root `AGENTS.md` or `.codex/napkin.md` exists in this project; check first.

## Domain Notes

- Goal for this task: move public cultivar display reads from legacy `Listing.ahsListing` to the repo's real V2 cultivar source without changing writes or adding Prisma migrations.
- Current public listing coverage in the live DB for `userId = "3"`: `3028` visible listings total, `1599` with `cultivarReferenceId`, `1590` with both `cultivarReferenceId` and `ahsId`, `9` V2-only, and `1429` with neither.
- For the VPS migration, contact/cart forms post to `/api/forms` and send through Nodemailer. Runtime requires `SMTP_USER` and `SMTP_PASS`; `CONTACT_TO_EMAIL` defaults to `kaymcline@gmail.com` and accepts comma-separated recipients.
- `packages/design-system` is a git submodule. If it is uninitialized, full `tsc` and Docker builds fail before reaching app code because `@packages/design-system` cannot be resolved.
- Docker deployment uses Next standalone output and should not require Turso secrets at image-build time. Keep DB-backed dynamic pages on empty `getStaticPaths` with `fallback: "blocking"` or server-side fetching so `docker build` works without `.env`.
