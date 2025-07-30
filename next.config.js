/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Updated to use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  typescript: {
    // Set to false in development for better DX
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Set to false in development for better DX
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;