const { RpcProvider, events } = require('starknet');
const Payment = require('../models/Payment');
const Merchant = require('../models/Merchant');

const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/7y4TuJI4vDSz8y3MhPkgu';
const PAYMENT_PROCESSOR_ADDRESS = process.env.PAYMENT_PROCESSOR_ADDRESS || '0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31';

const provider = new RpcProvider({
  nodeUrl: STARKNET_RPC_URL
});

// Normalize Starknet addresses to lowercase without leading zeros
const normalizeAddress = (address) => {
  if (!address) return '';
  const cleaned = address.replace(/^0x0*/i, '0x');
  return cleaned.toLowerCase();
};

// Convert u256 (low, high) to BigInt
const u256ToBigInt = (low, high = '0') => {
  return BigInt(low) + (BigInt(high) << 128n);
};

// Update merchant statistics
const updateMerchantStats = async (merchantAddress, netAmount) => {
  try {
    const normalizedMerchant = normalizeAddress(merchantAddress);

    const merchant = await Merchant.findOne({
      address: normalizedMerchant
    });

    if (merchant) {
      const currentEarnings = BigInt(merchant.totalEarnings || '0');
      const newEarnings = currentEarnings + BigInt(netAmount);

      merchant.totalEarnings = newEarnings.toString();
      merchant.transactionCount = (merchant.transactionCount || 0) + 1;

      await merchant.save();
      console.log(`✅ Updated merchant ${normalizedMerchant} stats: earnings=${newEarnings.toString()}, count=${merchant.transactionCount}`);
    } else {
      console.log(`⚠️  Merchant not found: ${normalizedMerchant}`);
    }
  } catch (error) {
    console.error('❌ Error updating merchant stats:', error);
  }
};

// Verify a single pending payment
const verifyPendingPayment = async (payment) => {
  try {
    console.log(`🔍 Checking payment ${payment.paymentId}...`);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(payment.transactionHash);

    if (receipt.execution_status !== 'SUCCEEDED') {
      console.log(`❌ Transaction failed: ${payment.transactionHash}`);
      payment.status = 'failed';
      await payment.save();
      return;
    }

    // Find PaymentProcessed event
    console.log(`🔎 Looking for event from: ${normalizeAddress(PAYMENT_PROCESSOR_ADDRESS)}`);
    console.log(`📦 Total events: ${receipt.events?.length || 0}`);

    const paymentEvent = receipt.events?.find(event => {
      const from = normalizeAddress(event.from_address);
      const isMatch = from === normalizeAddress(PAYMENT_PROCESSOR_ADDRESS) &&
                      event.keys &&
                      event.keys.length >= 3;
      if (event.keys && event.keys.length >= 3) {
        console.log(`  Event from ${from}, match: ${isMatch}`);
      }
      return isMatch;
    });

    if (!paymentEvent) {
      console.log(`⚠️  No PaymentProcessed event found for ${payment.transactionHash}`);
      return;
    }

    // Parse event data according to Starknet event structure
    // keys[0] = event selector, keys[1] = merchant, keys[2] = payer
    const merchantAddress = normalizeAddress(paymentEvent.keys[1]);
    const payerAddress = normalizeAddress(paymentEvent.keys[2]);
    const tokenAddress = normalizeAddress(paymentEvent.data[0]);

    // Parse u256 amounts
    const grossAmount = u256ToBigInt(paymentEvent.data[1], paymentEvent.data[2]);
    const netAmount = u256ToBigInt(paymentEvent.data[3], paymentEvent.data[4]);
    const feeAmount = u256ToBigInt(paymentEvent.data[5], paymentEvent.data[6]);

    console.log(`📊 Event parsed:`, {
      merchant: merchantAddress,
      payer: payerAddress,
      token: tokenAddress,
      gross: grossAmount.toString(),
      net: netAmount.toString(),
      fee: feeAmount.toString()
    });

    // Update payment with transaction details
    payment.status = 'completed';
    payment.payerAddress = payerAddress;
    payment.grossAmount = grossAmount.toString();
    payment.netAmount = netAmount.toString();
    payment.feeAmount = feeAmount.toString();
    payment.blockNumber = receipt.block_number;
    payment.completedAt = new Date();
    // Expire QR code immediately upon completion to prevent reuse
    payment.expiresAt = new Date();

    await payment.save();
    console.log(`✅ Payment ${payment.paymentId} marked as completed`);

    // Update merchant stats
    await updateMerchantStats(merchantAddress, netAmount.toString());

  } catch (error) {
    console.error(`❌ Error verifying payment ${payment.paymentId}:`, error.message);

    // If transaction not found, it might still be pending
    if (error.message.includes('Transaction hash not found')) {
      console.log(`⏳ Transaction still pending on blockchain: ${payment.transactionHash}`);
    }
  }
};

// Main function to check all pending payments
const checkPendingPayments = async () => {
  try {
    console.log('🔄 Checking pending payments...');

    // Find all pending or processing payments with transaction hashes
    const pendingPayments = await Payment.find({
      status: { $in: ['pending', 'processing'] },
      transactionHash: { $exists: true, $ne: null }
    });

    if (pendingPayments.length === 0) {
      console.log('✨ No pending payments to verify');
      return;
    }

    console.log(`📝 Found ${pendingPayments.length} pending payment(s)`);

    // Verify each payment
    for (const payment of pendingPayments) {
      await verifyPendingPayment(payment);
    }

    console.log('✅ Finished checking pending payments');
  } catch (error) {
    console.error('❌ Error in checkPendingPayments:', error);
  }
};

// Auto-expire QR codes that are past their expiration time
const expireOldQRCodes = async () => {
  try {
    const now = new Date();

    // Find all pending payments that have expired
    const expiredPayments = await Payment.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      {
        $set: { status: 'expired' }
      }
    );

    if (expiredPayments.modifiedCount > 0) {
      console.log(`⏰ Expired ${expiredPayments.modifiedCount} QR code(s)`);
    }
  } catch (error) {
    console.error('❌ Error expiring QR codes:', error);
  }
};

module.exports = { checkPendingPayments, expireOldQRCodes };
