import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.suamusica.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;