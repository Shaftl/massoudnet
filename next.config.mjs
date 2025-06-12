/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack and use Webpack
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
