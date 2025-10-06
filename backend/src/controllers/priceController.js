const { getPriceRates, convertCurrency, getAllConversions } = require('../services/priceService');

/**
 * Get current price rates
 * GET /api/price/rates
 */
exports.getRates = async (req, res) => {
  try {
    const rates = await getPriceRates();

    res.json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error('Error getting price rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price rates',
      error: error.message,
    });
  }
};

/**
 * Convert amount between currencies
 * POST /api/price/convert
 * Body: { amount, fromCurrency, toCurrency }
 */
exports.convert = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'amount, fromCurrency, and toCurrency are required',
      });
    }

    const convertedAmount = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);

    res.json({
      success: true,
      amount: parseFloat(amount),
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      convertedAmount,
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
      error: error.message,
    });
  }
};

/**
 * Get all conversions for a given amount
 * POST /api/price/convert-all
 * Body: { amount, fromCurrency }
 */
exports.convertAll = async (req, res) => {
  try {
    const { amount, fromCurrency } = req.body;

    if (!amount || !fromCurrency) {
      return res.status(400).json({
        success: false,
        message: 'amount and fromCurrency are required',
      });
    }

    const conversions = await getAllConversions(parseFloat(amount), fromCurrency);

    res.json({
      success: true,
      ...conversions,
    });
  } catch (error) {
    console.error('Error getting all conversions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversions',
      error: error.message,
    });
  }
};

module.exports = exports;
