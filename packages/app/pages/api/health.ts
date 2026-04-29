import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/db";
import {
  getPublicSnapshot,
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

  const snapshot = await getPublicSnapshot().catch((error) => {
    console.error(error);
    return null;
  });

  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch (error) {
    console.error(error);
  }
  const ok = Boolean(snapshot);

  res.status(ok ? 200 : 503).json({
    ok,
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
      database,
      publicSnapshot: Boolean(snapshot),
    },
  });
}
