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
        source: '/static/uploads/doors/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/doors/:path*',
      },
      {
        source: '/static/uploads/handles/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/handles/:path*',
      },
      {
        source: '/static/uploads/rocko/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/rocko/:path*',
      },
      {
        source: '/static/uploads/kronofloor/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/kronofloor/:path*',
      },
      {
        source: '/static/uploads/tarkett/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/tarkett/:path*',
      },
      {
        source: '/static/uploads/coswick/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/coswick/:path*',
      },
      {
        source: '/static/uploads/jossbeaumont/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/jossbeaumont/:path*',
      },
      {
        source: '/static/uploads/egger/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/egger/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/kronospan/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/kronospan/:path*',
      },
      {
        source: '/static/uploads/sargo/:path*',
        destination: 'http://127.0.0.1:8000/static/uploads/sargo/:path*',
      },
      {
        source: '/static/uploads/:path*',
        destination: 'https://maff.uz/static/uploads/:path*',
      },
      {
        source: '/upload/:path*',
        destination: 'https://maff.uz/upload/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://127.0.0.1:8000/static/:path*',
      },
    ];
  },
};

export default nextConfig;
