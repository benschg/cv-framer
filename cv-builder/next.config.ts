import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zmfgbwluvrgeojovntkd.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
