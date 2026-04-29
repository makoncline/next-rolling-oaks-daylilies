import type { NextApiRequest, NextApiResponse } from "next";
import { refreshPublicSnapshot } from "../../../lib/publicSnapshot";

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

  console.log(
    JSON.stringify({
      event: "public_snapshot_manual_refresh_requested",
      service: "rolling-oaks-daylilies",
      component: "public-snapshot",
      timestamp: new Date().toISOString(),
    })
  );

  const snapshot = await refreshPublicSnapshot();
  res.status(200).json({
    ok: true,
    version: snapshot.version,
    generatedAt: snapshot.generatedAt,
    counts: snapshot.counts,
  });
}
