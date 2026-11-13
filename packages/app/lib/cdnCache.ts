import type { ServerResponse } from "http";

// Cloudflare reads this header and does not forward it to browsers.
const CDN_CACHE_CONTROL_HEADER = "Cloudflare-CDN-Cache-Control";
const BROWSER_CACHE_CONTROL =
  "private, no-cache, no-store, max-age=0, must-revalidate";

const SITE_CACHE_TAG = "rolling-oaks-site";
const PUBLIC_CDN_CACHE_CONTROL =
  "public, max-age=3600, stale-while-revalidate=86400, stale-if-error=86400";

export const publicCdnCacheHeaders = {
  [CDN_CACHE_CONTROL_HEADER]: PUBLIC_CDN_CACHE_CONTROL,
  "Cache-Tag": SITE_CACHE_TAG,
  "Cache-Control": BROWSER_CACHE_CONTROL,
};

export const uncachedCdnHeaders = {
  [CDN_CACHE_CONTROL_HEADER]: "no-store",
  "Cache-Control": BROWSER_CACHE_CONTROL,
};

export function cacheAtEdge(res: ServerResponse) {
  for (const [key, value] of Object.entries(publicCdnCacheHeaders)) {
    res.setHeader(key, value);
  }
}

export function neverCacheAtEdge(res: ServerResponse) {
  for (const [key, value] of Object.entries(uncachedCdnHeaders)) {
    res.setHeader(key, value);
  }
}
