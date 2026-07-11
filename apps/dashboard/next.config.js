const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cloudhost/db", "@cloudhost/ui"],
  outputFileTracing: false,
  webpack: (config) => {
    config.resolve.alias["@"] = path.join(__dirname);
    return config;
  },
};

module.exports = nextConfig;
