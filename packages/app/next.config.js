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
};

module.exports = nextConfig;
