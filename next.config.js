/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'placehold.co'
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
  }
};

module.exports = nextConfig;
