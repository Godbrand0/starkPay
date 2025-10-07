require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

async function cleanupDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all payments with transaction hashes
    const paymentsWithTx = await Payment.find({
      transactionHash: { $exists: true, $ne: null }
    }).sort({ createdAt: 1 });

    console.log(`Found ${paymentsWithTx.length} payments with transaction hashes`);

    // Group by transaction hash
    const groupedByTxHash = {};
    for (const payment of paymentsWithTx) {
      if (!groupedByTxHash[payment.transactionHash]) {
        groupedByTxHash[payment.transactionHash] = [];
      }
      groupedByTxHash[payment.transactionHash].push(payment);
    }

    // Find duplicates
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    for (const [txHash, payments] of Object.entries(groupedByTxHash)) {
      if (payments.length > 1) {
        duplicatesFound++;
        console.log(`\n🔍 Found ${payments.length} payments with same tx: ${txHash}`);

        // Keep the completed one, or the first one if multiple completed
        const completedPayment = payments.find(p => p.status === 'completed') || payments[0];
        console.log(`  ✅ Keeping: ${completedPayment.paymentId} (status: ${completedPayment.status})`);

        // Delete the others
        for (const payment of payments) {
          if (payment.paymentId !== completedPayment.paymentId) {
            console.log(`  ❌ Deleting: ${payment.paymentId} (status: ${payment.status})`);
            await Payment.deleteOne({ paymentId: payment.paymentId });
            duplicatesRemoved++;
          }
        }
      }
    }

    // Also find and remove pending/expired payments that have no transaction but might be duplicates
    // of completed payments (same merchant, token, amount)
    console.log('\n\n🔍 Looking for orphaned pending/expired payments...');

    const completedPayments = await Payment.find({ status: 'completed' });
    let orphansRemoved = 0;

    for (const completed of completedPayments) {
      const orphans = await Payment.find({
        merchantAddress: completed.merchantAddress,
        tokenAddress: completed.tokenAddress,
        amount: completed.amount,
        status: { $in: ['pending', 'expired'] },
        paymentId: { $ne: completed.paymentId }
      });

      if (orphans.length > 0) {
        console.log(`Found ${orphans.length} orphans for completed payment ${completed.paymentId}`);
        for (const orphan of orphans) {
          console.log(`  ❌ Deleting orphan: ${orphan.paymentId} (status: ${orphan.status})`);
          await Payment.deleteOne({ paymentId: orphan.paymentId });
          orphansRemoved++;
        }
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Duplicate groups found: ${duplicatesFound}`);
    console.log(`   Duplicates removed: ${duplicatesRemoved}`);
    console.log(`   Orphaned payments removed: ${orphansRemoved}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    process.exit(1);
  }
}

cleanupDuplicates();
