// deploy-tokens.js
// Deploy Mock USDC and USDT tokens
import fs from "fs";
import { RpcProvider, Account, CallData, constants } from "starknet";
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

async function main() {
  console.log("=".repeat(60));
  console.log("Deploy Mock Tokens (USDC & USDT)");
  console.log("=".repeat(60));

  if (!DEPLOYER_PRIVATE_KEY || !DEPLOYER_ADDRESS || !OWNER_ADDRESS) {
    throw new Error("❌ Missing environment variables");
  }

  console.log("\n📋 Configuration:");
  console.log(`  Deployer: ${DEPLOYER_ADDRESS}`);
  console.log(`  Owner: ${OWNER_ADDRESS}`);

  const deployerAccount = new Account(
    provider,
    DEPLOYER_ADDRESS,
    DEPLOYER_PRIVATE_KEY,
    "1"
  );

  // Deploy USDC
  console.log("\n🪙 Deploying Mock USDC...");
  const usdcSierra = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDC.contract_class.json", "utf8"));
  const usdcCasm = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDC.compiled_contract_class.json", "utf8"));

  const usdcDeclare = await deployerAccount.declareIfNot({
    contract: usdcSierra,
    casm: usdcCasm,
  });

  console.log(`  Class Hash: ${usdcDeclare.class_hash}`);
  await provider.waitForTransaction(usdcDeclare.transaction_hash);

  const usdcCalldata = CallData.compile({ owner: OWNER_ADDRESS });
  const usdcDeploy = await deployerAccount.deployContract({
    classHash: usdcDeclare.class_hash,
    constructorCalldata: usdcCalldata,
  });

  console.log(`  ✅ USDC deployed: ${usdcDeploy.contract_address}`);
  await provider.waitForTransaction(usdcDeploy.transaction_hash);

  // Deploy USDT
  console.log("\n🪙 Deploying Mock USDT...");
  const usdtSierra = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDT.contract_class.json", "utf8"));
  const usdtCasm = JSON.parse(fs.readFileSync("./target/dev/starkpay_contracts_MockUSDT.compiled_contract_class.json", "utf8"));

  const usdtDeclare = await deployerAccount.declareIfNot({
    contract: usdtSierra,
    casm: usdtCasm,
  });

  console.log(`  Class Hash: ${usdtDeclare.class_hash}`);
  await provider.waitForTransaction(usdtDeclare.transaction_hash);

  const usdtCalldata = CallData.compile({ owner: OWNER_ADDRESS });
  const usdtDeploy = await deployerAccount.deployContract({
    classHash: usdtDeclare.class_hash,
    constructorCalldata: usdtCalldata,
  });

  console.log(`  ✅ USDT deployed: ${usdtDeploy.contract_address}`);
  await provider.waitForTransaction(usdtDeploy.transaction_hash);

  // Save addresses
  const tokenInfo = {
    USDC: usdcDeploy.contract_address,
    USDT: usdtDeploy.contract_address,
  };

  fs.writeFileSync("./token-addresses.json", JSON.stringify(tokenInfo, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("✅ TOKENS DEPLOYED!");
  console.log("=".repeat(60));
  console.log(`\nUSDC: ${usdcDeploy.contract_address}`);
  console.log(`USDT: ${usdtDeploy.contract_address}`);
  console.log("\n📋 Next Steps:");
  console.log("  1. Update .env files with new token addresses");
  console.log("  2. Whitelist tokens in PaymentProcessor");
  console.log("  3. Set token prices");
  console.log("  4. Mint tokens to contract and deployer");
  console.log("\n" + "=".repeat(60));
}

main().catch(err => {
  console.error("\n❌ Error:", err);
  process.exit(1);
});
