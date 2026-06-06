/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin-maff',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
        basePath: false,
      },
      {
        source: '/admin-maff/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
        basePath: false,
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:3000/images/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/doors/:path*',
        destination: 'http://localhost:8000/static/uploads/doors/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/handles/:path*',
        destination: 'http://localhost:8000/static/uploads/handles/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/rocko/:path*',
        destination: 'http://localhost:8000/static/uploads/rocko/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/kronofloor/:path*',
        destination: 'http://localhost:8000/static/uploads/kronofloor/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/tarkett/:path*',
        destination: 'http://localhost:8000/static/uploads/tarkett/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/coswick/:path*',
        destination: 'http://localhost:8000/static/uploads/coswick/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/jossbeaumont/:path*',
        destination: 'http://localhost:8000/static/uploads/jossbeaumont/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/egger/:path*',
        destination: 'http://localhost:8000/static/uploads/egger/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/kronospan/:path*',
        destination: 'http://localhost:8000/static/uploads/kronospan/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/sargo/:path*',
        destination: 'http://localhost:8000/static/uploads/sargo/:path*',
        basePath: false,
      },
      {
        source: '/static/uploads/:path*',
        destination: 'https://maff.uz/static/uploads/:path*',
        basePath: false,
      },
      {
        source: '/upload/:path*',
        destination: 'https://maff.uz/upload/:path*',
        basePath: false,
      },
      {
        source: '/static/:path*',
        destination: 'http://localhost:8000/static/:path*',
        basePath: false,
      }
    ];
  },
};

export default nextConfig;
