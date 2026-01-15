/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          // Use env-configured API URL in production; default to local dev
          destination: `${process.env.API_URL || 'http://localhost:3000'}/:path*`,
        },
      ],
    };
  },
}

export default nextConfig
