import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve("./");
    return config;
  },
};

export default nextConfig;
