/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["clsx", "tailwind-merge"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
