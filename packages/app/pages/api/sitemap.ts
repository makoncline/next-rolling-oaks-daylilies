import { NextApiRequest, NextApiResponse } from "next";
import { getSitemapUrls } from "lib/sitemap";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const urls = await getSitemapUrls();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("\n")}
    </urlset>
  `;
  res.end(xml);
}
