// fund-contract.js
// Script to mint tokens to both deployer and contract addresses
import fs from "fs";
import { RpcProvider, Account, Contract, cairo } from "starknet";
import dotenv from "dotenv";

dotenv.config();

// Configuration
const RPC_URL = "https://starknet-sepolia.public.blastapi.io";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

// Environment variables
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;

// Load deployment info
const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
const USDC_ADDRESS = deploymentInfo.whitelistedTokens.USDC;
const USDT_ADDRESS = deploymentInfo.whitelistedTokens.USDT;

// Mock token ABI (mint and balance_of functions)
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
  console.log("=".repeat(60));
  console.log("StarkPay - Fund Contract with Tokens");
  console.log("=".repeat(60));

  // Validate environment
  if (!DEPLOYER_PRIVATE_KEY || !DEPLOYER_ADDRESS) {
    throw new Error("❌ Missing DEPLOYER_PRIVATE_KEY or DEPLOYER_ADDRESS in .env");
  }

  console.log("\n📋 Configuration:");
  console.log(`  Deployer Address: ${DEPLOYER_ADDRESS}`);
  console.log(`  Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`  USDC Token: ${USDC_ADDRESS}`);
  console.log(`  USDT Token: ${USDT_ADDRESS}`);
  console.log(`  RPC URL: ${RPC_URL}`);

  // Create deployer account (must be owner to mint)
  console.log("\n🔑 Initializing deployer account...");
  const deployerAccount = new Account(
    provider,
    DEPLOYER_ADDRESS,
    DEPLOYER_PRIVATE_KEY,
    "1"
  );
  console.log("✅ Account initialized");

  // Amounts to mint (10,000 tokens with 6 decimals)
  const deployerAmount = cairo.uint256(10000n * 1000000n); // 10,000 tokens for deployer
  const contractAmount = cairo.uint256(10000n * 1000000n); // 10,000 tokens for contract

  console.log("\n💰 Minting Amounts:");
  console.log(`  Deployer: 10,000 tokens`);
  console.log(`  Contract: 10,000 tokens`);

  // ========================================
  // USDC Minting
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("🪙 Minting USDC Tokens");
  console.log("=".repeat(60));

  const usdcContract = new Contract(MOCK_TOKEN_ABI, USDC_ADDRESS, deployerAccount);

  // Mint to deployer
  console.log("\n1️⃣  Minting USDC to deployer...");
  try {
    const mintToDeployerTx = await usdcContract.mint(DEPLOYER_ADDRESS, deployerAmount);
    console.log(`  Transaction Hash: ${mintToDeployerTx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");
    await provider.waitForTransaction(mintToDeployerTx.transaction_hash);
    console.log("  ✅ USDC minted to deployer");

    // Check balance
    const deployerBalance = await usdcContract.balance_of(DEPLOYER_ADDRESS);
    console.log(`  Balance: ${BigInt(deployerBalance.toString()) / 1000000n} USDC`);
  } catch (error) {
    console.error("  ❌ Failed to mint USDC to deployer:", error.message);
  }

  // Mint to contract
  console.log("\n2️⃣  Minting USDC to contract...");
  try {
    const mintToContractTx = await usdcContract.mint(CONTRACT_ADDRESS, contractAmount);
    console.log(`  Transaction Hash: ${mintToContractTx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");
    await provider.waitForTransaction(mintToContractTx.transaction_hash);
    console.log("  ✅ USDC minted to contract");

    // Check balance
    const contractBalance = await usdcContract.balance_of(CONTRACT_ADDRESS);
    console.log(`  Balance: ${BigInt(contractBalance.toString()) / 1000000n} USDC`);
  } catch (error) {
    console.error("  ❌ Failed to mint USDC to contract:", error.message);
  }

  // ========================================
  // USDT Minting
  // ========================================
  console.log("\n" + "=".repeat(60));
  console.log("🪙 Minting USDT Tokens");
  console.log("=".repeat(60));

  const usdtContract = new Contract(MOCK_TOKEN_ABI, USDT_ADDRESS, deployerAccount);

  // Mint to deployer
  console.log("\n1️⃣  Minting USDT to deployer...");
  try {
    const mintToDeployerTx = await usdtContract.mint(DEPLOYER_ADDRESS, deployerAmount);
    console.log(`  Transaction Hash: ${mintToDeployerTx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");
    await provider.waitForTransaction(mintToDeployerTx.transaction_hash);
    console.log("  ✅ USDT minted to deployer");

    // Check balance
    const deployerBalance = await usdtContract.balance_of(DEPLOYER_ADDRESS);
    console.log(`  Balance: ${BigInt(deployerBalance.toString()) / 1000000n} USDT`);
  } catch (error) {
    console.error("  ❌ Failed to mint USDT to deployer:", error.message);
  }

  // Mint to contract
  console.log("\n2️⃣  Minting USDT to contract...");
  try {
    const mintToContractTx = await usdtContract.mint(CONTRACT_ADDRESS, contractAmount);
    console.log(`  Transaction Hash: ${mintToContractTx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");
    await provider.waitForTransaction(mintToContractTx.transaction_hash);
    console.log("  ✅ USDT minted to contract");

    // Check balance
    const contractBalance = await usdtContract.balance_of(CONTRACT_ADDRESS);
    console.log(`  Balance: ${BigInt(contractBalance.toString()) / 1000000n} USDT`);
  } catch (error) {
    console.error("  ❌ Failed to mint USDT to contract:", error.message);
  }

  // Final Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MINTING COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n✅ Tokens minted successfully:");
  console.log(`  Deployer (${DEPLOYER_ADDRESS}):`);
  console.log(`    - 10,000 USDC`);
  console.log(`    - 10,000 USDT`);
  console.log(`  Contract (${CONTRACT_ADDRESS}):`);
  console.log(`    - 10,000 USDC (available for purchase)`);
  console.log(`    - 10,000 USDT (available for purchase)`);

  console.log("\n📋 Next Steps:");
  console.log("  1. Deploy frontend to Vercel: git push");
  console.log("  2. Update Vercel env vars with new contract address");
  console.log("  3. Update Render backend env vars");
  console.log("  4. Test token purchase flow on live site");

  console.log("\n🔗 View Contract on Starkscan:");
  console.log(`  https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESS}`);
  console.log("\n" + "=".repeat(60));
}

mintTokens().catch((err) => {
  console.error("\n💥 Unexpected error:");
  console.error(err);
  process.exit(1);
});
