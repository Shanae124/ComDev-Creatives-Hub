/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    typedRoutes: false,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    // In production (Railway): API runs on 127.0.0.1:3001 in same container
    // In development: API runs on localhost:3000
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
