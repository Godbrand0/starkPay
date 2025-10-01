#!/usr/bin/env node

/**
 * Script to mint mock tokens (USDC/USDT) for testing
 * Usage: node scripts/mint-tokens.js <recipient-address> <amount>
 */

const { RpcProvider, Contract, Account, cairo } = require('starknet');
require('dotenv').config({ path: require('path').join(__dirname, '../contracts/.env') });

const USDC_ADDRESS = '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080';
const USDT_ADDRESS = '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8';
const OWNER_ADDRESS = '0x0599afc4179d665be3857415c7ded0d2b4a1f32e4f4e8a142100a9bd61f03aa6';

// ERC20 ABI for mint function
const MOCK_TOKEN_ABI = [
  {
    "name": "mint",
    "type": "function",
    "inputs": [
      { "name": "to", "type": "core::starknet::contract_address::ContractAddress" },
      { "name": "amount", "type": "core::integer::u256" }
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "name": "balance_of",
    "type": "function",
    "inputs": [
      { "name": "account", "type": "core::starknet::contract_address::ContractAddress" }
    ],
    "outputs": [
      { "type": "core::integer::u256" }
    ],
    "state_mutability": "view"
  }
];

async function mintTokens() {
  // Get command line arguments
  const recipientAddress = process.argv[2];
  const amount = process.argv[3] || '10000'; // Default 10,000 tokens

  if (!recipientAddress) {
    console.error('❌ Usage: node scripts/mint-tokens.js <recipient-address> <amount>');
    console.error('   Example: node scripts/mint-tokens.js 0x123...abc 10000');
    process.exit(1);
  }

  // Check for private key
  if (!process.env.STARKNET_PRIVATE_KEY) {
    console.error('❌ STARKNET_PRIVATE_KEY not found in contracts/.env');
    console.error('   This should be the private key of the owner address who deployed the contracts');
    process.exit(1);
  }

  console.log('\n🚀 Minting Mock Tokens');
  console.log('======================');
  console.log(`Recipient: ${recipientAddress}`);
  console.log(`Amount: ${amount} tokens (for both USDC and USDT)`);
  console.log(`Owner: ${OWNER_ADDRESS}\n`);

  try {
    // Initialize provider
    const provider = new RpcProvider({
      nodeUrl: 'https://starknet-sepolia.public.blastapi.io'
    });

    // Initialize owner account
    const ownerAccount = new Account(
      provider,
      OWNER_ADDRESS,
      process.env.STARKNET_PRIVATE_KEY
    );

    // Convert amount to u256 (with 6 decimals)
    const amountWithDecimals = cairo.uint256(BigInt(amount) * BigInt(1000000));

    // Mint USDC
    console.log('💰 Minting USDC...');
    const usdcContract = new Contract(MOCK_TOKEN_ABI, USDC_ADDRESS, ownerAccount);
    const usdcMintTx = await usdcContract.mint(recipientAddress, amountWithDecimals);
    await provider.waitForTransaction(usdcMintTx.transaction_hash);
    console.log(`✅ USDC minted! Tx: ${usdcMintTx.transaction_hash}`);

    // Check balance
    const usdcBalance = await usdcContract.balance_of(recipientAddress);
    console.log(`   Balance: ${BigInt(usdcBalance) / BigInt(1000000)} USDC\n`);

    // Mint USDT
    console.log('💰 Minting USDT...');
    const usdtContract = new Contract(MOCK_TOKEN_ABI, USDT_ADDRESS, ownerAccount);
    const usdtMintTx = await usdtContract.mint(recipientAddress, amountWithDecimals);
    await provider.waitForTransaction(usdtMintTx.transaction_hash);
    console.log(`✅ USDT minted! Tx: ${usdtMintTx.transaction_hash}`);

    // Check balance
    const usdtBalance = await usdtContract.balance_of(recipientAddress);
    console.log(`   Balance: ${BigInt(usdtBalance) / BigInt(1000000)} USDT\n`);

    console.log('🎉 All tokens minted successfully!');
    console.log('\n💡 You can now use these tokens for testing payments');
    console.log(`   View on Starkscan: https://sepolia.starkscan.co/contract/${USDC_ADDRESS}`);

  } catch (error) {
    console.error('\n❌ Error minting tokens:', error.message);
    if (error.message.includes('Only owner can mint')) {
      console.error('\n⚠️  Make sure you are using the owner\'s private key in contracts/.env');
      console.error(`   Owner address: ${OWNER_ADDRESS}`);
    }
    process.exit(1);
  }
}

mintTokens();
