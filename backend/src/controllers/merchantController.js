const Merchant = require('../models/Merchant');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const { generatePaymentId, createPaymentUrl, generateQRCode } = require('../services/qrService');

// Register merchant
exports.registerMerchant = async (req, res) => {
  try {
    const { address, name, description, email } = req.body;

    if (!address || !name) {
      return res.status(400).json({
        success: false,
        message: 'Address and name are required',
      });
    }

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ address: address.toLowerCase() });
    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        message: 'Merchant already registered',
      });
    }

    const merchant = new Merchant({
      address: address.toLowerCase(),
      name,
      description,
      email,
    });

    await merchant.save();

    res.status(201).json({
      success: true,
      merchant,
      message: 'Merchant registered successfully',
    });
  } catch (error) {
    console.error('Error registering merchant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register merchant',
      error: error.message,
    });
  }
};

// Get merchant details
exports.getMerchant = async (req, res) => {
  try {
    const { address } = req.params;

    const merchant = await Merchant.findOne({ address: address.toLowerCase() });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    res.json({
      success: true,
      merchant,
      stats: {
        totalEarnings: merchant.totalEarnings,
        transactionCount: merchant.transactionCount,
      },
    });
  } catch (error) {
    console.error('Error fetching merchant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant',
      error: error.message,
    });
  }
};

// Generate QR code for payment
exports.generateQR = async (req, res) => {
  try {
    const { address } = req.params;
    const { tokenAddress, amount, description } = req.body;

    if (!tokenAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Token address and amount are required',
      });
    }

    // Verify merchant exists
    const merchant = await Merchant.findOne({ address: address.toLowerCase() });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    const paymentId = generatePaymentId();
    const paymentUrl = createPaymentUrl(address, tokenAddress, amount, paymentId);
    const qrCode = await generateQRCode(paymentUrl);

    // Save payment record
    const payment = new Payment({
      paymentId,
      merchantAddress: address.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      amount,
      description,
      qrCode,
      paymentUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await payment.save();

    res.json({
      success: true,
      paymentId,
      qrCode,
      paymentUrl,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message,
    });
  }
};

// Get merchant transactions
exports.getMerchantTransactions = async (req, res) => {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ merchantAddress: address.toLowerCase() })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ merchantAddress: address.toLowerCase() });

    const merchant = await Merchant.findOne({ address: address.toLowerCase() });

    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      totalEarnings: merchant?.totalEarnings || 0,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message,
    });
  }
};

module.exports = exports;