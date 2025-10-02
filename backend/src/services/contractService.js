const { RpcProvider, Contract } = require('starknet');
const { STARKNET_RPC_URL, PAYMENT_PROCESSOR_ADDRESS, MOCK_USDC_ADDRESS, MOCK_USDT_ADDRESS } = require('../config/constants');

// Starknet Sepolia testnet token (STRK)
const STRK_TOKEN_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

const provider = new RpcProvider({
  nodeUrl: STARKNET_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/7y4TuJI4vDSz8y3MhPkgu'
});

const getProvider = () => provider;

// Normalize Starknet addresses (remove leading zeros, convert to lowercase)
const normalizeAddress = (address) => {
  if (!address) return '';
  // Remove 0x prefix, remove leading zeros, add back 0x, convert to lowercase
  const cleaned = address.replace(/^0x0*/i, '0x');
  return cleaned.toLowerCase();
};

const isValidToken = (tokenAddress) => {
  const normalized = normalizeAddress(tokenAddress);
  const validTokens = [
    normalizeAddress(MOCK_USDC_ADDRESS),
    normalizeAddress(MOCK_USDT_ADDRESS),
    normalizeAddress(STRK_TOKEN_ADDRESS)
  ];
  return validTokens.includes(normalized);
};

const verifyTransaction = async (transactionHash) => {
  try {
    const receipt = await provider.getTransactionReceipt(transactionHash);
    return {
      success: receipt.execution_status === 'SUCCEEDED',
      receipt,
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getTransactionDetails = async (transactionHash) => {
  try {
    const [receipt, transaction] = await Promise.all([
      provider.getTransactionReceipt(transactionHash),
      provider.getTransaction(transactionHash),
    ]);

    return {
      receipt,
      transaction,
      blockNumber: receipt.block_number,
      status: receipt.execution_status,
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

module.exports = {
  getProvider,
  isValidToken,
  verifyTransaction,
  getTransactionDetails,
  normalizeAddress,
  STRK_TOKEN_ADDRESS,
};
