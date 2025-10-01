const { RpcProvider, Contract } = require('starknet');
const { STARKNET_RPC_URL, PAYMENT_PROCESSOR_ADDRESS, MOCK_USDC_ADDRESS, MOCK_USDT_ADDRESS } = require('../config/constants');

const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });

const getProvider = () => provider;

const isValidToken = (tokenAddress) => {
  const validTokens = [MOCK_USDC_ADDRESS, MOCK_USDT_ADDRESS];
  return validTokens.includes(tokenAddress.toLowerCase());
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
};