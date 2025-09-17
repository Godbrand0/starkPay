/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STARKNET_NETWORK: process.env.NEXT_PUBLIC_STARKNET_NETWORK,
    NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS,
    NEXT_PUBLIC_MOCK_USDC_ADDRESS: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS,
    NEXT_PUBLIC_MOCK_USDT_ADDRESS: process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS,
  },
}

module.exports = nextConfig
