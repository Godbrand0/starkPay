const Payment = require('../models/Payment');
const Merchant = require('../models/Merchant');
const { verifyTransaction, getTransactionDetails, normalizeAddress } = require('../services/contractService');

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

    // Check if payment has expired
    const now = new Date();
    const isExpired = payment.expiresAt && payment.expiresAt < now;
    const isCompleted = payment.status === 'completed';

    // Auto-expire if time has passed and not already completed
    if (isExpired && payment.status === 'pending') {
      payment.status = 'expired';
      await payment.save();
    }

    const merchant = await Merchant.findOne({ address: normalizeAddress(payment.merchantAddress) });

    // Check if payment is still valid (not expired, not completed)
    const isValid = payment.status === 'pending' && !isExpired;

    res.json({
      success: true,
      merchantAddress: payment.merchantAddress,
      merchantName: merchant?.name || 'Unknown Merchant',
      tokenAddress: payment.tokenAddress,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      expiresAt: payment.expiresAt,
      isValid,
      isExpired: payment.status === 'expired' || isExpired,
      isCompleted,
      // Currency conversion information
      selectedCurrency: payment.selectedCurrency,
      usdAmount: payment.usdAmount,
      ngnAmount: payment.ngnAmount,
      exchangeRate: payment.exchangeRate,
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

// Verify transaction and update payment
exports.verifyTransaction = async (req, res) => {
  try {
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required',
      });
    }

    console.log('========== VERIFYING TRANSACTION ==========');
    console.log('Transaction Hash:', transactionHash);

    // Check if payment already has this transaction
    let payment = await Payment.findOne({ transactionHash });
    if (payment) {
      console.log('Payment already verified with this transaction hash');
      return res.json({
        success: true,
        payment,
        message: 'Payment already verified',
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

    console.log('Number of events:', events.length);

    // Find PaymentProcessed event from the payment processor contract
    const PAYMENT_PROCESSOR_ADDRESS = normalizeAddress(process.env.PAYMENT_PROCESSOR_ADDRESS);

    const paymentEvent = events.find(event => {
      return event.from_address &&
             normalizeAddress(event.from_address) === PAYMENT_PROCESSOR_ADDRESS &&
             event.keys &&
             event.keys.length >= 3;
    });

    let merchantAddress = null;
    let payerAddress = null;
    let tokenAddress = null;
    let grossAmount = '0';
    let netAmount = '0';
    let feeAmount = '0';

    if (paymentEvent) {
      console.log(' Found PaymentProcessed event!');

      merchantAddress = normalizeAddress(paymentEvent.keys[1]);
      payerAddress = normalizeAddress(paymentEvent.keys[2]);
      tokenAddress = normalizeAddress(paymentEvent.data[0]);

      const grossAmountBigInt = BigInt(paymentEvent.data[1]) + (BigInt(paymentEvent.data[2] || 0) << 128n);
      const netAmountBigInt = BigInt(paymentEvent.data[3] || 0) + (BigInt(paymentEvent.data[4] || 0) << 128n);
      const feeAmountBigInt = BigInt(paymentEvent.data[5] || 0) + (BigInt(paymentEvent.data[6] || 0) << 128n);

      grossAmount = grossAmountBigInt.toString();
      netAmount = netAmountBigInt.toString();
      feeAmount = feeAmountBigInt.toString();

      console.log('  Merchant:', merchantAddress);
      console.log('  Gross Amount (Wei):', grossAmount);
      console.log('  Net Amount (Wei):', netAmount);
    } else {
      console.log('�  PaymentProcessed event not found');
      return res.status(400).json({
        success: false,
        message: 'PaymentProcessed event not found in transaction',
      });
    }

    // Convert to decimal for matching
    const grossAmountDecimal = (BigInt(grossAmount) / BigInt(10 ** 18)).toString();

    console.log('🔍 Searching for existing payment:');
    console.log('  Merchant:', merchantAddress);
    console.log('  Token:', tokenAddress);
    console.log('  Amount:', grossAmountDecimal);

    // Find matching payment - include pending, processing, and expired (in case it was auto-expired)
    payment = await Payment.findOne({
      merchantAddress,
      tokenAddress,
      amount: grossAmountDecimal,
      status: { $in: ['pending', 'processing', 'expired'] }
    }).sort({ createdAt: -1 });

    if (!payment) {
      console.log('❌ No exact match, trying variations...');
      // Try amount variations with different statuses
      const variations = [grossAmountDecimal, parseFloat(grossAmountDecimal).toString()];
      for (const amt of variations) {
        console.log('  Trying:', amt);
        payment = await Payment.findOne({
          merchantAddress,
          tokenAddress,
          amount: amt,
          status: { $in: ['pending', 'processing', 'expired'] }
        }).sort({ createdAt: -1 });
        if (payment) {
          console.log('✅ Found with amount:', amt);
          break;
        }
      }
    } else {
      console.log('✅ Found exact match:', payment.paymentId);
    }

    if (!payment) {
      console.log('⚠️  No matching payment found, creating new one');
      payment = new Payment({
        paymentId: require('crypto').randomBytes(16).toString('hex'),
        merchantAddress,
        tokenAddress,
        amount: grossAmountDecimal,
        status: 'completed',
        transactionHash,
        payerAddress,
        grossAmount,
        netAmount,
        feeAmount,
        blockNumber: details.blockNumber,
        completedAt: new Date(),
      });
    } else {
      console.log(' Updating existing payment:', payment.paymentId);
      payment.status = 'completed';
      payment.transactionHash = transactionHash;
      payment.payerAddress = payerAddress;
      payment.grossAmount = grossAmount;
      payment.netAmount = netAmount;
      payment.feeAmount = feeAmount;
      payment.blockNumber = details.blockNumber;
      payment.completedAt = new Date();
      // Don't modify expiresAt - keep original expiration time for reference
      // The 'completed' status itself prevents reuse
    }

    await payment.save();

    // Update merchant stats (merchantAddress is already normalized)
    const merchant = await Merchant.findOne({ address: merchantAddress });
    if (merchant) {
      merchant.totalEarnings = (BigInt(merchant.totalEarnings || 0) + BigInt(netAmount)).toString();
      merchant.transactionCount = (merchant.transactionCount || 0) + 1;
      await merchant.save();
      console.log(' Updated merchant stats');
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify transaction',
      error: error.message,
    });
  }
};

// Get user payment history (payments made by a specific wallet address)
exports.getUserPayments = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    const normalizedUserAddress = normalizeAddress(address);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find all payments made by this user (completed transactions)
    const payments = await Payment.find({
      payerAddress: normalizedUserAddress,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get merchant details for each payment
    const paymentsWithMerchants = await Promise.all(
      payments.map(async (payment) => {
        const merchant = await Merchant.findOne({
          address: normalizeAddress(payment.merchantAddress)
        });

        return {
          paymentId: payment.paymentId,
          merchantAddress: payment.merchantAddress,
          merchantName: merchant?.name || 'Unknown Merchant',
          tokenAddress: payment.tokenAddress,
          amount: payment.amount,
          grossAmount: payment.grossAmount,
          description: payment.description,
          transactionHash: payment.transactionHash,
          completedAt: payment.completedAt,
          selectedCurrency: payment.selectedCurrency,
          usdAmount: payment.usdAmount,
          ngnAmount: payment.ngnAmount,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await Payment.countDocuments({
      payerAddress: normalizedUserAddress,
      status: 'completed',
    });

    res.json({
      success: true,
      payments: paymentsWithMerchants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

module.exports = exports;
