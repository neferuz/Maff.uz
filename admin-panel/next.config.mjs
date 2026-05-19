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
        source: '/static/:path*',
        destination: 'http://localhost:8000/static/:path*',
        basePath: false,
      }
    ];
  },
};

export default nextConfig;
