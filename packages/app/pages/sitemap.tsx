import fs from "fs";
import { getSitemapUrls } from "lib/sitemap";
import { useRouter } from "next/router";
import React from "react";

const Sitemap = () => {
  const router = useRouter();
  React.useEffect(() => {
    router.push("/404");
  }, [router]);
};

export const getStaticProps = async () => {
  const urls = await getSitemapUrls();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join("\n")}
      </urlset>
    `;
  fs.writeFileSync("public/sitemap.xml", xml);
  return { props: {} };
};

export default Sitemap;
