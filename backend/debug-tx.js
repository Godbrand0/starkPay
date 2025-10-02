require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { RpcProvider } = require('starknet');

const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/7y4TuJI4vDSz8y3MhPkgu';
const PAYMENT_PROCESSOR_ADDRESS = '0x059a8531a5906f4ba2160518ffe534fe7d7e4d14be2e24dc4c2df9c7c4aadd31';

const provider = new RpcProvider({
  nodeUrl: STARKNET_RPC_URL
});

const normalizeAddress = (address) => {
  if (!address) return '';
  const cleaned = address.replace(/^0x0*/i, '0x');
  return cleaned.toLowerCase();
};

async function debugTransaction() {
  const txHash = '0x0693a1b59ab67b6441eb72bf20750737056a3dee52755564fd51e5180eb3dc09';

  console.log('\n🔍 Fetching transaction:', txHash);

  const receipt = await provider.getTransactionReceipt(txHash);

  console.log('\n📊 Transaction Status:', receipt.execution_status);
  console.log('📦 Block Number:', receipt.block_number);
  console.log('🎯 Number of events:', receipt.events?.length || 0);

  console.log('\n🔎 Looking for PaymentProcessed event...');
  console.log('Expected contract address:', normalizeAddress(PAYMENT_PROCESSOR_ADDRESS));

  receipt.events.forEach((event, index) => {
    const from = normalizeAddress(event.from_address);
    console.log(`\n--- Event ${index} ---`);
    console.log('From:', from);
    console.log('Keys length:', event.keys?.length || 0);
    console.log('Keys:', event.keys);
    console.log('Data length:', event.data?.length || 0);

    if (from === normalizeAddress(PAYMENT_PROCESSOR_ADDRESS)) {
      console.log('✅ MATCH! This is from our payment processor');
    }

    if (event.keys && event.keys.length >= 3) {
      console.log('✅ Has enough keys');
    }
  });
}

debugTransaction().catch(console.error).finally(() => process.exit(0));
