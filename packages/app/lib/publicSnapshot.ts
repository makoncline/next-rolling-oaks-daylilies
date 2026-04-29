import { createHash } from "crypto";
import { mkdir, readFile, rename, stat, writeFile } from "fs/promises";
import path from "path";
import { siteConfig } from "../siteConfig";
import { prisma } from "../prisma/db";
import {
  AhsDisplay,
  fullCultivarReferenceInclude,
  mapListingCultivarDisplay,
} from "./cultivarDisplay";

const SNAPSHOT_SCHEMA_VERSION = 1;
const HIDDEN_STATUS = "HIDDEN";
export const PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS = 60 * 60;
export const PUBLIC_SNAPSHOT_MAX_STALE_SECONDS = 24 * 60 * 60;

export type PublicImage = {
  id: string;
  url: string;
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
let refreshInFlight: Promise<PublicSnapshot> | undefined;

export const getCatalogSlug = (title: string) =>
  title.toLowerCase().replace(/\s+/g, "-");

const getSnapshotDir = () =>
  process.env.PUBLIC_SNAPSHOT_DIR || path.join(process.cwd(), ".public-data");

const getManifestPath = () => path.join(getSnapshotDir(), "manifest.json");

const isMissingFileError = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

const visibleListingWhere = {
  userId: siteConfig.userId,
  OR: [{ status: null }, { NOT: { status: HIDDEN_STATUS } }],
};

const toPublicImage = (image: { id: string; url: string; order: number }) => ({
  id: image.id,
  url: image.url,
  order: image.order,
});

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
) => {
  const imageUrls = listingIds
    .map((listingId) => cardsById[listingId]?.images[0]?.url)
    .filter(Boolean) as string[];

  if (imageUrls.length === 0) {
    return null;
  }

  const imageIndex =
    hashStringToNumber(`${seed}:${slug}:${imageUrls.length}`) %
    imageUrls.length;
  return imageUrls[imageIndex];
};

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
    prisma.listing.findMany({
      where: visibleListingWhere,
      include: {
        cultivarReference: {
          include: fullCultivarReferenceInclude,
        },
        images: {
          orderBy: { order: "asc" },
        },
        lists: true,
      },
    }),
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

  const mappedListings = rawListings.map(mapListingCultivarDisplay);
  const cardsById: Record<string, PublicListingCard> = {};
  const detailsBySlug: Record<string, PublicListingCard> = {};

  for (const listing of mappedListings) {
    const listsForListing = listing.lists
      .map((list) => listRefsById[list.id])
      .filter(Boolean);
    const images = listing.images.map(toPublicImage);
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
      image: pickCatalogImage(
        generatedAt,
        "for-sale",
        forSaleListingIds,
        cardsById
      ),
      totalCount: forSaleListingIds.length,
      listingIds: forSaleListingIds,
    },
    all: {
      slug: "all",
      name: "All Rolling Oaks Daylilies",
      intro:
        "View all of my daylilies in a single list. This is a great place to start if you're searching for something specific.",
      image: pickCatalogImage(generatedAt, "all", allListingIds, cardsById),
      totalCount: allListingIds.length,
      listingIds: allListingIds,
    },
    search: {
      slug: "search",
      name: "Search",
      intro: "",
      image: pickCatalogImage(generatedAt, "search", allListingIds, cardsById),
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
      image: pickCatalogImage(generatedAt, slug, listingIds, cardsById),
      totalCount: listingIds.length,
      listingIds,
    };
  }

  const staticSitemapEntries: PublicSitemapEntry[] = [
    "",
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

  logPublicSnapshot("public_snapshot_written", {
    version: snapshot.version,
    path: finalPath,
    manifestPath,
  });

  memo = undefined;
}

export async function refreshPublicSnapshot() {
  try {
    const snapshot = await buildPublicSnapshot();
    await writePublicSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    logPublicSnapshot("public_snapshot_build_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function refreshPublicSnapshotInBackground() {
  if (!refreshInFlight) {
    logPublicSnapshot("public_snapshot_background_refresh_started");
    refreshInFlight = refreshPublicSnapshot().finally(() => {
      refreshInFlight = undefined;
    });
  }

  return refreshInFlight;
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
    if (isMissingFileError(error)) {
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
    if (!isMissingFileError(error)) {
      throw error;
    }

    return refreshPublicSnapshot();
  }
}

export function getPublicSnapshotAgeSeconds(snapshot: PublicSnapshot) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(snapshot.generatedAt).getTime()) / 1000)
  );
}

export function isPublicSnapshotRefreshing() {
  return Boolean(refreshInFlight);
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
