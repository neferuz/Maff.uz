import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 's3.fortifai.uz' },
      { protocol: 'https', hostname: 'api.logobank.uz' },
      { protocol: 'https', hostname: 'pultop.uz' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
