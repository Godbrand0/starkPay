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
    const receipt = details.receipt;
    const events = receipt.events || [];

    console.log('Transaction events:', JSON.stringify(events, null, 2));

    // Find PaymentProcessed event
    const paymentEvent = events.find(event => {
      // Event keys contain the event selector hash
      // PaymentProcessed event has merchant, payer, token, gross_amount, net_amount, fee_amount
      return event.keys && event.keys.length > 0;
    });

    let merchantAddress = '0x0';
    let payerAddress = '0x0';
    let tokenAddress = '0x0';
    let grossAmount = '0';
    let netAmount = '0';
    let feeAmount = '0';

    if (paymentEvent && paymentEvent.data && paymentEvent.data.length >= 6) {
      // Event data structure: [merchant, payer, token, gross_amount_low, gross_amount_high, net_amount_low, net_amount_high, fee_amount_low, fee_amount_high]
      merchantAddress = paymentEvent.data[0];
      payerAddress = paymentEvent.data[1];
      tokenAddress = paymentEvent.data[2];

      // Convert u256 (low, high) to string
      const grossAmountBigInt = BigInt(paymentEvent.data[3]) + (BigInt(paymentEvent.data[4] || 0) << 128n);
      const netAmountBigInt = BigInt(paymentEvent.data[5] || 0) + (BigInt(paymentEvent.data[6] || 0) << 128n);
      const feeAmountBigInt = BigInt(paymentEvent.data[7] || 0) + (BigInt(paymentEvent.data[8] || 0) << 128n);

      grossAmount = grossAmountBigInt.toString();
      netAmount = netAmountBigInt.toString();
      feeAmount = feeAmountBigInt.toString();
    }

    // Create transaction record
    transaction = new Transaction({
      transactionHash,
      merchantAddress: merchantAddress.toLowerCase(),
      payerAddress: payerAddress.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      grossAmount,
      netAmount,
      feeAmount,
      status: 'completed',
      blockNumber: details.blockNumber,
      timestamp: new Date(),
    });

    await transaction.save();

    // Update merchant stats
    if (merchantAddress !== '0x0' && netAmount !== '0') {
      const merchant = await Merchant.findOne({ address: merchantAddress.toLowerCase() });
      if (merchant) {
        merchant.totalEarnings = (BigInt(merchant.totalEarnings || 0) + BigInt(netAmount)).toString();
        merchant.transactionCount = (merchant.transactionCount || 0) + 1;
        await merchant.save();
        console.log('Updated merchant stats:', merchant.address, 'Total earnings:', merchant.totalEarnings);
      }

      // Try to find and update matching Payment record
      // Convert grossAmount from Wei to human-readable (divide by 10^18)
      const grossAmountDecimal = (BigInt(grossAmount) / BigInt(10 ** 18)).toString();

      const matchingPayment = await Payment.findOne({
        merchantAddress: merchantAddress.toLowerCase(),
        tokenAddress: tokenAddress.toLowerCase(),
        amount: grossAmountDecimal,
        status: 'pending'
      }).sort({ createdAt: -1 }); // Get the most recent matching payment

      if (matchingPayment) {
        matchingPayment.status = 'completed';
        await matchingPayment.save();
        console.log('Updated payment status to completed:', matchingPayment.paymentId);
      } else {
        console.log('No matching pending payment found for this transaction');
      }
    }

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