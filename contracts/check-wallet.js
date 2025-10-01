// check-wallet.js - Verify wallet deployment status
import { RpcProvider } from "starknet";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

async function checkWallet() {
  console.log("=".repeat(60));
  console.log("Wallet Deployment Check");
  console.log("=".repeat(60));

  const walletAddress = process.env.DEPLOYER_ADDRESS;

  if (!walletAddress) {
    console.error(" DEPLOYER_ADDRESS not found in .env file");
    process.exit(1);
  }

  console.log(`\n🔍 Checking wallet: ${walletAddress}`);
  console.log(`📡 Network: Starknet Sepolia`);

  try {
    // Try to get nonce
    const nonce = await provider.getNonceForAddress(walletAddress);

    console.log("\n✅ Wallet is deployed on-chain!");
    console.log(`  Nonce: ${nonce}`);

    // Get wallet balance
    try {
      const balance = await provider.getBalance(walletAddress);
      const ethBalance = Number(balance) / 10**18;

      console.log(`  ETH Balance: ${ethBalance.toFixed(6)} ETH`);

      if (ethBalance < 0.001) {
        console.warn("\n⚠️  Warning: Low ETH balance. You may need more for deployment.");
        console.log("   Get testnet ETH from: https://faucet.goerli.starknet.io/");
      } else {
        console.log("\n✅ Sufficient balance for deployment");
      }
    } catch (balanceError) {
      console.log(`  Balance check skipped: ${balanceError.message}`);
    }

    console.log("\n✅ Ready to deploy!");
    console.log("   Run: node deploy.js");

  } catch (error) {
    console.log("\n❌ Wallet NOT deployed on-chain");
    console.log("\n📋 To deploy your wallet:");
    console.log("  1. Open your Argent X or Braavos wallet extension");
    console.log("  2. Make any transaction (e.g., send 0.001 ETH to yourself)");
    console.log("  3. Wait for transaction to confirm");
    console.log("  4. Run this check again");

    console.log("\n💡 Alternative:");
    console.log("  - Use a wallet that's already been deployed");
    console.log("  - Check you're using the correct address");
    console.log("  - Verify you're on Sepolia testnet");

    console.log(`\n🔗 Check on Starkscan:`);
    console.log(`  https://sepolia.starkscan.co/contract/${walletAddress}`);
  }

  console.log("\n" + "=".repeat(60));
}

checkWallet().catch(console.error);