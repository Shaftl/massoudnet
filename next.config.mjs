import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: { loaders: true }, // ✅ proper object format
  },
  images: {
    domains: ["res.cloudinary.com"], // ✅ allows Next.js Image to use Cloudinary
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve("./");
    return config;
  },
};

export default nextConfig;
