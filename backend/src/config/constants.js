module.exports = {
  PORT: process.env.PORT || 3004,
  MONGODB_URI: process.env.MONGODB_URI,
  STARKNET_RPC_URL: process.env.STARKNET_RPC_URL,
  PAYMENT_PROCESSOR_ADDRESS: process.env.PAYMENT_PROCESSOR_ADDRESS,
  MOCK_USDC_ADDRESS: process.env.MOCK_USDC_ADDRESS,
  MOCK_USDT_ADDRESS: process.env.MOCK_USDT_ADDRESS,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PLATFORM_FEE_BASIS_POINTS: 200, // 2%
};