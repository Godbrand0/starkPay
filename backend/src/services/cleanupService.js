const Payment = require('../models/Payment');

/**
 * Auto-expire pending payments that are past their expiration time
 */
async function autoExpirePendingPayments() {
  try {
    const now = new Date();

    // Find all pending/processing payments that have expired
    const result = await Payment.updateMany(
      {
        status: { $in: ['pending', 'processing'] },
        expiresAt: { $exists: true, $lte: now }
      },
      {
        $set: { status: 'expired' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Cleanup] Auto-expired ${result.modifiedCount} pending payment(s)`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error('[Cleanup] Error auto-expiring payments:', error);
    return 0;
  }
}

/**
 * Delete old expired and failed payments (older than 30 days)
 * to keep the database clean
 */
async function deleteOldPayments() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Payment.deleteMany({
      status: { $in: ['expired', 'failed'] },
      createdAt: { $lte: thirtyDaysAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`[Cleanup] Deleted ${result.deletedCount} old expired/failed payment(s)`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error('[Cleanup] Error deleting old payments:', error);
    return 0;
  }
}

/**
 * Start the automatic cleanup service
 * Runs every 5 minutes to expire old pending payments
 * and daily to delete very old expired payments
 */
function startCleanupService() {
  console.log('[Cleanup] Starting automatic payment cleanup service');

  // Run immediately on startup
  autoExpirePendingPayments();

  // Auto-expire pending payments every 5 minutes
  setInterval(autoExpirePendingPayments, 5 * 60 * 1000);

  // Delete old expired/failed payments daily
  setInterval(deleteOldPayments, 24 * 60 * 60 * 1000);

  console.log('[Cleanup] Cleanup service started successfully');
}

module.exports = {
  autoExpirePendingPayments,
  deleteOldPayments,
  startCleanupService
};
