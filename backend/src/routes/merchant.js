const express = require('express');
const { body, param, query } = require('express-validator');
const merchantController = require('../controllers/merchantController');

const router = express.Router();

// Validation middleware
const validateMerchantRegistration = [
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid Starknet address format'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
];

const validateStarknetAddress = [
  param('address')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid Starknet address format')
];

const validateQRGeneration = [
  body('tokenAddress')
    .notEmpty()
    .withMessage('Token address is required')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid token address format'),
  body('amount')
    .isFloat({ min: 0.000001, max: 1000000 })
    .withMessage('Amount must be between 0.000001 and 1,000,000'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Status must be pending, completed, or failed')
];

const validateAnalytics = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

// Routes

/**
 * @route   POST /api/merchant/register
 * @desc    Register a new merchant
 * @access  Public
 */
router.post('/register', validateMerchantRegistration, merchantController.registerMerchant);

/**
 * @route   GET /api/merchant/:address
 * @desc    Get merchant information by address
 * @access  Public
 */
router.get('/:address', validateStarknetAddress, merchantController.getMerchant);

/**
 * @route   PUT /api/merchant/:address
 * @desc    Update merchant information
 * @access  Public (in production, this should be authenticated)
 */
router.put('/:address', 
  validateStarknetAddress,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
      .trim(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
  ],
  merchantController.updateMerchant
);

/**
 * @route   POST /api/merchant/:address/qr
 * @desc    Generate QR code for payment
 * @access  Public
 */
router.post('/:address/qr', 
  validateStarknetAddress,
  validateQRGeneration,
  merchantController.generatePaymentQR
);

/**
 * @route   GET /api/merchant/:address/transactions
 * @desc    Get merchant transaction history
 * @access  Public
 */
router.get('/:address/transactions',
  validateStarknetAddress,
  validatePagination,
  merchantController.getTransactions
);

/**
 * @route   GET /api/merchant/:address/analytics
 * @desc    Get merchant dashboard analytics
 * @access  Public
 */
router.get('/:address/analytics',
  validateStarknetAddress,
  validateAnalytics,
  merchantController.getDashboardAnalytics
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Merchant route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in merchant routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
