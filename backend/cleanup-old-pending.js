const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('./src/models/Payment');

/**
 * Cleanup script to remove old pending payments that have corresponding completed payments
 * or have expired beyond their expiration time.
 */
async function cleanupOldPendingPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all pending payments
    const pendingPayments = await Payment.find({
      status: { $in: ['pending', 'processing'] }
    }).sort({ createdAt: 1 });

    console.log(`\nFound ${pendingPayments.length} pending/processing payments`);

    let deletedCount = 0;
    let expiredCount = 0;
    let matchedCount = 0;

    for (const pending of pendingPayments) {
      let shouldDelete = false;
      let reason = '';

      // Check if expired beyond expiration time
      if (pending.expiresAt && pending.expiresAt < new Date()) {
        // Check if there's a completed payment with same merchant and amount
        const completed = await Payment.findOne({
          merchantAddress: pending.merchantAddress,
          tokenAddress: pending.tokenAddress,
          amount: pending.amount,
          status: 'completed',
          createdAt: {
            $gte: new Date(pending.createdAt.getTime() - 60000), // 1 min before
            $lte: new Date(pending.createdAt.getTime() + 600000) // 10 mins after
          }
        });

        if (completed) {
          shouldDelete = true;
          reason = `has completed payment ${completed.paymentId}`;
          matchedCount++;
        } else {
          // Just mark as expired, don't delete
          pending.status = 'expired';
          await pending.save();
          expiredCount++;
          console.log(`✓ Expired: ${pending.paymentId} (${pending.amount} STRK)`);
        }
      }

      if (shouldDelete) {
        await Payment.deleteOne({ _id: pending._id });
        deletedCount++;
        console.log(`✓ Deleted: ${pending.paymentId} (${reason})`);
      }
    }

    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Pending payments checked: ${pendingPayments.length}`);
    console.log(`Duplicates deleted: ${matchedCount}`);
    console.log(`Marked as expired: ${expiredCount}`);
    console.log(`Total deleted: ${deletedCount}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOldPendingPayments()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
