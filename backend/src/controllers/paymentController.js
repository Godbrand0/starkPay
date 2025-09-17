const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const qrService = require('../services/qrService');
const contractService = require('../services/contractService');
const logger = require('../utils/logger');

class PaymentController {
  /**
   * Get payment details from payment ID
   */
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;

      if (!paymentId || !/^[a-fA-F0-9]{32}$/.test(paymentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment ID format'
        });
      }

      // For now, we'll extract payment details from the URL params
      // In a production system, you might store payment requests in a separate collection
      const { m: merchantAddress, t: tokenAddress, a: amount, d: description } = req.query;

      if (!merchantAddress || !tokenAddress || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment parameters'
        });
      }

      // Validate payment parameters
      const validation = qrService.validatePaymentParams({
        m: merchantAddress,
        t: tokenAddress,
        a: amount,
        id: paymentId
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment parameters',
          errors: validation.errors
        });
      }

      // Get merchant information
      const merchant = await Merchant.findByAddress(merchantAddress);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      // Get token information
      const whitelistedTokens = contractService.getWhitelistedTokens();
      const tokenInfo = Object.values(whitelistedTokens).find(
        token => token.address?.toLowerCase() === tokenAddress.toLowerCase()
      );

      if (!tokenInfo) {
        return res.status(400).json({
          success: false,
          message: 'Token not supported'
        });
      }

      // Calculate fees
      const grossAmount = parseFloat(amount);
      const platformFee = await contractService.getPlatformFee();
      const feeAmount = grossAmount * (platformFee / 100);
      const netAmount = grossAmount - feeAmount;

      const paymentDetails = {
        paymentId,
        merchantAddress: merchant.address,
        merchantName: merchant.name,
        merchantDescription: merchant.description,
        tokenAddress: tokenInfo.address,
        tokenSymbol: tokenInfo.symbol,
        tokenName: tokenInfo.name,
        tokenDecimals: tokenInfo.decimals,
        grossAmount,
        feeAmount,
        netAmount,
        platformFeePercentage: platformFee,
        description: description || '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };

      res.json({
        success: true,
        paymentDetails
      });

    } catch (error) {
      logger.error('Error fetching payment details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details',
        error: error.message
      });
    }
  }

  /**
   * Verify a transaction hash
   */
  async verifyTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { transactionHash, paymentId } = req.body;

      // Check if transaction already exists in database
      let transaction = await Transaction.findByHash(transactionHash);
      
      if (transaction) {
        return res.json({
          success: true,
          message: 'Transaction already verified',
          transaction,
          status: transaction.status
        });
      }

      // Verify transaction on Starknet
      const verification = await contractService.verifyTransaction(transactionHash);
      
      if (verification.status === 'error') {
        return res.status(400).json({
          success: false,
          message: 'Failed to verify transaction',
          error: verification.error
        });
      }

      if (verification.status === 'not_found') {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found on network'
        });
      }

      if (verification.status === 'pending') {
        return res.json({
          success: true,
          message: 'Transaction is pending confirmation',
          status: 'pending',
          transactionHash
        });
      }

      if (verification.status === 'failed') {
        return res.status(400).json({
          success: false,
          message: 'Transaction failed',
          error: verification.error
        });
      }

      // Parse payment events from transaction
      const paymentEvents = contractService.parsePaymentEvents(verification.events);
      
      if (paymentEvents.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No payment events found in transaction'
        });
      }

      // Use the first payment event (assuming one payment per transaction)
      const paymentEvent = paymentEvents[0];

      // Find the merchant and update their stats
      const merchant = await Merchant.findByAddress(paymentEvent.merchantAddress);
      if (!merchant) {
        logger.warn(`Payment processed for unknown merchant: ${paymentEvent.merchantAddress}`);
      }

      // Create transaction record
      transaction = new Transaction({
        transactionHash: transactionHash.toLowerCase(),
        merchantAddress: paymentEvent.merchantAddress.toLowerCase(),
        payerAddress: paymentEvent.payerAddress.toLowerCase(),
        tokenAddress: paymentEvent.tokenAddress.toLowerCase(),
        grossAmount: paymentEvent.grossAmount.toString(),
        netAmount: paymentEvent.netAmount.toString(),
        feeAmount: paymentEvent.fee.toString(),
        status: 'completed',
        blockNumber: verification.blockNumber,
        blockHash: verification.blockHash,
        gasUsed: verification.gasUsed?.toString(),
        paymentId: paymentId || null,
        timestamp: new Date(Number(paymentEvent.timestamp) * 1000)
      });

      await transaction.save();

      // Update merchant earnings
      if (merchant) {
        await merchant.updateEarnings(parseFloat(paymentEvent.netAmount));
      }

      // Emit real-time update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to(`merchant_${paymentEvent.merchantAddress}`).emit('payment_received', {
          transaction: transaction.toJSON(),
          merchant: merchant ? {
            name: merchant.name,
            address: merchant.address
          } : null
        });
      }

      logger.info(`Payment verified: ${transactionHash} for merchant ${paymentEvent.merchantAddress}`);

      res.json({
        success: true,
        message: 'Transaction verified successfully',
        transaction,
        status: 'completed'
      });

    } catch (error) {
      logger.error('Error verifying transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify transaction',
        error: error.message
      });
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(req, res) {
    try {
      const { hash } = req.params;

      if (!hash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      // Check database first
      let transaction = await Transaction.findByHash(hash);
      
      if (transaction) {
        return res.json({
          success: true,
          transaction,
          source: 'database'
        });
      }

      // If not in database, check blockchain
      try {
        const chainData = await contractService.getTransactionDetails(hash);
        
        res.json({
          success: true,
          transaction: {
            hash,
            status: chainData.status,
            blockNumber: chainData.receipt?.block_number,
            blockHash: chainData.receipt?.block_hash,
            gasUsed: chainData.receipt?.actual_fee
          },
          source: 'blockchain'
        });
      } catch (chainError) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

    } catch (error) {
      logger.error('Error fetching transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        error: error.message
      });
    }
  }

  /**
   * Get transaction status by hash
   */
  async getTransactionStatus(req, res) {
    try {
      const { hash } = req.params;

      // Check database first
      const transaction = await Transaction.findByHash(hash);
      
      if (transaction) {
        return res.json({
          success: true,
          status: transaction.status,
          transaction: {
            hash: transaction.transactionHash,
            status: transaction.status,
            merchantAddress: transaction.merchantAddress,
            amount: transaction.formattedGrossAmount,
            timestamp: transaction.timestamp
          }
        });
      }

      // Check blockchain
      const verification = await contractService.verifyTransaction(hash);
      
      let status = 'unknown';
      if (verification.status === 'success') {
        status = 'completed';
      } else if (verification.status === 'pending') {
        status = 'pending';
      } else if (verification.status === 'failed') {
        status = 'failed';
      } else if (verification.status === 'not_found') {
        status = 'not_found';
      }

      res.json({
        success: true,
        status,
        onChain: verification.status !== 'not_found',
        blockNumber: verification.blockNumber || null
      });

    } catch (error) {
      logger.error('Error checking transaction status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check transaction status',
        error: error.message
      });
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(req, res) {
    try {
      const { limit = 10, status, tokenAddress } = req.query;

      const query = {};
      if (status) query.status = status;
      if (tokenAddress) query.tokenAddress = tokenAddress.toLowerCase();

      const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 })
        .limit(Math.min(parseInt(limit), 100))
        .populate('merchantAddress', 'name');

      // Get summary stats
      const totalTransactions = await Transaction.countDocuments(query);
      const completedTransactions = await Transaction.countDocuments({
        ...query,
        status: 'completed'
      });

      res.json({
        success: true,
        transactions,
        summary: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: totalTransactions - completedTransactions
        }
      });

    } catch (error) {
      logger.error('Error fetching recent transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }
  }

  /**
   * Get supported tokens
   */
  async getSupportedTokens(req, res) {
    try {
      const tokens = contractService.getWhitelistedTokens();
      
      // Add additional info like current platform fee
      const platformFee = await contractService.getPlatformFee();

      res.json({
        success: true,
        tokens,
        platformFee: {
          percentage: platformFee,
          basisPoints: Math.round(platformFee * 100)
        }
      });

    } catch (error) {
      logger.error('Error fetching supported tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supported tokens',
        error: error.message
      });
    }
  }

  /**
   * Simulate payment calculation
   */
  async calculatePayment(req, res) {
    try {
      const { amount, tokenAddress } = req.body;

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      const grossAmount = parseFloat(amount);
      const platformFee = await contractService.getPlatformFee();
      const feeAmount = grossAmount * (platformFee / 100);
      const netAmount = grossAmount - feeAmount;

      // Get token info if provided
      let tokenInfo = null;
      if (tokenAddress) {
        const whitelistedTokens = contractService.getWhitelistedTokens();
        tokenInfo = Object.values(whitelistedTokens).find(
          token => token.address?.toLowerCase() === tokenAddress.toLowerCase()
        );
      }

      const calculation = {
        grossAmount,
        feeAmount: parseFloat(feeAmount.toFixed(6)),
        netAmount: parseFloat(netAmount.toFixed(6)),
        platformFeePercentage: platformFee,
        token: tokenInfo || null
      };

      res.json({
        success: true,
        calculation
      });

    } catch (error) {
      logger.error('Error calculating payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate payment',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();
