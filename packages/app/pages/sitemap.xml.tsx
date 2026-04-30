import { GetServerSideProps } from "next";
import { getSitemapUrls } from "lib/sitemap";

const SitemapXml = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = await getSitemapUrls();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "stale-while-revalidate, s-maxage=3600");
  res.write(xml);
  res.end();

  return {
    props: {},
  };
};

export default SitemapXml;
