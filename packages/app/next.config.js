/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.daylilies.org" },
      {
        protocol: "https",
        hostname: "daylily-catalog-images.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "daylily-catalog-images-stage.s3.amazonaws.com",
      },
      { protocol: "https", hostname: "images.daylilycatalog.com" },
      { protocol: "https", hostname: "www.daylilydatabase.org" },
      { protocol: "https", hostname: "garden.org" },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</sitemap.xml>; rel="sitemap"; type="application/xml", </llms.txt>; rel="service-doc"; type="text/plain", </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </.well-known/agent-skills/index.json>; rel="service-desc"; type="application/json"',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/api-catalog",
        destination: "/api/api-catalog",
      },
    ];
  },
};

module.exports = nextConfig;
