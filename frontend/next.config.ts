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
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin-maff',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/admin-maff/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:8000/api/v1/:path*',
      },
      {
        source: '/admin-maff/:path*',
        destination: 'http://127.0.0.1:3001/admin-maff/:path*',
      },
      {
        source: '/admin-maff',
        destination: 'http://127.0.0.1:3001/admin-maff',
      },
      {
        source: '/static/:path*',
        destination: 'http://127.0.0.1:8000/static/:path*',
      },
    ];
  },
};

export default nextConfig;
