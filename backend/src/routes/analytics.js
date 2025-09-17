const express = require('express');
const { query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const contractService = require('../services/contractService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateAnalyticsQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * @route   GET /api/analytics
 * @desc    Get overall platform analytics
 * @access  Public
 */
router.get('/', validateAnalyticsQuery, async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get overall stats
    const totalStats = await Promise.all([
      Transaction.getTotalStats(),
      Merchant.getTotalStats()
    ]);

    const transactionStats = totalStats[0][0] || {
      totalRevenue: 0,
      totalFees: 0,
      totalTransactions: 0,
      averageTransaction: 0
    };

    const merchantStats = totalStats[1][0] || {
      totalMerchants: 0,
      totalEarnings: 0,
      totalTransactions: 0
    };

    // Get daily revenue trends
    const dailyRevenue = await Transaction.getDailyStats(parseInt(days));

    // Get token distribution
    const tokenStats = await Transaction.getTokenStats(parseInt(days));
    const whitelistedTokens = contractService.getWhitelistedTokens();
    
    const tokenDistribution = tokenStats.map(stat => {
      const tokenInfo = Object.values(whitelistedTokens).find(
        token => token.address?.toLowerCase() === stat._id.toLowerCase()
      );
      
      return {
        token: tokenInfo?.symbol || 'UNKNOWN',
        address: stat._id,
        value: parseFloat((stat.volume / 1000000).toFixed(6)),
        transactions: stat.transactions,
        color: tokenInfo?.symbol === 'mUSDC' ? '#3B82F6' : 
               tokenInfo?.symbol === 'mUSDT' ? '#10B981' : '#9CA3AF'
      };
    });

    // Get top merchants
    const topMerchants = await Merchant.getTopMerchants(parseInt(limit));
    const formattedTopMerchants = topMerchants.map(merchant => ({
      address: merchant.address,
      name: merchant.name,
      revenue: parseFloat((merchant.totalEarnings / 1000000).toFixed(6))
    }));

    // Calculate growth metrics (compare with previous period)
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(days) * 2));
    
    const previousStats = await Transaction.aggregate([
      {
        $match: {
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

    const currentRevenue = parseFloat((transactionStats.totalRevenue / 1000000).toFixed(6));
    const previousRevenue = previousStats[0] ? parseFloat((previousStats[0].revenue / 1000000).toFixed(6)) : 0;
    
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
      : 0;

    const currentTransactionCount = transactionStats.totalTransactions;
    const previousTransactionCount = previousStats[0]?.transactions || 0;
    
    const transactionGrowth = previousTransactionCount > 0
      ? ((currentTransactionCount - previousTransactionCount) / previousTransactionCount * 100)
      : 0;

    const analytics = {
      totalRevenue: currentRevenue,
      totalTransactions: transactionStats.totalTransactions,
      totalMerchants: merchantStats.totalMerchants,
      averageTransaction: parseFloat((transactionStats.averageTransaction / 1000000).toFixed(6)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      transactionGrowth: parseFloat(transactionGrowth.toFixed(2)),
      dailyRevenue: dailyRevenue.map(day => ({
        date: day._id,
        revenue: parseFloat((day.revenue / 1000000).toFixed(6)),
        transactions: day.transactions
      })),
      tokenDistribution,
      topMerchants: formattedTopMerchants,
      platformFee: await contractService.getPlatformFee(),
      period: `${days} days`
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/summary
 * @desc    Get quick summary stats
 * @access  Public
 */
router.get('/summary', async (req, res) => {
  try {
    const [transactionStats, merchantStats] = await Promise.all([
      Transaction.getTotalStats(),
      Merchant.getTotalStats()
    ]);

    const summary = {
      totalRevenue: parseFloat(((transactionStats[0]?.totalRevenue || 0) / 1000000).toFixed(6)),
      totalFees: parseFloat(((transactionStats[0]?.totalFees || 0) / 1000000).toFixed(6)),
      totalTransactions: transactionStats[0]?.totalTransactions || 0,
      totalMerchants: merchantStats[0]?.totalMerchants || 0,
      averageTransaction: parseFloat(((transactionStats[0]?.averageTransaction || 0) / 1000000).toFixed(6)),
      platformFee: await contractService.getPlatformFee()
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    logger.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/analytics/health
 * @desc    Get system health metrics
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check recent activity
    const recentTransactions = await Transaction.countDocuments({
      timestamp: { $gte: oneHourAgo }
    });

    const recentMerchants = await Merchant.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    // Check contract service health
    let contractHealth = 'unknown';
    try {
      const platformFee = await contractService.getPlatformFee();
      contractHealth = platformFee > 0 ? 'healthy' : 'warning';
    } catch (contractError) {
      contractHealth = 'error';
    }

    const health = {
      status: 'operational',
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      recentActivity: {
        transactionsLastHour: recentTransactions,
        merchantsRegisteredLastHour: recentMerchants
      },
      services: {
        database: 'healthy', // MongoDB connection is assumed healthy if we reach this point
        blockchain: contractHealth,
        api: 'healthy'
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json({
      success: true,
      health
    });

  } catch (error) {
    logger.error('Error checking health:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      health: {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  logger.error('Analytics route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in analytics routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
