require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Merchant = require('./src/models/Merchant');

const mongoUri = process.env.MONGODB_URI;

async function checkMerchant() {
  await mongoose.connect(mongoUri);

  const merchant = await Merchant.findOne({
    address: '0x15af317f28b99b30e823c8f4911afc799383ec049f936a06058563c955353e'
  });

  if (merchant) {
    console.log('\n💰 Merchant Stats:');
    console.log('Name:', merchant.name);
    console.log('Address:', merchant.address);
    console.log('Total Earnings (Wei):', merchant.totalEarnings);
    console.log('Total Earnings (STRK):', (BigInt(merchant.totalEarnings) / BigInt(10 ** 18)).toString());
    console.log('Transaction Count:', merchant.transactionCount);
  } else {
    console.log('❌ Merchant not found');
  }

  await mongoose.disconnect();
}

checkMerchant().catch(console.error);
