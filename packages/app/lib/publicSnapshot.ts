import { createHash } from "crypto";
import {
  mkdir,
  open,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import path from "path";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import {
  AhsDisplay,
  fullCultivarReferenceInclude,
  mapListingCultivarDisplay,
} from "./cultivarDisplay";
import {
  generatedCultivarImageAssetInclude,
  listingImageAssetInclude,
  resolveListingPublicImages,
} from "./imageAssets";

const SNAPSHOT_SCHEMA_VERSION = 3;
const HIDDEN_STATUS = "HIDDEN";
const LISTING_BATCH_SIZE = 900;
const CATALOG_PAGE_SIZE = 24;
export const PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS = 60 * 60;
export const PUBLIC_SNAPSHOT_MAX_STALE_SECONDS = 24 * 60 * 60;
const PUBLIC_SNAPSHOT_REFRESH_LOCK_STALE_MS = 30 * 60 * 1000;
const DEFAULT_PUBLIC_SNAPSHOT_BUILD_ATTEMPTS = 3;
const DEFAULT_PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS = 5_000;
const DEFAULT_PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS = 60_000;
const DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS = 60_000;
const DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_MAX_MS = 15 * 60 * 1000;
const DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO = 0.2;
const RETRYABLE_PUBLIC_SNAPSHOT_ERROR_CODES = new Set([
  "EAI_AGAIN",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

export type PublicImage = {
  id: string;
  url: string;
  thumbUrl?: string | null;
  blurUrl?: string | null;
  order: number;
};

export type PublicListRef = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

export type PublicCatalogSummary = {
  slug: string;
  name: string;
  intro: string | null;
  image: string | null;
  imageThumbUrl: string | null;
  imageBlurUrl: string | null;
  totalCount: number;
  listingIds: string[];
};

export type PublicListingCard = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  price: number | null;
  description: string | null;
  status: string | null;
  updatedAt: string;
  images: PublicImage[];
  lists: PublicListRef[];
  ahsListing: AhsDisplay | null;
};

export type PublicSitemapEntry = {
  path: string;
  lastmod: string;
};

export type PublicSnapshot = {
  schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  version: string;
  generatedAt: string;
  userId: string;
  catalogsBySlug: Record<string, PublicCatalogSummary>;
  cardsById: Record<string, PublicListingCard>;
  detailsBySlug: Record<string, PublicListingCard>;
  sitemapEntries: PublicSitemapEntry[];
  counts: {
    visibleListings: number;
    forSaleVisibleListings: number;
    catalogs: number;
    visibleListingImages: number;
  };
};

type SnapshotManifest = {
  schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  version: string;
  path: string;
  generatedAt: string;
  counts: PublicSnapshot["counts"];
};

type SnapshotRefreshState = {
  consecutiveFailures: number;
  lastFailureAt: string;
  lastError: string;
  nextAttemptAt: string;
};

export type PublicSnapshotRefreshTrigger =
  | "background"
  | "manual"
  | "missing"
  | "script";

export type PublicSnapshotRefreshSkipReason =
  | "already_refreshing"
  | "fresh_snapshot"
  | "backoff_active";

export type PublicSnapshotRefreshResult = {
  snapshot: PublicSnapshot;
  status: "built" | "skipped";
  reason?: PublicSnapshotRefreshSkipReason;
  attempts?: number;
  nextAttemptAt?: string;
};

type PublicSnapshotRefreshOptions = {
  trigger?: PublicSnapshotRefreshTrigger;
  force?: boolean;
};

const logPublicSnapshot = (
  event: string,
  payload: Record<string, unknown> = {}
) => {
  console.log(
    JSON.stringify({
      event,
      service: "rolling-oaks-daylilies",
      component: "public-snapshot",
      timestamp: new Date().toISOString(),
      ...payload,
    })
  );
};

let memo:
  | {
      manifestMtimeMs: number;
      snapshot: PublicSnapshot;
    }
  | undefined;
let refreshInFlight: Promise<PublicSnapshotRefreshResult> | undefined;

export const getCatalogSlug = (title: string) =>
  title.toLowerCase().replace(/\s+/g, "-");

const getSnapshotDir = () =>
  process.env.PUBLIC_SNAPSHOT_DIR || path.join(process.cwd(), ".public-data");

const getManifestPath = () => path.join(getSnapshotDir(), "manifest.json");

const getRefreshLockPath = () => path.join(getSnapshotDir(), "refresh.lock");

const getRefreshStatePath = () =>
  path.join(getSnapshotDir(), "refresh-state.json");

const isMissingFileError = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

const isFileExistsError = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "EEXIST";

class PublicSnapshotSchemaVersionError extends Error {
  constructor() {
    super("Public snapshot schema version is stale.");
  }
}

const isSnapshotSchemaVersionError = (error: unknown) =>
  error instanceof PublicSnapshotSchemaVersionError;

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeNumber = (
  value: string | undefined,
  fallback: number
) => {
  const parsed = Number.parseFloat(value || "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getRefreshRetryConfig = () => ({
  buildAttempts: parsePositiveInteger(
    process.env.PUBLIC_SNAPSHOT_BUILD_ATTEMPTS,
    DEFAULT_PUBLIC_SNAPSHOT_BUILD_ATTEMPTS
  ),
  retryInitialDelayMs: parsePositiveInteger(
    process.env.PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS,
    DEFAULT_PUBLIC_SNAPSHOT_RETRY_INITIAL_DELAY_MS
  ),
  retryMaxDelayMs: parsePositiveInteger(
    process.env.PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS,
    DEFAULT_PUBLIC_SNAPSHOT_RETRY_MAX_DELAY_MS
  ),
  backoffInitialMs: parsePositiveInteger(
    process.env.PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS,
    DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_INITIAL_MS
  ),
  backoffMaxMs: parsePositiveInteger(
    process.env.PUBLIC_SNAPSHOT_BACKOFF_MAX_MS,
    DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_MAX_MS
  ),
  backoffJitterRatio: Math.min(
    1,
    parseNonNegativeNumber(
      process.env.PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO,
      DEFAULT_PUBLIC_SNAPSHOT_BACKOFF_JITTER_RATIO
    )
  ),
});

const wait = (delayMs: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
};

const getErrorCause = (error: unknown) => {
  if (!error || typeof error !== "object" || !("cause" in error)) {
    return null;
  }

  return (error as { cause?: unknown }).cause ?? null;
};

const isRetryablePublicSnapshotError = (error: unknown): boolean => {
  for (
    let current: unknown = error;
    current;
    current = getErrorCause(current)
  ) {
    const code = getErrorCode(current);
    if (code && RETRYABLE_PUBLIC_SNAPSHOT_ERROR_CODES.has(code)) {
      return true;
    }

    const message = getErrorMessage(current).toLowerCase();
    if (
      message.includes("fetch failed") ||
      message.includes("getaddrinfo") ||
      message.includes("network") ||
      message.includes("dns")
    ) {
      return true;
    }
  }

  return false;
};

const getRetryDelayMs = (attempt: number) => {
  const config = getRefreshRetryConfig();
  const delay = config.retryInitialDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, config.retryMaxDelayMs);
};

const withJitter = (delayMs: number) => {
  const { backoffJitterRatio } = getRefreshRetryConfig();
  if (backoffJitterRatio === 0) {
    return delayMs;
  }

  const jitterWindow = delayMs * backoffJitterRatio;
  const jitter = Math.round((Math.random() * 2 - 1) * jitterWindow);
  return Math.max(1, delayMs + jitter);
};

const readRefreshState = async (): Promise<SnapshotRefreshState | null> => {
  try {
    const state = JSON.parse(
      await readFile(getRefreshStatePath(), "utf8")
    ) as SnapshotRefreshState;

    if (
      typeof state.consecutiveFailures !== "number" ||
      typeof state.nextAttemptAt !== "string" ||
      Number.isNaN(new Date(state.nextAttemptAt).getTime())
    ) {
      return null;
    }

    return state;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    logPublicSnapshot("public_snapshot_refresh_state_ignored", {
      error: getErrorMessage(error),
    });
    return null;
  }
};

const writeRefreshState = async (state: SnapshotRefreshState) => {
  const snapshotDir = getSnapshotDir();
  await mkdir(snapshotDir, { recursive: true });

  const statePath = getRefreshStatePath();
  const tmpPath = `${statePath}.tmp`;
  await writeFile(tmpPath, JSON.stringify(state), "utf8");
  await rename(tmpPath, statePath);
};

const clearRefreshState = async () => {
  await unlink(getRefreshStatePath()).catch((error) => {
    if (!isMissingFileError(error)) {
      throw error;
    }
  });
};

const recordRetryableRefreshFailure = async (
  error: unknown,
  trigger: PublicSnapshotRefreshTrigger
) => {
  const previousState = await readRefreshState();
  const config = getRefreshRetryConfig();
  const consecutiveFailures = (previousState?.consecutiveFailures || 0) + 1;
  const baseDelay = Math.min(
    config.backoffInitialMs * 2 ** Math.max(0, consecutiveFailures - 1),
    config.backoffMaxMs
  );
  const nextAttemptAt = new Date(Date.now() + withJitter(baseDelay));
  const state: SnapshotRefreshState = {
    consecutiveFailures,
    lastFailureAt: new Date().toISOString(),
    lastError: getErrorMessage(error),
    nextAttemptAt: nextAttemptAt.toISOString(),
  };

  await writeRefreshState(state);
  logPublicSnapshot("public_snapshot_refresh_backoff_updated", {
    trigger,
    consecutiveFailures,
    nextAttemptAt: state.nextAttemptAt,
    error: state.lastError,
  });
};

const getActiveBackoffState = async () => {
  const state = await readRefreshState();
  if (!state) {
    return null;
  }

  return Date.now() < new Date(state.nextAttemptAt).getTime() ? state : null;
};

const getExistingPublicSnapshotForRefresh = async (
  trigger: PublicSnapshotRefreshTrigger
) => {
  try {
    return await getExistingPublicSnapshot();
  } catch (error) {
    logPublicSnapshot("public_snapshot_existing_ignored", {
      trigger,
      reason: getErrorMessage(error),
    });
    return null;
  }
};

const visibleListingWhere = {
  userId: siteConfig.userId,
  OR: [{ status: null }, { NOT: { status: HIDDEN_STATUS } }],
};

const fetchVisibleListings = async () => {
  const listings = [];

  for (let skip = 0; ; skip += LISTING_BATCH_SIZE) {
    const batch = await prisma.listing.findMany({
      where: visibleListingWhere,
      include: {
        cultivarReference: {
          include: {
            ...fullCultivarReferenceInclude,
            imageAssets: generatedCultivarImageAssetInclude,
          },
        },
        imageAssets: listingImageAssetInclude,
        images: {
          orderBy: { order: "asc" },
        },
        lists: true,
      },
      orderBy: { id: "asc" },
      skip,
      take: LISTING_BATCH_SIZE,
    });

    listings.push(...batch);

    if (batch.length < LISTING_BATCH_SIZE) {
      return listings;
    }
  }
};

const toSitemapDate = (value: string | Date) =>
  new Date(value).toISOString().split("T")[0];

const hashStringToNumber = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const pickCatalogImage = (
  seed: string,
  slug: string,
  listingIds: string[],
  cardsById: Record<string, PublicListingCard>
): PublicImage | null => {
  const images = listingIds
    .map((listingId) => cardsById[listingId]?.images[0])
    .filter(Boolean) as PublicImage[];

  if (images.length === 0) {
    return null;
  }

  const imageIndex =
    hashStringToNumber(`${seed}:${slug}:${images.length}`) % images.length;
  return images[imageIndex];
};

const catalogImageFields = (image: PublicImage | null) => ({
  image: image?.url ?? null,
  imageThumbUrl: image?.thumbUrl ?? null,
  imageBlurUrl: image?.blurUrl ?? null,
});

const assertPublicSnapshot = (snapshot: PublicSnapshot) => {
  const listings = Object.values(snapshot.detailsBySlug);

  if (listings.some((listing) => listing.userId !== siteConfig.userId)) {
    throw new Error("Public snapshot includes a listing for another user.");
  }

  if (listings.some((listing) => listing.status === HIDDEN_STATUS)) {
    throw new Error("Public snapshot includes a hidden listing.");
  }

  if (JSON.stringify(snapshot).includes("privateNote")) {
    throw new Error("Public snapshot includes privateNote.");
  }

  if (listings.length !== snapshot.counts.visibleListings) {
    throw new Error("Public snapshot visible listing count is inconsistent.");
  }
};

export async function buildPublicSnapshot(): Promise<PublicSnapshot> {
  const startedAt = Date.now();
  const generatedAt = new Date().toISOString();
  logPublicSnapshot("public_snapshot_build_started", {
    userId: siteConfig.userId,
  });

  const [lists, rawListings] = await Promise.all([
    prisma.list.findMany({
      where: { userId: siteConfig.userId },
      orderBy: { title: "asc" },
    }),
    fetchVisibleListings(),
  ]);

  const listRefsById = Object.fromEntries(
    lists.map((list) => [
      list.id,
      {
        id: list.id,
        slug: getCatalogSlug(list.title),
        title: list.title,
        description: list.description,
      },
    ])
  );

  const mappedListings = rawListings.map((rawListing) => {
    const listing = mapListingCultivarDisplay(rawListing);

    return {
      ...listing,
      resolvedImages: resolveListingPublicImages({
        listingId: rawListing.id,
        images: rawListing.images,
        imageAssets: rawListing.imageAssets,
        cultivarImageAssets:
          rawListing.cultivarReference?.imageAssets ?? [],
        cultivarFallbackUrl: listing.ahsListing?.ahsImageUrl,
      }),
    };
  });
  const cardsById: Record<string, PublicListingCard> = {};
  const detailsBySlug: Record<string, PublicListingCard> = {};

  for (const listing of mappedListings) {
    const listsForListing = listing.lists
      .map((list) => listRefsById[list.id])
      .filter(Boolean);
    const images = listing.resolvedImages;
    const base = {
      id: listing.id,
      userId: listing.userId,
      slug: listing.slug,
      title: listing.title,
      price: listing.price,
      description: listing.description,
      status: listing.status,
      updatedAt: listing.updatedAt.toISOString(),
      lists: listsForListing,
      ahsListing: listing.ahsListing,
    };

    cardsById[listing.id] = {
      ...base,
      images: images.slice(0, 1),
    };
    detailsBySlug[listing.slug] = {
      ...base,
      images,
    };
  }

  const allListingIds = mappedListings.map((listing) => listing.id);
  const forSaleListingIds = mappedListings
    .filter((listing) => listing.price && listing.price > 0)
    .map((listing) => listing.id);
  const listingIdsByCatalogSlug: Record<string, string[]> = {};

  for (const list of lists) {
    const slug = getCatalogSlug(list.title);
    listingIdsByCatalogSlug[slug] = mappedListings
      .filter((listing) => listing.lists.some((item) => item.id === list.id))
      .map((listing) => listing.id);
  }

  const catalogsBySlug: Record<string, PublicCatalogSummary> = {
    "for-sale": {
      slug: "for-sale",
      name: "For Sale",
      intro:
        "Daylilies available for purchase. Send me a message to check availability",
      ...catalogImageFields(
        pickCatalogImage(generatedAt, "for-sale", forSaleListingIds, cardsById)
      ),
      totalCount: forSaleListingIds.length,
      listingIds: forSaleListingIds,
    },
    all: {
      slug: "all",
      name: "All Rolling Oaks Daylilies",
      intro:
        "View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.",
      ...catalogImageFields(
        pickCatalogImage(generatedAt, "all", allListingIds, cardsById)
      ),
      totalCount: allListingIds.length,
      listingIds: allListingIds,
    },
    search: {
      slug: "search",
      name: "Search",
      intro: "",
      ...catalogImageFields(
        pickCatalogImage(generatedAt, "search", allListingIds, cardsById)
      ),
      totalCount: allListingIds.length,
      listingIds: allListingIds,
    },
  };

  for (const list of lists) {
    const slug = getCatalogSlug(list.title);
    const listingIds = listingIdsByCatalogSlug[slug] || [];
    catalogsBySlug[slug] = {
      slug,
      name: list.title,
      intro: list.description,
      ...catalogImageFields(
        pickCatalogImage(generatedAt, slug, listingIds, cardsById)
      ),
      totalCount: listingIds.length,
      listingIds,
    };
  }

  const staticSitemapEntries: PublicSitemapEntry[] = [
    "/",
    "/catalogs",
    "/catalog/all",
    "/catalog/search",
    "/catalog/for-sale",
    "/cart",
    "/thanks",
    "/blog",
    "/blog/dorothy-and-toto",
  ].map((entryPath) => ({
    path: entryPath,
    lastmod: toSitemapDate(generatedAt),
  }));

  const catalogSitemapEntries = lists
    .map((list) => {
      const slug = getCatalogSlug(list.title);
      const listingIds = listingIdsByCatalogSlug[slug] || [];
      const latestListing = listingIds
        .map((id) => cardsById[id])
        .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
        .at(-1);

      if (!latestListing) return null;

      return {
        path: `/catalog/${slug}`,
        lastmod: toSitemapDate(latestListing.updatedAt),
      };
    })
    .filter(Boolean) as PublicSitemapEntry[];

  const paginatedCatalogSitemapEntries = Object.values(catalogsBySlug).flatMap(
    (catalog) => {
      const pageCount = Math.ceil(catalog.totalCount / CATALOG_PAGE_SIZE);
      if (pageCount <= 1) return [];

      return Array.from({ length: pageCount - 1 }, (_, index) => {
        const pageNumber = index + 2;
        const pageListingIds = catalog.listingIds.slice(
          (pageNumber - 1) * CATALOG_PAGE_SIZE,
          pageNumber * CATALOG_PAGE_SIZE
        );
        const latestPageListing = pageListingIds
          .map((id) => cardsById[id])
          .filter(Boolean)
          .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
          .at(-1);

        return {
          path: `/catalog/${catalog.slug}?page=${pageNumber}`,
          lastmod: toSitemapDate(latestPageListing?.updatedAt || generatedAt),
        };
      });
    }
  );

  const listingSitemapEntries = Object.values(detailsBySlug).map((listing) => ({
    path: `/${listing.slug}`,
    lastmod: toSitemapDate(listing.updatedAt),
  }));

  const visibleListingImages = Object.values(detailsBySlug).reduce(
    (total, listing) => total + listing.images.length,
    0
  );

  const snapshotWithoutVersion: Omit<PublicSnapshot, "version"> = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    generatedAt,
    userId: siteConfig.userId,
    catalogsBySlug,
    cardsById,
    detailsBySlug,
    sitemapEntries: [
      ...staticSitemapEntries,
      ...catalogSitemapEntries,
      ...paginatedCatalogSitemapEntries,
      ...listingSitemapEntries,
    ],
    counts: {
      visibleListings: allListingIds.length,
      forSaleVisibleListings: forSaleListingIds.length,
      catalogs: lists.length,
      visibleListingImages,
    },
  };

  const hash = createHash("sha256")
    .update(JSON.stringify(snapshotWithoutVersion))
    .digest("hex")
    .slice(0, 16);

  const snapshot = {
    ...snapshotWithoutVersion,
    version: hash,
  };

  assertPublicSnapshot(snapshot);

  logPublicSnapshot("public_snapshot_build_succeeded", {
    version: snapshot.version,
    durationMs: Date.now() - startedAt,
    counts: snapshot.counts,
  });

  return snapshot;
}

export async function writePublicSnapshot(snapshot: PublicSnapshot) {
  const snapshotDir = getSnapshotDir();
  await mkdir(snapshotDir, { recursive: true });

  const finalPath = path.join(
    snapshotDir,
    `public-snapshot.${snapshot.version}.json`
  );
  const tmpPath = `${finalPath}.tmp`;
  const manifestPath = getManifestPath();
  const manifestTmpPath = `${manifestPath}.tmp`;

  await writeFile(tmpPath, JSON.stringify(snapshot), "utf8");
  await rename(tmpPath, finalPath);

  const manifest: SnapshotManifest = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    version: snapshot.version,
    path: finalPath,
    generatedAt: snapshot.generatedAt,
    counts: snapshot.counts,
  };

  await writeFile(manifestTmpPath, JSON.stringify(manifest), "utf8");
  await rename(manifestTmpPath, manifestPath);

  logPublicSnapshot("public_snapshot_manifest_updated", {
    version: snapshot.version,
    path: finalPath,
    manifestPath,
  });

  logPublicSnapshot("public_snapshot_written", {
    version: snapshot.version,
    path: finalPath,
    manifestPath,
  });

  memo = undefined;
}

async function acquireRefreshLock() {
  const snapshotDir = getSnapshotDir();
  await mkdir(snapshotDir, { recursive: true });

  const lockPath = getRefreshLockPath();
  let lockHandle: Awaited<ReturnType<typeof open>>;
  try {
    lockHandle = await open(lockPath, "wx");
  } catch (error) {
    if (!isFileExistsError(error)) {
      throw error;
    }

    const lockStat = await stat(lockPath);
    if (Date.now() - lockStat.mtimeMs < PUBLIC_SNAPSHOT_REFRESH_LOCK_STALE_MS) {
      throw error;
    }

    await unlink(lockPath);
    lockHandle = await open(lockPath, "wx");
  }

  await lockHandle.writeFile(
    JSON.stringify({
      pid: process.pid,
      createdAt: new Date().toISOString(),
    }),
    "utf8"
  );

  return async () => {
    await lockHandle.close();
    await unlink(lockPath).catch((error) => {
      if (!isMissingFileError(error)) {
        throw error;
      }
    });
  };
}

const skippedRefreshResult = (
  reason: PublicSnapshotRefreshSkipReason,
  trigger: PublicSnapshotRefreshTrigger,
  snapshot: PublicSnapshot,
  payload: Record<string, unknown> = {}
): PublicSnapshotRefreshResult => {
  logPublicSnapshot("public_snapshot_refresh_skipped", {
    trigger,
    reason,
    version: snapshot.version,
    generatedAt: snapshot.generatedAt,
    ageSeconds: getPublicSnapshotAgeSeconds(snapshot),
    ...payload,
  });

  return {
    snapshot,
    status: "skipped",
    reason,
    nextAttemptAt:
      typeof payload.nextAttemptAt === "string"
        ? payload.nextAttemptAt
        : undefined,
  };
};

const runPublicSnapshotBuildWithRetries = async (
  trigger: PublicSnapshotRefreshTrigger
): Promise<PublicSnapshotRefreshResult> => {
  const { buildAttempts } = getRefreshRetryConfig();

  for (let attempt = 1; attempt <= buildAttempts; attempt += 1) {
    try {
      const snapshot = await buildPublicSnapshot();
      await writePublicSnapshot(snapshot);
      await clearRefreshState();
      return { snapshot, status: "built", attempts: attempt };
    } catch (error) {
      const retryable = isRetryablePublicSnapshotError(error);
      if (retryable && attempt < buildAttempts) {
        const retryDelayMs = getRetryDelayMs(attempt);
        logPublicSnapshot("public_snapshot_build_retry_scheduled", {
          trigger,
          attempt,
          maxAttempts: buildAttempts,
          retryDelayMs,
          error: getErrorMessage(error),
        });
        await wait(retryDelayMs);
        continue;
      }

      logPublicSnapshot("public_snapshot_build_failed", {
        trigger,
        attempt,
        maxAttempts: buildAttempts,
        retryable,
        error: getErrorMessage(error),
      });

      if (retryable) {
        await recordRetryableRefreshFailure(error, trigger);
      }

      throw error;
    }
  }

  throw new Error("Public snapshot refresh did not complete.");
};

const startPublicSnapshotRefresh = (
  trigger: PublicSnapshotRefreshTrigger,
  force: boolean
) => {
  refreshInFlight = (async () => {
    let releaseLock: (() => Promise<void>) | undefined;

    try {
      releaseLock = await acquireRefreshLock();

      const latestSnapshot = await getExistingPublicSnapshotForRefresh(trigger);
      if (!force && latestSnapshot) {
        const ageSeconds = getPublicSnapshotAgeSeconds(latestSnapshot);
        if (ageSeconds < PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS) {
          return skippedRefreshResult(
            "fresh_snapshot",
            trigger,
            latestSnapshot
          );
        }
      }

      return await runPublicSnapshotBuildWithRetries(trigger);
    } catch (error) {
      if (isFileExistsError(error)) {
        const existingSnapshot =
          await getExistingPublicSnapshotForRefresh(trigger);
        if (existingSnapshot) {
          return skippedRefreshResult(
            "already_refreshing",
            trigger,
            existingSnapshot
          );
        }
      }

      throw error;
    } finally {
      if (releaseLock) {
        await releaseLock();
      }
    }
  })().finally(() => {
    refreshInFlight = undefined;
  });

  return refreshInFlight;
};

export async function refreshPublicSnapshotWithResult(
  options: PublicSnapshotRefreshOptions = {}
): Promise<PublicSnapshotRefreshResult> {
  const trigger = options.trigger ?? "script";
  const force = options.force ?? true;
  const existingSnapshot = await getExistingPublicSnapshotForRefresh(trigger);

  if (refreshInFlight) {
    if (existingSnapshot) {
      return skippedRefreshResult(
        "already_refreshing",
        trigger,
        existingSnapshot
      );
    }

    return refreshInFlight;
  }

  if (!force && existingSnapshot) {
    const ageSeconds = getPublicSnapshotAgeSeconds(existingSnapshot);
    if (ageSeconds < PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS) {
      return skippedRefreshResult("fresh_snapshot", trigger, existingSnapshot);
    }
  }

  const activeBackoff = await getActiveBackoffState();
  if (activeBackoff) {
    if (existingSnapshot) {
      return skippedRefreshResult("backoff_active", trigger, existingSnapshot, {
        nextAttemptAt: activeBackoff.nextAttemptAt,
        consecutiveFailures: activeBackoff.consecutiveFailures,
        lastError: activeBackoff.lastError,
      });
    }

    const error = new Error(
      `Public snapshot refresh backoff is active until ${activeBackoff.nextAttemptAt}.`
    );
    (error as Error & { code?: string }).code = "PUBLIC_SNAPSHOT_BACKOFF_ACTIVE";
    throw error;
  }

  return startPublicSnapshotRefresh(trigger, force);
}

export async function refreshPublicSnapshot(
  options: PublicSnapshotRefreshOptions = {}
) {
  const result = await refreshPublicSnapshotWithResult(options);
  return result.snapshot;
}

function refreshPublicSnapshotInBackground() {
  logPublicSnapshot("public_snapshot_background_refresh_requested");
  return refreshPublicSnapshot({
    trigger: "background",
    force: false,
  });
}

async function readPublicSnapshot() {
  const manifestPath = getManifestPath();
  const manifestStat = await stat(manifestPath);
  if (memo && memo.manifestMtimeMs === manifestStat.mtimeMs) {
    return memo.snapshot;
  }

  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8")
  ) as SnapshotManifest;
  const snapshot = JSON.parse(
    await readFile(manifest.path, "utf8")
  ) as PublicSnapshot;

  if (
    manifest.schemaVersion !== SNAPSHOT_SCHEMA_VERSION ||
    snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION
  ) {
    throw new PublicSnapshotSchemaVersionError();
  }

  if (
    snapshot.version !== manifest.version ||
    snapshot.generatedAt !== manifest.generatedAt ||
    Number.isNaN(new Date(snapshot.generatedAt).getTime())
  ) {
    throw new Error("Public snapshot manifest is invalid.");
  }

  assertPublicSnapshot(snapshot);

  memo = {
    manifestMtimeMs: manifestStat.mtimeMs,
    snapshot,
  };

  return snapshot;
}

export async function getExistingPublicSnapshot() {
  try {
    return await readPublicSnapshot();
  } catch (error) {
    if (isMissingFileError(error) || isSnapshotSchemaVersionError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getPublicSnapshot(): Promise<PublicSnapshot> {
  try {
    const snapshot = await readPublicSnapshot();

    if (
      getPublicSnapshotAgeSeconds(snapshot) >=
      PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS
    ) {
      refreshPublicSnapshotInBackground().catch(() => undefined);
    }

    return snapshot;
  } catch (error) {
    if (!isMissingFileError(error) && !isSnapshotSchemaVersionError(error)) {
      throw error;
    }

    return refreshPublicSnapshot({
      trigger: "missing",
      force: true,
    });
  }
}

export function getPublicSnapshotAgeSeconds(snapshot: PublicSnapshot) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(snapshot.generatedAt).getTime()) / 1000)
  );
}

export async function isPublicSnapshotRefreshing() {
  if (refreshInFlight) {
    return true;
  }

  try {
    await stat(getRefreshLockPath());
    return true;
  } catch (error) {
    if (isMissingFileError(error)) {
      return false;
    }

    throw error;
  }
}

export function resetPublicSnapshotStateForTests() {
  memo = undefined;
  refreshInFlight = undefined;
}

export function getPublicSnapshotStatus(snapshot: PublicSnapshot) {
  const ageSeconds = getPublicSnapshotAgeSeconds(snapshot);

  if (ageSeconds < PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS) {
    return "fresh";
  }

  if (ageSeconds < PUBLIC_SNAPSHOT_MAX_STALE_SECONDS) {
    return "stale";
  }

  return "expired";
}

export function getCatalogListings(
  snapshot: PublicSnapshot,
  catalogSlug: string
) {
  const listingIds = snapshot.catalogsBySlug[catalogSlug]?.listingIds || [];
  return listingIds.map((id) => snapshot.cardsById[id]).filter(Boolean);
}
