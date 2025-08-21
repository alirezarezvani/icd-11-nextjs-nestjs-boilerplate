const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    forceSwcTransforms: false,
  },
  eslint: {
    dirs: ['pages', 'components', 'hooks', 'services', 'types'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/context': path.resolve(__dirname, 'context'),
      '@/config': path.resolve(__dirname, 'config'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/types': path.resolve(__dirname, 'types'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 