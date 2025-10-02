require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

const mongoUri = process.env.MONGODB_URI;

async function checkPayments() {
  await mongoose.connect(mongoUri);

  const allPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(5);

  console.log('\n📋 Last 5 payments:');
  allPayments.forEach((p, i) => {
    console.log(`\n${i + 1}. Payment ID: ${p.paymentId}`);
    console.log(`   Status: ${p.status}`);
    console.log(`   Transaction Hash: ${p.transactionHash || 'NONE'}`);
    console.log(`   Merchant: ${p.merchantAddress}`);
    console.log(`   Amount: ${p.amount}`);
    console.log(`   Created: ${p.createdAt}`);
  });

  await mongoose.disconnect();
}

checkPayments().catch(console.error);
