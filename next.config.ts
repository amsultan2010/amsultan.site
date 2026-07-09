import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/portfolio', destination: '/', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: false },
      { source: '/contact/', destination: '/#contact', permanent: false },
    ];
  },
};

export default nextConfig;
