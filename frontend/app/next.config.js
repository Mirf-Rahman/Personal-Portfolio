const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    // Don't block builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  // Transpile @react-three packages to prevent React version mismatch
  transpilePackages: ["three", "@react-three/fiber"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "8080",
        pathname: "/api/files/**",
      },
    ],
  },
  // Proxy /api requests to backend
  async rewrites() {
    // Use localhost:8080 for local dev, backend:8080 for Docker
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

