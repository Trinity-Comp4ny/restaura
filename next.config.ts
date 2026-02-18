import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    typedRoutes: false,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Otimizações de performance
  webpack: (config, { dev, isServer }) => {
    // Otimizar bundle em produção e desenvolvimento
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            // React e libs core
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // UI components
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              priority: 15,
              reuseExistingChunk: true,
            },
            // Libs comuns
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          minSize: 20000,
        },
      }
    }
    return config
  },
}

export default withSentryConfig(nextConfig, {
  org: 'trinity-company',
  project: 'restaura',
  
  // Silenciar logs do Sentry durante build
  silent: !process.env.CI,
  
  // Upload source maps apenas em produção
  widenClientFileUpload: true,
  
  // Sourcemaps - desabilitados em desenvolvimento
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },
  
  // Tunnel para evitar ad-blockers
  tunnelRoute: '/monitoring',
})
