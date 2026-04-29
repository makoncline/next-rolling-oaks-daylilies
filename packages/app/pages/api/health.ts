import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/db";
import {
  getExistingPublicSnapshot,
  getPublicSnapshotAgeSeconds,
  getPublicSnapshotStatus,
  isPublicSnapshotRefreshing,
  PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS,
  PUBLIC_SNAPSHOT_MAX_STALE_SECONDS,
} from "../../lib/publicSnapshot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const snapshot = await getExistingPublicSnapshot().catch((error) => {
    console.error(error);
    return null;
  });

  const database = await prisma.$queryRaw`SELECT 1`
    .then(() => true)
    .catch((error) => {
      console.error(error);
      return false;
    });
  const canServePublicData = Boolean(snapshot) || database;

  res.status(canServePublicData ? 200 : 503).json({
    ok: canServePublicData,
    service: "rolling-oaks-daylilies",
    publicSnapshot: snapshot
      ? {
          status: getPublicSnapshotStatus(snapshot),
          version: snapshot.version,
          generatedAt: snapshot.generatedAt,
          ageSeconds: getPublicSnapshotAgeSeconds(snapshot),
          freshForSeconds: PUBLIC_SNAPSHOT_FRESH_FOR_SECONDS,
          maxStaleSeconds: PUBLIC_SNAPSHOT_MAX_STALE_SECONDS,
          refreshing: isPublicSnapshotRefreshing(),
          visibleListings: snapshot.counts.visibleListings,
        }
      : null,
    checks: {
      canServePublicData,
      database,
      publicSnapshot: Boolean(snapshot),
    },
  });
}
