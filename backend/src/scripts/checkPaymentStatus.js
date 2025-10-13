require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

async function checkPaymentStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all payments grouped by status
    const allPayments = await Payment.find({}).select('paymentId status transactionHash amount createdAt completedAt').sort({ createdAt: -1 }).limit(20);

    console.log('📊 Recent 20 Payments:\n');

    const statusCounts = {};

    allPayments.forEach((p, i) => {
      console.log(`${i + 1}. ${p.paymentId.substring(0, 8)}... | Status: ${p.status} | Amount: ${p.amount} | TxHash: ${p.transactionHash ? 'YES' : 'NO'}`);
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    console.log('\n📈 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Find any problematic payments
    const expiredWithTx = await Payment.countDocuments({ status: 'expired', transactionHash: { $exists: true, $ne: null } });
    const pendingWithTx = await Payment.countDocuments({ status: 'pending', transactionHash: { $exists: true, $ne: null } });
    const processingWithTx = await Payment.countDocuments({ status: 'processing', transactionHash: { $exists: true, $ne: null } });

    console.log('\n⚠️  Potentially Problematic Payments:');
    console.log(`   Expired with TxHash: ${expiredWithTx}`);
    console.log(`   Pending with TxHash: ${pendingWithTx}`);
    console.log(`   Processing with TxHash: ${processingWithTx}`);

    await mongoose.disconnect();
    console.log('\n👋 Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPaymentStatus();
