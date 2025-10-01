const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// GET /api/payment/details/:paymentId
router.get('/details/:paymentId', paymentController.getPaymentDetails);

// POST /api/payment/verify
router.post('/verify', paymentController.verifyTransaction);

module.exports = router;