// whitelist-eth.js - Whitelist ETH token in PaymentProcessor
import { RpcProvider, Account, Contract } from "starknet";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const RPC_URL = "https://starknet-sepolia.public.blastapi.io";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const PAYMENT_PROCESSOR = "0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31";
const ETH_TOKEN = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const PAYMENT_PROCESSOR_ABI = JSON.parse(
  fs.readFileSync("../frontend/lib/abi.json", "utf8")
).abi;

async function main() {
  console.log("=".repeat(60));
  console.log("Whitelist ETH Token for Payments");
  console.log("=".repeat(60));

  const account = new Account(provider, DEPLOYER_ADDRESS, DEPLOYER_PRIVATE_KEY, "1");
  const contract = new Contract(PAYMENT_PROCESSOR_ABI, PAYMENT_PROCESSOR, account);

  console.log("\n📋 Configuration:");
  console.log(`  Payment Processor: ${PAYMENT_PROCESSOR}`);
  console.log(`  ETH Token: ${ETH_TOKEN}`);
  console.log(`  Owner: ${DEPLOYER_ADDRESS}`);

  // Whitelist ETH
  console.log("\n🪙 Whitelisting ETH token...");
  try {
    const tx = await contract.whitelist_token(ETH_TOKEN, true);
    console.log(`  Transaction Hash: ${tx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");

    await provider.waitForTransaction(tx.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    console.log("  ✅ ETH token whitelisted successfully!");

    // Verify
    const isWhitelisted = await contract.is_token_whitelisted(ETH_TOKEN);
    console.log(`  Verification: ${isWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted"}`);

  } catch (error) {
    console.error("  ❌ Error:", error.message);
    throw error;
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ETH WHITELISTING COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("  1. Update backend .env with ETH addresses");
  console.log("  2. Update frontend .env with ETH addresses");
  console.log("  3. Remove BuyTokensModal from frontend");
  console.log("  4. Test ETH payment flow");
  console.log("\n🔗 View on Starkscan:");
  console.log(`  https://sepolia.starkscan.co/contract/${PAYMENT_PROCESSOR}`);
  console.log("\n" + "=".repeat(60));
}

main().catch(err => {
  console.error("\n💥 Error:", err);
  process.exit(1);
});
