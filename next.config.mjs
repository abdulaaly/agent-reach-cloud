/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // optimize package imports for fast serverless bundling
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
