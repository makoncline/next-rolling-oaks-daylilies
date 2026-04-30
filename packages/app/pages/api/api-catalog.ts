import type { NextApiRequest, NextApiResponse } from "next";
import { siteConfig } from "../../siteConfig";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Content-Type", "application/linkset+json");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  const linkset = {
    linkset: [
      {
        anchor: `${siteConfig.baseUrl}/api`,
        "service-desc": [
          {
            href: `${siteConfig.baseUrl}/openapi.json`,
            type: "application/vnd.oai.openapi+json",
          },
        ],
        "service-doc": [
          {
            href: `${siteConfig.baseUrl}/llms.txt`,
            type: "text/plain",
          },
        ],
        status: [
          {
            href: `${siteConfig.baseUrl}/api/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };

  res.statusCode = 200;
  if (req.method !== "HEAD") {
    res.write(JSON.stringify(linkset));
  }
  res.end();
}
