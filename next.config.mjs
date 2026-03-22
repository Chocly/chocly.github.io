import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Alias react-router-dom to our Next.js compatibility shim
  webpack: (config) => {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'src/lib/react-router-shim.js');
    return config;
  },
  turbopack: {
    resolveAlias: {
      'react-router-dom': './src/lib/react-router-shim.js',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'chocolate-review-web.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Redirect old routes if needed
  async redirects() {
    return [
      {
        source: '/barcode',
        destination: '/scanner',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
