require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

const mongoUri = process.env.MONGODB_URI;

const normalizeAddress = (address) => {
  if (!address) return '';
  const cleaned = address.replace(/^0x0*/i, '0x');
  return cleaned.toLowerCase();
};

async function debugPendingPayments() {
  await mongoose.connect(mongoUri);

  const pendingPayments = await Payment.find({
    status: 'pending'
  }).sort({ createdAt: -1 }).limit(3);

  console.log('\n🔍 Pending Payments Debug:\n');

  pendingPayments.forEach((p, i) => {
    console.log(`${i + 1}. Payment ID: ${p.paymentId}`);
    console.log(`   Merchant Address: ${p.merchantAddress}`);
    console.log(`   Merchant Normalized: ${normalizeAddress(p.merchantAddress)}`);
    console.log(`   Token Address: ${p.tokenAddress}`);
    console.log(`   Token Normalized: ${normalizeAddress(p.tokenAddress)}`);
    console.log(`   Amount: "${p.amount}" (type: ${typeof p.amount})`);
    console.log(`   Created: ${p.createdAt}`);
    console.log('');
  });

  await mongoose.disconnect();
}

debugPendingPayments().catch(console.error);
