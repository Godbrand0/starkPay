const Merchant = require('../models/Merchant');
const Payment = require('../models/Payment');
const { generatePaymentId, createPaymentUrl, generateQRCode } = require('../services/qrService');
const { normalizeAddress } = require('../services/contractService');

// Register merchant
exports.registerMerchant = async (req, res) => {
  try {
    console.log('[registerMerchant] Request from:', req.get('origin'));
    console.log('[registerMerchant] Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const { address, name, description, email } = req.body;

    if (!address || !name) {
      return res.status(400).json({
        success: false,
        message: 'Address and name are required',
      });
    }

    console.log("Registering merchant with address:", address);

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ address: address.toLowerCase() });
    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        message: 'Merchant already registered',
      });
    }

    console.log("Creating new merchant entry");

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
    console.log("Error details:", error);
  }
};

// Get merchant details
exports.getMerchant = async (req, res) => {
  try {
    console.log('[getMerchant] Request from:', req.get('origin'));
    console.log('[getMerchant] Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);

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
    console.log('[generateQR] Request from:', req.get('origin'));
    console.log('[generateQR] Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const { address } = req.params;
    const { tokenAddress, amount, description } = req.body;

    if (!tokenAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Token address and amount are required',
      });
    }
    console.log("Generating QR for merchant address:", address);
    console.log("Token address:", tokenAddress);

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

// Get merchant transactions (completed payments)
exports.getMerchantTransactions = async (req, res) => {
  try {
    console.log('[getMerchantTransactions] Request from:', req.get('origin'));
    console.log('[getMerchantTransactions] Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const { address } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const normalizedAddress = normalizeAddress(address);

    // Fetch only completed payments (which are the transactions)
    const transactions = await Payment.find({
      merchantAddress: normalizedAddress,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('transactionHash payerAddress tokenAddress grossAmount netAmount feeAmount blockNumber completedAt amount description');

    console.log("Fetched transactions for merchant address:", normalizedAddress);
    console.log("Total transactions:", transactions.length);

    const total = await Payment.countDocuments({
      merchantAddress: normalizedAddress,
      status: 'completed'
    });

    const merchant = await Merchant.findOne({ address: normalizedAddress });

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

// Get merchant payments (all payments including pending - for tracking)
exports.getMerchantPayments = async (req, res) => {
  try {
    console.log('[getMerchantPayments] Request from:', req.get('origin'));
    console.log('[getMerchantPayments] Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);

    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const normalizedAddress = normalizeAddress(address);

    // Fetch recent payments for this merchant, ordered by most recent
    const payments = await Payment.find({ merchantAddress: normalizedAddress })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('paymentId amount tokenAddress status description createdAt completedAt transactionHash payerAddress netAmount feeAmount');

    console.log("Fetched payments for merchant address:", normalizedAddress);
    console.log("Total payments:", payments.length);

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};

module.exports = exports;