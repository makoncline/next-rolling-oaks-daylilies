/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      "www.daylilies.org",
      "daylily-catalog-images.s3.amazonaws.com",
      "daylily-catalog-images-stage.s3.amazonaws.com",
      "images.daylilycatalog.com",
      "www.daylilydatabase.org",
    ],
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
