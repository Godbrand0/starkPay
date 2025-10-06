const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

// Get current price rates
router.get('/rates', priceController.getRates);

// Convert between currencies
router.post('/convert', priceController.convert);

// Get all conversions for an amount
router.post('/convert-all', priceController.convertAll);

module.exports = router;
