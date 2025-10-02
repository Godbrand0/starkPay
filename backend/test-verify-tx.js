require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { RpcProvider } = require('starknet');

// Test fetching a transaction from the blockchain
async function testFetchTransaction() {
  console.log('Testing blockchain transaction fetching...\n');
  console.log('RPC URL:', process.env.STARKNET_RPC_URL);

  const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

  // You'll need to provide a real transaction hash from a payment you made
  const testTxHash = process.argv[2];

  if (!testTxHash) {
    console.error('❌ Please provide a transaction hash as argument');
    console.log('Usage: node test-verify-tx.js 0x<transaction_hash>');
    process.exit(1);
  }

  try {
    console.log('Fetching transaction:', testTxHash);
    console.log('---\n');

    // Fetch transaction receipt
    const receipt = await provider.getTransactionReceipt(testTxHash);
    console.log('✅ Transaction Receipt:');
    console.log('Status:', receipt.execution_status);
    console.log('Block Number:', receipt.block_number);
    console.log('Number of events:', receipt.events?.length || 0);
    console.log('---\n');

    // Parse events
    if (receipt.events && receipt.events.length > 0) {
      console.log('📋 Events:');
      receipt.events.forEach((event, index) => {
        console.log(`\nEvent ${index}:`);
        console.log('  From:', event.from_address);
        console.log('  Keys:', event.keys);
        console.log('  Data length:', event.data?.length || 0);

        if (event.data && event.data.length >= 9) {
          console.log('  Data[0] (merchant):', event.data[0]);
          console.log('  Data[1] (payer):', event.data[1]);
          console.log('  Data[2] (token):', event.data[2]);

          // Parse amounts (u256: low, high)
          const grossAmountLow = BigInt(event.data[3]);
          const grossAmountHigh = BigInt(event.data[4] || 0);
          const grossAmount = grossAmountLow + (grossAmountHigh << 128n);

          const netAmountLow = BigInt(event.data[5] || 0);
          const netAmountHigh = BigInt(event.data[6] || 0);
          const netAmount = netAmountLow + (netAmountHigh << 128n);

          const feeAmountLow = BigInt(event.data[7] || 0);
          const feeAmountHigh = BigInt(event.data[8] || 0);
          const feeAmount = feeAmountLow + (feeAmountHigh << 128n);

          console.log('  Gross Amount (Wei):', grossAmount.toString());
          console.log('  Net Amount (Wei):', netAmount.toString());
          console.log('  Fee Amount (Wei):', feeAmount.toString());

          // Convert to STRK (18 decimals)
          const grossSTRK = Number(grossAmount) / 10**18;
          const netSTRK = Number(netAmount) / 10**18;
          const feeSTRK = Number(feeAmount) / 10**18;

          console.log('  Gross Amount (STRK):', grossSTRK);
          console.log('  Net Amount (STRK):', netSTRK);
          console.log('  Fee Amount (STRK):', feeSTRK);
        }
      });
    } else {
      console.log('⚠️  No events found in transaction');
    }

    console.log('\n---');
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error fetching transaction:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
  }
}

testFetchTransaction();
