/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ],
    };
  },
}

export default nextConfig
