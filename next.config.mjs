import path from "path";
import { withPWA } from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  experimental: {
    turbo: { loaders: true },
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve("./");
    return config;
  },
});

export default nextConfig;
