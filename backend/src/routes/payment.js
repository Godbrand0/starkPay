const express = require('express');
const { body, param, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Validation middleware
const validatePaymentId = [
  param('paymentId')
    .matches(/^[a-fA-F0-9]{32}$/)
    .withMessage('Invalid payment ID format')
];

const validateTransactionHash = [
  param('hash')
    .notEmpty()
    .withMessage('Transaction hash is required')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash format')
];

const validateTransactionVerification = [
  body('transactionHash')
    .notEmpty()
    .withMessage('Transaction hash is required')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash format'),
  body('paymentId')
    .optional()
    .matches(/^[a-fA-F0-9]{32}$/)
    .withMessage('Invalid payment ID format')
];

const validatePaymentCalculation = [
  body('amount')
    .isFloat({ min: 0.000001, max: 1000000 })
    .withMessage('Amount must be between 0.000001 and 1,000,000'),
  body('tokenAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid token address format')
];

const validateTransactionQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Status must be pending, completed, or failed'),
  query('tokenAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid token address format')
];

// Routes

/**
 * @route   GET /api/payment/details/:paymentId
 * @desc    Get payment details by payment ID
 * @access  Public
 */
router.get('/details/:paymentId', 
  validatePaymentId,
  [
    query('m')
      .optional()
      .matches(/^0x[a-fA-F0-9]{64}$/)
      .withMessage('Invalid merchant address format'),
    query('t')
      .optional()
      .matches(/^0x[a-fA-F0-9]{64}$/)
      .withMessage('Invalid token address format'),
    query('a')
      .optional()
      .isFloat({ min: 0.000001 })
      .withMessage('Invalid amount'),
    query('d')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Description too long')
  ],
  paymentController.getPaymentDetails
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify a transaction hash and update records
 * @access  Public
 */
router.post('/verify', validateTransactionVerification, paymentController.verifyTransaction);

/**
 * @route   GET /api/payment/transaction/:hash
 * @desc    Get transaction details by hash
 * @access  Public
 */
router.get('/transaction/:hash', validateTransactionHash, paymentController.getTransaction);

/**
 * @route   GET /api/payment/status/:hash
 * @desc    Get transaction status by hash
 * @access  Public
 */
router.get('/status/:hash', validateTransactionHash, paymentController.getTransactionStatus);

/**
 * @route   GET /api/payment/recent
 * @desc    Get recent transactions
 * @access  Public
 */
router.get('/recent', validateTransactionQuery, paymentController.getRecentTransactions);

/**
 * @route   GET /api/payment/tokens
 * @desc    Get supported tokens and platform fee info
 * @access  Public
 */
router.get('/tokens', paymentController.getSupportedTokens);

/**
 * @route   POST /api/payment/calculate
 * @desc    Calculate payment fees and amounts
 * @access  Public
 */
router.post('/calculate', validatePaymentCalculation, paymentController.calculatePayment);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Payment route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in payment routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
