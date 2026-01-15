/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: {
    // Default API URL: dev -> localhost:3000, prod -> 127.0.0.1:3001 (same container)
    API_URL: (() => {
      const isProd = process.env.NODE_ENV === 'production';
      const defaultUrl = isProd ? 'http://127.0.0.1:3001' : 'http://localhost:3000';
      return process.env.API_URL || defaultUrl;
    })(),
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const defaultUrl = isProd ? 'http://127.0.0.1:3001' : 'http://localhost:3000';
    const apiUrl = process.env.API_URL || defaultUrl;
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
