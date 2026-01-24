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
};

module.exports = nextConfig;
