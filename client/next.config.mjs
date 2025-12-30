/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow images from API server (for uploaded images)
    // Uses environment variable for production flexibility
    remotePatterns: (() => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const apiHostname = process.env.NEXT_PUBLIC_API_HOSTNAME;
        
        const patterns = [];
        
        // If API_HOSTNAME is set, use it (production)
        if (apiHostname) {
          const url = new URL(apiUrl);
          const protocol = url.protocol.replace(':', '');
          const port = url.port || (protocol === 'https' ? '443' : '80');
          
          patterns.push({
            protocol: protocol === 'https' ? 'https' : 'http',
            hostname: apiHostname,
            ...(port && port !== '80' && port !== '443' && { port }),
            pathname: '/uploads/**',
          });
        }
        
        // Always include localhost for development
        patterns.push({
          protocol: 'http',
          hostname: 'localhost',
          port: '5000',
          pathname: '/uploads/**',
        });
        
        return patterns;
      } catch (error) {
        // Fallback to localhost if URL parsing fails
        return [
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '5000',
            pathname: '/uploads/**',
          },
        ];
      }
    })(),
    // Minimum quality for optimized images
    minimumCacheTTL: 60,
  },
  // Configure HTTP cache headers for static assets
  async headers() {
    return [
      {
        // Static assets (JS, CSS, images, fonts) - immutable cache
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Next.js image optimization - long cache
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Font files - immutable cache
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Static images and assets
        source: '/:path*\\.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
}

export default nextConfig
