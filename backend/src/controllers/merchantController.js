const { validationResult } = require('express-validator');
const Merchant = require('../models/Merchant');
const Transaction = require('../models/Transaction');
const qrService = require('../services/qrService');
const contractService = require('../services/contractService');
const logger = require('../utils/logger');

class MerchantController {
  /**
   * Register a new merchant
   */
  async registerMerchant(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { address, name, description, email } = req.body;

      // Validate Starknet address format
      if (!contractService.isValidStarknetAddress(address)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Starknet address format'
        });
      }

      // Check if merchant already exists
      const existingMerchant = await Merchant.findByAddress(address);
      if (existingMerchant) {
        return res.status(409).json({
          success: false,
          message: 'Merchant already registered',
          merchant: existingMerchant
        });
      }

      // Create new merchant
      const merchant = new Merchant({
        address: address.toLowerCase(),
        name,
        description,
        email
      });

      await merchant.save();

      // Generate merchant registration QR code
      let registrationQR = null;
      try {
        registrationQR = await qrService.generateMerchantQR(address, name);
      } catch (qrError) {
        logger.warn('Failed to generate registration QR:', qrError);
      }

      logger.info(`New merchant registered: ${address}`);

      res.status(201).json({
        success: true,
        message: 'Merchant registered successfully',
        merchant,
        registrationQR
      });

    } catch (error) {
      logger.error('Error registering merchant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register merchant',
        error: error.message
      });
    }
  }

  /**
   * Get merchant by address
   */
  async getMerchant(req, res) {
    try {
      const { address } = req.params;

      if (!contractService.isValidStarknetAddress(address)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Starknet address format'
        });
      }

      const merchant = await Merchant.findByAddress(address);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      // Get merchant stats
      const stats = {
        totalEarnings: merchant.totalEarnings,
        transactionCount: merchant.transactionCount,
        formattedEarnings: merchant.formattedEarnings,
        lastTransactionAt: merchant.lastTransactionAt,
        registrationDate: merchant.createdAt
      };

      // Check if merchant is registered on-chain (optional check)
      let isRegisteredOnChain = false;
      try {
        if (process.env.PAYMENT_PROCESSOR_ADDRESS) {
          isRegisteredOnChain = await contractService.isMerchantRegistered(address);
        }
      } catch (contractError) {
        logger.warn('Could not check on-chain registration:', contractError);
      }

      res.json({
        success: true,
        merchant,
        stats,
        isRegisteredOnChain
      });

    } catch (error) {
      logger.error('Error fetching merchant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch merchant',
        error: error.message
      });
    }
  }

  /**
   * Generate QR code for payment
   */
  async generatePaymentQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { address } = req.params;
      const { tokenAddress, amount, description } = req.body;

      // Validate merchant exists
      const merchant = await Merchant.findByAddress(address);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      // Validate token address
      if (!contractService.isValidStarknetAddress(tokenAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token address format'
        });
      }

      // Validate amount
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Check if token is whitelisted (optional check)
      const whitelistedTokens = contractService.getWhitelistedTokens();
      const isKnownToken = Object.values(whitelistedTokens).some(
        token => token.address?.toLowerCase() === tokenAddress.toLowerCase()
      );

      if (!isKnownToken) {
        logger.warn(`Unknown token used: ${tokenAddress}`);
      }

      // Generate QR code
      const qrData = await qrService.createPaymentQR(
        address,
        tokenAddress,
        amount,
        description || ''
      );

      // Store payment request (optional - for tracking)
      // You might want to store this in a separate PaymentRequest model

      logger.info(`QR generated for merchant ${address}: ${qrData.paymentId}`);

      res.json({
        success: true,
        message: 'QR code generated successfully',
        ...qrData
      });

    } catch (error) {
      logger.error('Error generating payment QR:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message
      });
    }
  }

  /**
   * Get merchant transaction history
   */
  async getTransactions(req, res) {
    try {
      const { address } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      // Validate merchant exists
      const merchant = await Merchant.findByAddress(address);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 50), // Max 50 per page
        status
      };

      // Get transactions
      const transactions = await Transaction.findByMerchant(address, options);

      // Get total count for pagination
      const totalQuery = { merchantAddress: address.toLowerCase() };
      if (status) totalQuery.status = status;
      
      const totalCount = await Transaction.countDocuments(totalQuery);
      const totalPages = Math.ceil(totalCount / options.limit);

      // Calculate summary stats
      const completedTransactions = await Transaction.find({
        merchantAddress: address.toLowerCase(),
        status: 'completed'
      });

      const totalEarnings = completedTransactions.reduce((sum, tx) => {
        return sum + parseFloat(tx.netAmount || 0);
      }, 0);

      const summary = {
        totalTransactions: totalCount,
        completedTransactions: completedTransactions.length,
        totalEarnings: totalEarnings,
        formattedEarnings: (totalEarnings / 1000000).toFixed(6) // Convert to readable format
      };

      const pagination = {
        currentPage: options.page,
        totalPages,
        totalCount,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1,
        limit: options.limit
      };

      res.json({
        success: true,
        transactions,
        summary,
        pagination
      });

    } catch (error) {
      logger.error('Error fetching merchant transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }
  }

  /**
   * Get merchant dashboard analytics
   */
  async getDashboardAnalytics(req, res) {
    try {
      const { address } = req.params;
      const { days = 30 } = req.query;

      const merchant = await Merchant.findByAddress(address);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get daily transaction stats
      const dailyStats = await Transaction.aggregate([
        {
          $match: {
            merchantAddress: address.toLowerCase(),
            status: 'completed',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            revenue: { $sum: { $toDouble: "$netAmount" } },
            transactions: { $sum: 1 },
            volume: { $sum: { $toDouble: "$grossAmount" } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get token breakdown
      const tokenStats = await Transaction.aggregate([
        {
          $match: {
            merchantAddress: address.toLowerCase(),
            status: 'completed',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: "$tokenAddress",
            volume: { $sum: { $toDouble: "$grossAmount" } },
            transactions: { $sum: 1 },
            revenue: { $sum: { $toDouble: "$netAmount" } }
          }
        },
        { $sort: { volume: -1 } }
      ]);

      // Calculate growth metrics
      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(days) * 2));
      
      const previousStats = await Transaction.aggregate([
        {
          $match: {
            merchantAddress: address.toLowerCase(),
            status: 'completed',
            timestamp: { $gte: previousPeriodStart, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $toDouble: "$netAmount" } },
            transactions: { $sum: 1 }
          }
        }
      ]);

      const currentTotal = dailyStats.reduce((sum, day) => sum + day.revenue, 0);
      const previousTotal = previousStats[0]?.revenue || 0;
      const revenueGrowth = previousTotal > 0 
        ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(2)
        : 0;

      const analytics = {
        summary: {
          totalRevenue: currentTotal,
          totalTransactions: dailyStats.reduce((sum, day) => sum + day.transactions, 0),
          averageTransactionValue: currentTotal / Math.max(dailyStats.reduce((sum, day) => sum + day.transactions, 0), 1),
          revenueGrowth: parseFloat(revenueGrowth)
        },
        dailyStats: dailyStats.map(stat => ({
          date: stat._id,
          revenue: parseFloat((stat.revenue / 1000000).toFixed(6)),
          transactions: stat.transactions,
          volume: parseFloat((stat.volume / 1000000).toFixed(6))
        })),
        tokenBreakdown: tokenStats.map(token => {
          const whitelistedTokens = contractService.getWhitelistedTokens();
          const tokenInfo = Object.values(whitelistedTokens).find(
            t => t.address?.toLowerCase() === token._id.toLowerCase()
          );
          
          return {
            address: token._id,
            symbol: tokenInfo?.symbol || 'UNKNOWN',
            volume: parseFloat((token.volume / 1000000).toFixed(6)),
            transactions: token.transactions,
            revenue: parseFloat((token.revenue / 1000000).toFixed(6))
          };
        })
      };

      res.json({
        success: true,
        analytics,
        period: `${days} days`,
        merchant: {
          name: merchant.name,
          address: merchant.address
        }
      });

    } catch (error) {
      logger.error('Error fetching dashboard analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  /**
   * Update merchant information
   */
  async updateMerchant(req, res) {
    try {
      const { address } = req.params;
      const { name, description, email } = req.body;

      const merchant = await Merchant.findByAddress(address);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found'
        });
      }

      // Update fields
      if (name) merchant.name = name;
      if (description !== undefined) merchant.description = description;
      if (email !== undefined) merchant.email = email;

      await merchant.save();

      logger.info(`Merchant updated: ${address}`);

      res.json({
        success: true,
        message: 'Merchant updated successfully',
        merchant
      });

    } catch (error) {
      logger.error('Error updating merchant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update merchant',
        error: error.message
      });
    }
  }
}

module.exports = new MerchantController();
