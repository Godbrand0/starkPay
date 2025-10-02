require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

const mongoUri = process.env.MONGODB_URI;

async function updatePayment() {
  await mongoose.connect(mongoUri);

  // Update the payment from 2 hours ago with the transaction hash
  const txHash = '0x0693a1b59ab67b6441eb72bf20750737056a3dee52755564fd51e5180eb3dc09';

  // Find the most recent pending payment
  const payment = await Payment.findOne({
    status: 'pending',
    merchantAddress: '0x15af317f28b99b30e823c8f4911afc799383ec049f936a06058563c955353e',
    amount: '2'
  }).sort({ createdAt: -1 });

  if (payment) {
    payment.transactionHash = txHash;
    payment.status = 'processing';
    await payment.save();
    console.log(`✅ Updated payment ${payment.paymentId} with transaction hash`);
    console.log(`   Transaction: ${txHash}`);
  } else {
    console.log('❌ Payment not found');
  }

  await mongoose.disconnect();
}

updatePayment().catch(console.error);
