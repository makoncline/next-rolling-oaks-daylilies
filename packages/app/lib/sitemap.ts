import { siteConfig } from "siteConfig";
import { getPublicSnapshot } from "./publicSnapshot";

export const getSitemapEntry = (path: string, lastmod: Date) => {
  const loc = `${siteConfig.baseUrl}${path}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
      </url>
    `;
};

export const getSitemapUrls = async () => {
  const snapshot = await getPublicSnapshot();

  return snapshot.sitemapEntries.map((entry) =>
    getSitemapEntry(entry.path, new Date(entry.lastmod))
  );
};
