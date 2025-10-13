require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Merchant = require('../models/Merchant');

/**
 * Fix payments that have transactionHash (were paid) but are marked as expired
 * This happens when the QR code expired while payment was being processed
 */
async function fixExpiredCompletedPayments() {
  try {
    console.log('🔧 Starting to fix expired payments with transaction hashes...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all "expired" payments that actually have a transaction hash
    const expiredButPaid = await Payment.find({
      status: 'expired',
      transactionHash: { $exists: true, $ne: null }
    });

    console.log(`📊 Found ${expiredButPaid.length} expired payment(s) with transaction hashes\n`);

    if (expiredButPaid.length === 0) {
      console.log('✨ No payments to fix!');
      process.exit(0);
    }

    let fixed = 0;
    let merchantStatsUpdated = new Set();

    for (const payment of expiredButPaid) {
      console.log(`\n🔧 Fixing payment: ${payment.paymentId}`);
      console.log(`   Transaction: ${payment.transactionHash}`);
      console.log(`   Amount: ${payment.amount}`);
      console.log(`   Current status: ${payment.status}`);

      // Update payment status to completed
      payment.status = 'completed';

      // Ensure completedAt is set
      if (!payment.completedAt) {
        payment.completedAt = payment.updatedAt || payment.createdAt;
      }

      await payment.save();
      console.log(`   ✅ Updated to: completed`);

      // Check if merchant stats need updating
      // Only update if the payment has grossAmount/netAmount (was properly processed)
      if (payment.netAmount && payment.merchantAddress) {
        const merchant = await Merchant.findOne({ address: payment.merchantAddress });

        if (merchant && !merchantStatsUpdated.has(payment.merchantAddress)) {
          // Note: This is a one-time fix, so we're being cautious
          // We won't re-add to earnings as it might have been counted already
          console.log(`   ℹ️  Merchant found: ${merchant.name || 'Unknown'}`);
          console.log(`   ℹ️  Merchant stats may need manual verification`);
        }
      }

      fixed++;
    }

    console.log(`\n\n✅ Successfully fixed ${fixed} payment(s)`);
    console.log(`\n💡 Summary:`);
    console.log(`   - Changed status from "expired" to "completed"`);
    console.log(`   - Set completedAt timestamp if missing`);
    console.log(`   - Merchant stats were NOT automatically updated (to prevent double-counting)`);
    console.log(`\n⚠️  If merchant stats are incorrect, they can be recalculated by summing all completed payments`);

  } catch (error) {
    console.error('❌ Error fixing payments:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the fix
fixExpiredCompletedPayments();
