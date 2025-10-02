// whitelist-strk.js - Whitelist STRK token in PaymentProcessor
import { RpcProvider, Account, Contract } from "starknet";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const RPC_URL = "https://starknet-sepolia.public.blastapi.io";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const PAYMENT_PROCESSOR = "0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31";
const STRK_TOKEN = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const PAYMENT_PROCESSOR_ABI = JSON.parse(
  fs.readFileSync("../frontend/lib/abi.json", "utf8")
).abi;

async function main() {
  console.log("=".repeat(60));
  console.log("Whitelist STRK Token for Payments");
  console.log("=".repeat(60));

  const account = new Account(provider, DEPLOYER_ADDRESS, DEPLOYER_PRIVATE_KEY, "1");
  const contract = new Contract(PAYMENT_PROCESSOR_ABI, PAYMENT_PROCESSOR, account);

  console.log("\n📋 Configuration:");
  console.log(`  Payment Processor: ${PAYMENT_PROCESSOR}`);
  console.log(`  STRK Token: ${STRK_TOKEN}`);
  console.log(`  Owner: ${DEPLOYER_ADDRESS}`);

  // Whitelist STRK
  console.log("\n🪙 Whitelisting STRK token...");
  try {
    const tx = await contract.whitelist_token(STRK_TOKEN, true);
    console.log(`  Transaction Hash: ${tx.transaction_hash}`);
    console.log("  ⏳ Waiting for confirmation...");

    await provider.waitForTransaction(tx.transaction_hash, {
      retryInterval: 5000,
      successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
    });

    console.log("  ✅ STRK token whitelisted successfully!");

    // Verify
    const isWhitelisted = await contract.is_token_whitelisted(STRK_TOKEN);
    console.log(`  Verification: ${isWhitelisted ? "✅ Whitelisted" : "❌ Not whitelisted"}`);

  } catch (error) {
    console.error("  ❌ Error:", error.message);
    throw error;
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ STRK WHITELISTING COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Next Steps:");
  console.log("  1. Update backend .env with STRK address");
  console.log("  2. Update frontend .env with STRK address");
  console.log("  3. Update token labels to show 'STRK'");
  console.log("  4. Get STRK from faucet: https://starknet-faucet.vercel.app/");
  console.log("  5. Test STRK payment flow");
  console.log("\n🔗 View on Starkscan:");
  console.log(`  https://sepolia.starkscan.co/contract/${PAYMENT_PROCESSOR}`);
  console.log("\n💡 STRK Token Info:");
  console.log(`  Address: ${STRK_TOKEN}`);
  console.log(`  Decimals: 18`);
  console.log(`  Faucet: https://starknet-faucet.vercel.app/`);
  console.log("\n" + "=".repeat(60));
}

main().catch(err => {
  console.error("\n💥 Error:", err);
  process.exit(1);
});
