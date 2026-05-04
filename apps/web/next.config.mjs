/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ["@chaintrigger/shared"],
  // For MongoDB connection in API routes
  experimental: {
    serverComponentsExternalPackages: ["mongoose"]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
