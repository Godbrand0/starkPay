const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const { verifyTransaction, getTransactionDetails } = require('../services/contractService');

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const merchant = await Merchant.findOne({ address: payment.merchantAddress });

    res.json({
      success: true,
      merchantAddress: payment.merchantAddress,
      merchantName: merchant?.name || 'Unknown Merchant',
      tokenAddress: payment.tokenAddress,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};

// Verify transaction
exports.verifyTransaction = async (req, res) => {
  try {
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required',
      });
    }

    // Check if transaction already exists
    let transaction = await Transaction.findOne({ transactionHash });
    if (transaction) {
      return res.json({
        success: true,
        transaction,
        message: 'Transaction already verified',
      });
    }

    // Verify on-chain
    const verification = await verifyTransaction(transactionHash);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed',
      });
    }

    const details = await getTransactionDetails(transactionHash);

    // Parse transaction events to extract payment details
    // Note: This is a simplified version. In production, you'd parse the actual events
    const receipt = details.receipt;

    // Create transaction record
    transaction = new Transaction({
      transactionHash,
      merchantAddress: '0x0', // Extract from events
      payerAddress: '0x0', // Extract from events
      tokenAddress: '0x0', // Extract from events
      grossAmount: '0',
      netAmount: '0',
      feeAmount: '0',
      status: 'completed',
      blockNumber: details.blockNumber,
      timestamp: new Date(),
    });

    await transaction.save();

    // Update merchant stats
    // await updateMerchantStats(transaction.merchantAddress, transaction.netAmount);

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify transaction',
      error: error.message,
    });
  }
};

module.exports = exports;