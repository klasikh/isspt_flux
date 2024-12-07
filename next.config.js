/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
compiler: {
    emotion: {
      sourceMap: true,
      autoLabel: 'never',
    },
  },
  images: {
    minimumCacheTTL: 3600,
  },
  experimental: {
    optimizePackageImports: [],
  },
  poweredByHeader: false,
}

module.exports = nextConfig
