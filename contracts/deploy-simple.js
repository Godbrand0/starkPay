// deploy-simple.js - Simplified deployment with better error handling
import fs from "fs";
import { RpcProvider, Account, Contract, CallData, constants, hash } from "starknet";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = "https://starknet-sepolia.public.blastapi.io";
const provider = new RpcProvider({
  nodeUrl: RPC_URL,
  chainId: constants.StarknetChainId.SN_SEPOLIA
});

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

async function main() {
  console.log("🚀 Starting Simple Deployment\n");

  const deployerAccount = new Account(provider, DEPLOYER_ADDRESS, DEPLOYER_PRIVATE_KEY, "1");

  // Check if already deployed
  const existingContract = "0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31";

  console.log("📋 Contract already deployed at:", existingContract);
  console.log("\n🎯 Skipping to token deployment...\n");

  // Deploy Mock USDC
  console.log("1️⃣  Deploying Mock USDC...");
  const usdcSierra = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDC.contract_class.json", "utf8"));
  const usdcCasm = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDC.compiled_contract_class.json", "utf8"));

  try {
    const usdcDeclare = await deployerAccount.declare({
      contract: usdcSierra,
      casm: usdcCasm,
    });

    console.log(`  Declare TX: ${usdcDeclare.transaction_hash}`);
    console.log(`  Waiting for confirmation...`);

    await provider.waitForTransaction(usdcDeclare.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    const usdcCalldata = CallData.compile({ owner: OWNER_ADDRESS });
    const usdcDeploy = await deployerAccount.deployContract({
      classHash: usdcDeclare.class_hash,
      constructorCalldata: usdcCalldata,
    });

    console.log(`  Deploy TX: ${usdcDeploy.transaction_hash}`);
    await provider.waitForTransaction(usdcDeploy.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    console.log(`  ✅ USDC: ${usdcDeploy.contract_address}\n`);

    // Deploy Mock USDT
    console.log("2️⃣  Deploying Mock USDT...");
    const usdtSierra = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDT.contract_class.json", "utf8"));
    const usdtCasm = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDT.compiled_contract_class.json", "utf8"));

    const usdtDeclare = await deployerAccount.declare({
      contract: usdtSierra,
      casm: usdtCasm,
    });

    console.log(`  Declare TX: ${usdtDeclare.transaction_hash}`);
    console.log(`  Waiting for confirmation...`);

    await provider.waitForTransaction(usdtDeclare.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    const usdtCalldata = CallData.compile({ owner: OWNER_ADDRESS });
    const usdtDeploy = await deployerAccount.deployContract({
      classHash: usdtDeclare.class_hash,
      constructorCalldata: usdtCalldata,
    });

    console.log(`  Deploy TX: ${usdtDeploy.transaction_hash}`);
    await provider.waitForTransaction(usdtDeploy.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    console.log(`  ✅ USDT: ${usdtDeploy.contract_address}\n`);

    // Save addresses
    const tokenInfo = {
      USDC: usdcDeploy.contract_address,
      USDT: usdtDeploy.contract_address,
      paymentProcessor: existingContract,
    };

    fs.writeFileSync("./token-addresses.json", JSON.stringify(tokenInfo, null, 2));

    console.log("✅ DEPLOYMENT COMPLETE!\n");
    console.log("📝 Token Addresses:");
    console.log(`  USDC: ${usdcDeploy.contract_address}`);
    console.log(`  USDT: ${usdtDeploy.contract_address}`);
    console.log(`  PaymentProcessor: ${existingContract}`);

    console.log("\n📋 Next Steps:");
    console.log("  1. node whitelist-and-price.js  (whitelist tokens & set prices)");
    console.log("  2. node fund-contract.js        (mint tokens to contract)");

  } catch (error) {
    if (error.message?.includes("Class already declared")) {
      console.log("⚠️  Tokens may already be deployed. Check token-addresses.json");
    } else {
      console.error("❌ Error:", error.message);
      throw error;
    }
  }
}

main().catch(err => {
  console.error("\n💥 Deployment failed:", err);
  process.exit(1);
});
