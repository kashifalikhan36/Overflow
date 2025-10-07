/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fix for canvas module in Konva
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
      fs: false,
    };
    
    // Externalize canvas on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Compression
  compress: true,

  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,
  
  // Experimental features disabled for now due to missing dependencies
  // experimental: {
  //   optimizeCss: true,
  // },

  // Environment variables (public)
  env: {
    NEXT_PUBLIC_APP_NAME: 'Overflow',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
