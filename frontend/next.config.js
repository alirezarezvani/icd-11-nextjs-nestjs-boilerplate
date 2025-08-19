/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    dirs: ['pages', 'components', 'hooks', 'services', 'types'],
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