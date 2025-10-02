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

    console.log('Number of events:', events.length);
    console.log('All events:', JSON.stringify(events, null, 2));

    // Find PaymentProcessed event from the payment processor contract
    const PAYMENT_PROCESSOR_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS.toLowerCase();

    const paymentEvent = events.find(event => {
      // Check if event is from the payment processor contract
      return event.from_address &&
             event.from_address.toLowerCase() === PAYMENT_PROCESSOR_ADDRESS &&
             event.keys &&
             event.keys.length >= 3; // PaymentProcessed has event selector + 2 keys (merchant, payer)
    });

    let merchantAddress = '0x0';
    let payerAddress = '0x0';
    let tokenAddress = '0x0';
    let grossAmount = '0';
    let netAmount = '0';
    let feeAmount = '0';

    if (paymentEvent) {
      console.log('Found PaymentProcessed event!');
      console.log('Event keys:', paymentEvent.keys);
      console.log('Event data:', paymentEvent.data);

      // Event structure:
      // keys[0] = event selector (hash of "PaymentProcessed")
      // keys[1] = merchant (marked with #[key])
      // keys[2] = payer (marked with #[key])
      // data[0] = token
      // data[1] = gross_amount.low
      // data[2] = gross_amount.high
      // data[3] = net_amount.low
      // data[4] = net_amount.high
      // data[5] = fee.low
      // data[6] = fee.high
      // data[7] = timestamp

      merchantAddress = paymentEvent.keys[1];
      payerAddress = paymentEvent.keys[2];
      tokenAddress = paymentEvent.data[0];

      // Convert u256 (low, high) to string
      const grossAmountBigInt = BigInt(paymentEvent.data[1]) + (BigInt(paymentEvent.data[2] || 0) << 128n);
      const netAmountBigInt = BigInt(paymentEvent.data[3] || 0) + (BigInt(paymentEvent.data[4] || 0) << 128n);
      const feeAmountBigInt = BigInt(paymentEvent.data[5] || 0) + (BigInt(paymentEvent.data[6] || 0) << 128n);

      grossAmount = grossAmountBigInt.toString();
      netAmount = netAmountBigInt.toString();
      feeAmount = feeAmountBigInt.toString();

      console.log('Parsed payment data:');
      console.log('  Merchant:', merchantAddress);
      console.log('  Payer:', payerAddress);
      console.log('  Token:', tokenAddress);
      console.log('  Gross Amount:', grossAmount);
      console.log('  Net Amount:', netAmount);
      console.log('  Fee:', feeAmount);
    } else {
      console.log('⚠️  PaymentProcessed event not found in transaction');
      console.log('Available events:', events.map(e => ({ from: e.from_address, keys: e.keys?.length })));
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