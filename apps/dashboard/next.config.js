/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cloudhost/db", "@cloudhost/ui"],
  outputFileTracing: false,
};

module.exports = nextConfig;
