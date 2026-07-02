import type { NextApiRequest, NextApiResponse } from "next";
import { refreshPublicSnapshotWithResult } from "../../../lib/publicSnapshot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const refreshToken = process.env.PUBLIC_SNAPSHOT_REFRESH_TOKEN;
  if (!refreshToken) {
    res.status(404).json({ error: "Snapshot refresh is not enabled" });
    return;
  }

  const token = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token;

  if (token !== refreshToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const requestedTrigger = Array.isArray(req.query.trigger)
    ? req.query.trigger[0]
    : req.query.trigger;
  const trigger =
    requestedTrigger === "background" || requestedTrigger === "missing"
      ? requestedTrigger
      : "manual";
  const requestEvents = {
    background: "public_snapshot_background_refresh_requested",
    manual: "public_snapshot_manual_refresh_requested",
    missing: "public_snapshot_missing_refresh_requested",
  } as const;

  console.log(
    JSON.stringify({
      event: requestEvents[trigger],
      service: "rolling-oaks-daylilies",
      component: "public-snapshot",
      timestamp: new Date().toISOString(),
    })
  );

  const result = await refreshPublicSnapshotWithResult({
    trigger,
    force: trigger !== "background",
  });
  const { snapshot } = result;
  res.status(200).json({
    ok: true,
    refreshed: result.status === "built",
    skippedReason: result.reason,
    version: snapshot.version,
    generatedAt: snapshot.generatedAt,
    counts: snapshot.counts,
  });
}
