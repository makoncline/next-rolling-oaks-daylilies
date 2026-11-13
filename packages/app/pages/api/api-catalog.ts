import type { NextApiRequest, NextApiResponse } from "next";
import { siteConfig } from "../../siteConfig";
import { cacheAtEdge, neverCacheAtEdge } from "../../lib/cdnCache";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  neverCacheAtEdge(res);
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Content-Type", "application/linkset+json");
  cacheAtEdge(res);
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
