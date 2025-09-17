const { Provider, Contract, RpcProvider } = require('starknet');
const logger = require('../utils/logger');

class ContractService {
  constructor() {
    this.provider = null;
    this.paymentProcessorContract = null;
    this.initializeProvider();
  }

  /**
   * Initialize Starknet RPC provider
   */
  initializeProvider() {
    try {
      const rpcUrl = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
      this.provider = new RpcProvider({ nodeUrl: rpcUrl });
      logger.info('Starknet provider initialized');
    } catch (error) {
      logger.error('Failed to initialize Starknet provider:', error);
      throw error;
    }
  }

  /**
   * Get contract instance
   */
  getPaymentProcessorContract() {
    if (!this.paymentProcessorContract) {
      const contractAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
      if (!contractAddress) {
        throw new Error('PAYMENT_PROCESSOR_ADDRESS not configured');
      }

      // Simple ABI for the payment processor
      const abi = [
        {
          "name": "register_merchant",
          "type": "function",
          "inputs": [
            {
              "name": "merchant_address",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "name": "process_payment",
          "type": "function",
          "inputs": [
            {
              "name": "merchant_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            },
            {
              "name": "amount",
              "type": "core::integer::u256"
            }
          ],
          "outputs": [],
          "state_mutability": "external"
        },
        {
          "name": "is_merchant_registered",
          "type": "function",
          "inputs": [
            {
              "name": "merchant_address",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "is_token_whitelisted",
          "type": "function",
          "inputs": [
            {
              "name": "token_address",
              "type": "core::starknet::contract_address::ContractAddress"
            }
          ],
          "outputs": [
            {
              "type": "core::bool"
            }
          ],
          "state_mutability": "view"
        },
        {
          "name": "get_platform_fee_basis_points",
          "type": "function",
          "inputs": [],
          "outputs": [
            {
              "type": "core::integer::u256"
            }
          ],
          "state_mutability": "view"
        }
      ];

      this.paymentProcessorContract = new Contract(abi, contractAddress, this.provider);
    }

    return this.paymentProcessorContract;
  }

  /**
   * Check if merchant is registered on-chain
   */
  async isMerchantRegistered(merchantAddress) {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.call('is_merchant_registered', [merchantAddress]);
      return result === 1n || result === true;
    } catch (error) {
      logger.error('Error checking merchant registration:', error);
      throw new Error(`Failed to check merchant registration: ${error.message}`);
    }
  }

  /**
   * Check if token is whitelisted
   */
  async isTokenWhitelisted(tokenAddress) {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.call('is_token_whitelisted', [tokenAddress]);
      return result === 1n || result === true;
    } catch (error) {
      logger.error('Error checking token whitelist:', error);
      throw new Error(`Failed to check token whitelist: ${error.message}`);
    }
  }

  /**
   * Get platform fee percentage
   */
  async getPlatformFee() {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.call('get_platform_fee_basis_points');
      const feeBasisPoints = Number(result);
      return feeBasisPoints / 100; // Convert basis points to percentage
    } catch (error) {
      logger.error('Error getting platform fee:', error);
      return 2.0; // Default 2% fee
    }
  }

  /**
   * Verify transaction on Starknet
   */
  async verifyTransaction(transactionHash) {
    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return {
          status: 'not_found',
          error: 'Transaction not found'
        };
      }

      // Check transaction status
      const status = receipt.execution_status || receipt.status;
      
      if (status === 'SUCCEEDED' || status === 'ACCEPTED_ON_L2' || status === 'ACCEPTED_ON_L1') {
        return {
          status: 'success',
          receipt,
          blockNumber: receipt.block_number,
          blockHash: receipt.block_hash,
          gasUsed: receipt.actual_fee,
          events: receipt.events || []
        };
      } else if (status === 'REVERTED' || status === 'REJECTED') {
        return {
          status: 'failed',
          receipt,
          error: receipt.revert_reason || 'Transaction reverted'
        };
      } else {
        return {
          status: 'pending',
          receipt
        };
      }
    } catch (error) {
      logger.error('Error verifying transaction:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionHash) {
    try {
      const transaction = await this.provider.getTransaction(transactionHash);
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      return {
        transaction,
        receipt,
        status: receipt?.execution_status || receipt?.status || 'unknown'
      };
    } catch (error) {
      logger.error('Error getting transaction details:', error);
      throw new Error(`Failed to get transaction details: ${error.message}`);
    }
  }

  /**
   * Parse payment events from transaction receipt
   */
  parsePaymentEvents(events) {
    const paymentEvents = [];
    
    for (const event of events) {
      // Look for PaymentProcessed events
      if (event.keys && event.keys.length > 0) {
        try {
          // This would need to be adjusted based on actual event structure
          const eventName = event.keys[0];
          
          if (eventName.includes('PaymentProcessed')) {
            const paymentEvent = {
              merchantAddress: event.data[0],
              payerAddress: event.data[1],
              tokenAddress: event.data[2],
              grossAmount: event.data[3],
              netAmount: event.data[4],
              fee: event.data[5],
              timestamp: event.data[6]
            };
            paymentEvents.push(paymentEvent);
          }
        } catch (parseError) {
          logger.warn('Failed to parse event:', parseError);
        }
      }
    }
    
    return paymentEvents;
  }

  /**
   * Get whitelisted tokens
   */
  getWhitelistedTokens() {
    return {
      USDC: {
        address: process.env.MOCK_USDC_ADDRESS,
        symbol: 'mUSDC',
        name: 'Mock USD Coin',
        decimals: 6
      },
      USDT: {
        address: process.env.MOCK_USDT_ADDRESS,
        symbol: 'mUSDT',
        name: 'Mock Tether USD',
        decimals: 6
      }
    };
  }

  /**
   * Validate Starknet address format
   */
  isValidStarknetAddress(address) {
    if (!address) return false;
    
    // Remove 0x prefix if present
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    
    // Check if it's a valid hex string with correct length (64 characters)
    return /^[a-fA-F0-9]{64}$/.test(cleanAddress);
  }

  /**
   * Format amount for contract interaction
   */
  formatAmountForContract(amount, decimals = 6) {
    // Convert to wei-like format for the token
    const multiplier = Math.pow(10, decimals);
    return Math.floor(parseFloat(amount) * multiplier).toString();
  }

  /**
   * Format amount from contract
   */
  formatAmountFromContract(amount, decimals = 6) {
    const divisor = Math.pow(10, decimals);
    return (parseFloat(amount) / divisor).toFixed(decimals);
  }
}

module.exports = new ContractService();
