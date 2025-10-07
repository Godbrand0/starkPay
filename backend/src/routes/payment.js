const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// GET /api/payment/details/:paymentId
router.get('/details/:paymentId', paymentController.getPaymentDetails);

// POST /api/payment/verify
router.post('/verify', paymentController.verifyTransaction);

// GET /api/payment/user/:address - Get user payment history
router.get('/user/:address', paymentController.getUserPayments);

module.exports = router;