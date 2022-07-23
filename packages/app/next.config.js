/** @type {import('next').NextConfig} */

const withTM = require("next-transpile-modules")(["@packages/design-system"]);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    styledComponents: true,
  },
};

module.exports = withTM({ nextConfig });
