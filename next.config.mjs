import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { cpus, totalmem } from 'os'
import { withSentryConfig } from '@sentry/nextjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack Configuration (stable in Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    // Optimize resolution with priority order
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    // Ultra-fast resolution optimization - @/ aliases removed for Vercel compatibility
  },

  // Ultra-Performance Optimizations for sub-5s compilation
  experimental: {
    // Comprehensive package import optimizations
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-sheet',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-badge',
      '@radix-ui/react-button',
      'framer-motion',
      'clsx',
      'tailwind-merge',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'embla-carousel-react'
    ],
    // CSS and build optimizations
    optimizeCss: true,
    optimizeServerReact: true,
    // Enhanced page data handling
    largePageDataBytes: 512 * 1024, // 512KB for better performance
  },

  // Ultra-fast Development optimizations
  onDemandEntries: {
    // Aggressive caching for ultra-fast compilation
    maxInactiveAge: 10 * 60 * 1000, // 10 minutes (extended cache)
    // Larger buffer for instant page switches
    pagesBufferLength: 20, // Large buffer for all pages
  },

  // Development-specific performance optimizations
  env: {
    // Disable expensive features in development
    NEXT_TELEMETRY_DISABLED: '1',
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations (swcMinify enabled by default in Next.js 15)

  // Cache configuration for better performance
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // Optimized Image Configuration with Error Handling
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Remove external image domains to fix 500 errors - use local images only
    domains: [],
    remotePatterns: [
      // Only include essential domains for better performance
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Optimized caching for better performance
    minimumCacheTTL: 86400, // 1 day cache (reduced for development)
    // Enhanced error handling
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Image optimization timeouts
    loader: 'default',
    path: '/_next/image',
    // Add timeout to prevent hanging
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  trailingSlash: false,

  // Optimized Webpack Configuration
  webpack: (config, { dev, isServer }) => {
    // Development optimizations
    if (dev && !isServer) {
      // Ultra-enhanced module resolution for maximum compilation speed
      config.resolve = {
        ...config.resolve,
        symlinks: false, // Faster resolution
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
        // Enhanced module resolution cache
        cacheWithContext: false,
        cache: true, // Enable resolution caching
        // Alias configuration removed - using relative imports for Vercel compatibility
        alias: {
          ...config.resolve.alias,
        },
        // Optimize module resolution order
        mainFields: ['browser', 'module', 'main'],
        modules: ['node_modules', join(__dirname, 'node_modules')],
      }

      // Ultra-fast development cache configuration
      config.cache = {
        type: 'filesystem',
        cacheDirectory: join(__dirname, '.next/cache/webpack'),
        // Enhanced cache settings for maximum speed
        compression: 'gzip', // Compress cache files
        hashAlgorithm: 'xxhash64', // Faster hashing algorithm
        store: 'pack', // Optimized storage format
        buildDependencies: {
          config: [__filename],
        },
        // Aggressive caching settings
        managedPaths: [join(__dirname, 'node_modules')],
        profile: false, // Disable profiling for speed
        maxMemoryGenerations: 10, // Keep more generations in memory
      }
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        // Enhanced split chunks configuration
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework bundle (React, Next.js)
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // UI library bundle (Radix UI, Lucide)
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|@hookform|react-hook-form|embla-carousel)[\\/]/,
              priority: 30,
            },
            // Database/API bundle
            api: {
              name: 'api',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@prisma|prisma|stripe|next-auth|@tanstack)[\\/]/,
              priority: 25,
            },
            // Utility libraries
            utils: {
              name: 'utils',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](clsx|tailwind-merge|class-variance-authority|zod|date-fns)[\\/]/,
              priority: 22,
            },
            // Common vendor bundle
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
            },
            // Common app bundle
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        // Additional optimizations
        usedExports: true,
        sideEffects: false,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      }
    }

    // Enhanced SVG handling with error catching
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          icon: true,
          svgProps: {
            className: 'w-4 h-4'
          },
        }
      }],
    })

    // Optimize for faster compilation
    config.infrastructureLogging = {
      level: 'warn',
    }

    return config
  },

  // Security Headers - HTTPS COMPLETELY DISABLED FOR DEVELOPMENT
  headers: async () => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      // Minimal headers for development - NO HTTPS ENFORCEMENT
      return [
        {
          source: '/(.*)',
          headers: [
            // Basic security only - no HTTPS enforcement
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on',
            },
            // CSP with Stripe support and NO upgrade-insecure-requests
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://static.elfsight.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "img-src 'self' data: blob: https: http:",
                "font-src 'self' https://fonts.gstatic.com",
                "connect-src 'self' http: https: https://api.stripe.com",
                "frame-src https://js.stripe.com https://hooks.stripe.com",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; '),
            },
          ],
        },
        // Cache headers
        {
          source: '/images/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]
    }

    // Production headers (full security)
    const productionHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'credentialless',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-site',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://static.elfsight.com https://core.elfsightcdn.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https: http:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://sportsdevil.co.uk wss:",
          "frame-src https://js.stripe.com https://hooks.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ]

    return [
      {
        source: '/(.*)',
        headers: productionHeaders,
      },
      // Cache cricket equipment images
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ]
  },

  // Server-side optimization  
  serverExternalPackages: ['prisma', '@prisma/client'],

  // Development server optimizations
  devIndicators: {
    position: 'bottom-right',
  },


  // Compression for faster loading
  compress: true,

  // Remove PoweredBy header
  poweredByHeader: false,

  // Generate standalone output for Docker deployment
  output: 'standalone',

  // TypeScript strict mode for better code quality
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint strict mode
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Redirect configuration - removed /admin -> /admin/dashboard redirect
  redirects: async () => {
    return [
      // No admin redirects - /admin page serves the dashboard directly
    ]
  },

  // Rewrites for better SEO
  rewrites: async () => {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
      },
    ]
  },
}

// Wrap config with Sentry for error tracking and performance monitoring
export default withSentryConfig(nextConfig, {
  // Sentry configuration options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Upload source maps to Sentry for better debugging
  silent: process.env.NODE_ENV === "production",
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  hideSourceMaps: process.env.NODE_ENV === "production",
  disableLogger: process.env.NODE_ENV === "production",
  
  // Automatically instrument pages and API routes
  automaticVercelMonitors: true,
  
  // Upload source maps only in production builds
  dryRun: process.env.NODE_ENV !== "production",
})
