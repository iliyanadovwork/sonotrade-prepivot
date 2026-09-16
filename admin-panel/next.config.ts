import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
  // Disable strict mode to prevent proxy conflicts with browser extensions
  reactStrictMode: false,
  // Webpack config to handle browser extension conflicts
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Add headers to prevent CORS issues with extensions
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;










