const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// POST /api/merchant/register
router.post('/register', merchantController.registerMerchant);

// GET /api/merchant/:address
router.get('/:address', merchantController.getMerchant);

// POST /api/merchant/:address/qr
router.post('/:address/qr', merchantController.generateQR);

// GET /api/merchant/:address/transactions
router.get('/:address/transactions', merchantController.getMerchantTransactions);

// GET /api/merchant/:address/payments
router.get('/:address/payments', merchantController.getMerchantPayments);

module.exports = router;