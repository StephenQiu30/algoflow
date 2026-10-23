import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
  async rewrites() {
    const gateway = (process.env.ALGOFLOW_GATEWAY_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')
    return [{ source: '/api/:path*', destination: `${gateway}/api/:path*` }]
  },
}

export default nextConfig
