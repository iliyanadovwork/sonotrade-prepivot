import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,

  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},

  // Optimize webpack configuration for faster builds (fallback for --webpack flag)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable source maps in development for speed
      config.devtool = false;

      // Optimize file watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    return config;
  },

  // Optimize imports
  modularizeImports: {
    '@stylexjs/stylex': {
      transform: '@stylexjs/stylex',
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better performance
  experimental: {
    // Use Turbopack for faster dev server (Next.js 13+)
    // Uncomment when ready to test - it's much faster!
    // turbo: {},

    // Optimize package imports
    optimizePackageImports: ['@stylexjs/stylex', 'lucide-react'],
  },
};

export default nextConfig;
