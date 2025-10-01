// deploy.js
import fs from "fs";
import { RpcProvider, Account, Contract, CallData, constants } from "starknet";
import dotenv from "dotenv";

dotenv.config();

// Configuration - Using public Blast API endpoint
const RPC_URL = "https://starknet-sepolia.public.blastapi.io";
const provider = new RpcProvider({
  nodeUrl: RPC_URL,
  chainId: constants.StarknetChainId.SN_SEPOLIA
});

// Environment variables
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;           // Your Braavos/Argent address
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;     // Treasury wallet address

// Token addresses for whitelisting (Sepolia testnet)
const USDC_ADDRESS = process.env.USDC_TOKEN_ADDRESS || "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080"; // Sepolia USDC
const USDT_ADDRESS = process.env.USDT_TOKEN_ADDRESS || "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8"; // Sepolia USDT
const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"; // Starknet ETH on Sepolia

async function main() {
  console.log("=".repeat(60));
  console.log("StarkPay QR - Contract Deployment Script");
  console.log("=".repeat(60));

  // Validate environment variables
  if (!DEPLOYER_PRIVATE_KEY || !DEPLOYER_ADDRESS) {
    throw new Error("❌ Missing DEPLOYER_PRIVATE_KEY or DEPLOYER_ADDRESS in .env");
  }
  if (!OWNER_ADDRESS) {
    throw new Error("❌ Missing OWNER_ADDRESS in .env");
  }
  if (!TREASURY_ADDRESS) {
    throw new Error("❌ Missing TREASURY_ADDRESS in .env");
  }

  console.log("\n📋 Deployment Configuration:");
  console.log(`  Deployer Address: ${DEPLOYER_ADDRESS}`);
  console.log(`  Owner Address: ${OWNER_ADDRESS}`);
  console.log(`  Treasury Address: ${TREASURY_ADDRESS}`);
  console.log(`  Network: Starknet Sepolia`);
  console.log(`  RPC URL: ${RPC_URL}`);

  // Create deployer account
  console.log("\n🔑 Initializing deployer account...");
  const deployerAccount = new Account(
    provider,
    DEPLOYER_ADDRESS,
    DEPLOYER_PRIVATE_KEY,
    "1" // Cairo version
  );

  // Load compiled contract (Sierra and CASM)
  console.log("\n📦 Loading compiled contract...");
  const sierraPath = "./target/dev/starkpay_contracts_SimplePaymentProcessor.contract_class.json";
  const casmPath = "./target/dev/starkpay_contracts_SimplePaymentProcessor.compiled_contract_class.json";

  if (!fs.existsSync(sierraPath)) {
    throw new Error(`❌ Sierra file not found at: ${sierraPath}\nRun: scarb build`);
  }
  if (!fs.existsSync(casmPath)) {
    throw new Error(`❌ CASM file not found at: ${casmPath}\nRun: scarb build`);
  }

  const compiledContract = JSON.parse(fs.readFileSync(sierraPath, "utf8"));
  const compiledCasm = JSON.parse(fs.readFileSync(casmPath, "utf8"));
  console.log("✅ Contract artifacts loaded (Sierra + CASM)");

  // Step 1: Declare contract class
  console.log("\n📢 Declaring contract class...");
  console.log("💡 Checking if contract is already declared...");
  try {
    // Use declareIfNot to handle both new and existing declarations
    const declareResponse = await deployerAccount.declareIfNot({
      contract: compiledContract,
      casm: compiledCasm,
    });

    const classHash = declareResponse.class_hash;
    console.log(`✅ Contract declared successfully`);
    console.log(`  Class Hash: ${classHash}`);
    console.log(`  Transaction Hash: ${declareResponse.transaction_hash}`);

    // Wait for declaration to be accepted
    console.log("\n⏳ Waiting for declaration to be accepted...");
    await provider.waitForTransaction(declareResponse.transaction_hash);
    console.log("✅ Declaration confirmed");

    // Step 2: Deploy contract
    console.log("\n🚀 Deploying contract...");

    // Prepare constructor calldata
    const constructorCalldata = CallData.compile({
      owner: OWNER_ADDRESS,
      treasury_address: TREASURY_ADDRESS,
      eth_token_address: ETH_TOKEN_ADDRESS,
    });

    const deployResponse = await deployerAccount.deployContract({
      classHash: classHash,
      constructorCalldata: constructorCalldata,
    });

    const contractAddress = deployResponse.contract_address;
    console.log(`✅ Contract deployed successfully`);
    console.log(`  Contract Address: ${contractAddress}`);
    console.log(`  Transaction Hash: ${deployResponse.transaction_hash}`);

    // Wait for deployment to be accepted
    console.log("\n⏳ Waiting for deployment to be accepted...");
    await provider.waitForTransaction(deployResponse.transaction_hash);
    console.log("✅ Deployment confirmed");

    // Step 3: Initialize contract instance
    console.log("\n🔗 Initializing contract instance...");
    const contract = new Contract(
      compiledContract.abi,
      contractAddress,
      provider
    );

    // Step 4: Verify deployment by reading state
    console.log("\n✅ Verifying contract state...");
    const treasuryOnChain = await contract.get_treasury_address();
    console.log(`  Treasury on-chain: ${treasuryOnChain}`);

    const feeOnChain = await contract.get_platform_fee_basis_points();
    console.log(`  Platform Fee: ${feeOnChain} basis points (${Number(feeOnChain) / 100}%)`);

    // Step 5: Whitelist tokens (USDC and USDT)
    console.log("\n🪙 Whitelisting tokens...");

    // Connect contract with owner account for write operations
    const ownerAccount = new Account(
      provider,
      OWNER_ADDRESS,
      DEPLOYER_PRIVATE_KEY,
      "1" // Cairo version
    );
    const contractWithOwner = new Contract(
      compiledContract.abi,
      contractAddress,
      ownerAccount
    );

    // Whitelist USDC
    console.log("  Whitelisting USDC...");
    const usdcWhitelistTx = await contractWithOwner.whitelist_token(USDC_ADDRESS, true);
    await provider.waitForTransaction(usdcWhitelistTx.transaction_hash);
    console.log(`  ✅ USDC whitelisted (tx: ${usdcWhitelistTx.transaction_hash})`);

    // Whitelist USDT
    console.log("  Whitelisting USDT...");
    const usdtWhitelistTx = await contractWithOwner.whitelist_token(USDT_ADDRESS, true);
    await provider.waitForTransaction(usdtWhitelistTx.transaction_hash);
    console.log(`  ✅ USDT whitelisted (tx: ${usdtWhitelistTx.transaction_hash})`);

    // Verify token whitelisting
    const isUsdcWhitelisted = await contract.is_token_whitelisted(USDC_ADDRESS);
    const isUsdtWhitelisted = await contract.is_token_whitelisted(USDT_ADDRESS);
    console.log(`  USDC Whitelisted: ${isUsdcWhitelisted}`);
    console.log(`  USDT Whitelisted: ${isUsdtWhitelisted}`);

    // Step 7: Set token prices for buy feature
    console.log("\n💰 Setting token prices...");
    const tokenPrice = "500000000000000"; // 0.0005 ETH per token

    console.log("  Setting USDC price...");
    const usdcPriceTx = await contractWithOwner.set_token_price(USDC_ADDRESS, tokenPrice);
    await provider.waitForTransaction(usdcPriceTx.transaction_hash);
    console.log(`  ✅ USDC price set to 0.0005 ETH (tx: ${usdcPriceTx.transaction_hash})`);

    console.log("  Setting USDT price...");
    const usdtPriceTx = await contractWithOwner.set_token_price(USDT_ADDRESS, tokenPrice);
    await provider.waitForTransaction(usdtPriceTx.transaction_hash);
    console.log(`  ✅ USDT price set to 0.0005 ETH (tx: ${usdtPriceTx.transaction_hash})`);

    // Verify prices
    const usdcPrice = await contract.get_token_price(USDC_ADDRESS);
    const usdtPrice = await contract.get_token_price(USDT_ADDRESS);
    console.log(`  USDC Price: ${usdcPrice} wei`);
    console.log(`  USDT Price: ${usdtPrice} wei`);

    // Step 8: Save deployment info
    console.log("\n💾 Saving deployment info...");
    const deploymentInfo = {
      network: "sepolia",
      contractAddress: contractAddress,
      classHash: classHash,
      ownerAddress: OWNER_ADDRESS,
      treasuryAddress: TREASURY_ADDRESS,
      ethTokenAddress: ETH_TOKEN_ADDRESS,
      platformFeeBasisPoints: Number(feeOnChain),
      whitelistedTokens: {
        USDC: USDC_ADDRESS,
        USDT: USDT_ADDRESS,
      },
      tokenPrices: {
        USDC: "500000000000000",
        USDT: "500000000000000",
      },
      deploymentTimestamp: new Date().toISOString(),
      declareTransactionHash: declareResponse.transaction_hash,
      deployTransactionHash: deployResponse.transaction_hash,
    };

    fs.writeFileSync(
      "./deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("✅ Deployment info saved to deployment-info.json");

    // Update .env file with contract address
    console.log("\n📝 Updating .env file...");
    let envContent = fs.readFileSync(".env", "utf8");

    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\n\n# Deployed Contract\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(".env", envContent);
    console.log("✅ .env file updated with CONTRACT_ADDRESS");

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📝 Contract Details:");
    console.log(`  Contract Address: ${contractAddress}`);
    console.log(`  Class Hash: ${classHash}`);
    console.log(`  Owner: ${OWNER_ADDRESS}`);
    console.log(`  Treasury: ${TREASURY_ADDRESS}`);
    console.log(`  Platform Fee: ${Number(feeOnChain) / 100}%`);
    console.log(`\n🪙 Whitelisted Tokens:`);
    console.log(`  USDC: ${USDC_ADDRESS}`);
    console.log(`  USDT: ${USDT_ADDRESS}`);
    console.log(`\n💰 Token Prices:`);
    console.log(`  USDC: 0.0005 ETH per token`);
    console.log(`  USDT: 0.0005 ETH per token`);
    console.log("\n📋 Next Steps:");
    console.log("  1. Fund contract with tokens: node scripts/mint-tokens.js <CONTRACT_ADDRESS> 10000");
    console.log("  2. Update frontend .env.local with new CONTRACT_ADDRESS");
    console.log("  3. Update backend .env with new PAYMENT_PROCESSOR_ADDRESS");
    console.log("  4. Test token purchase and payment flows");
    console.log(`\n🔗 View on Starkscan:`);
    console.log(`  https://sepolia.starkscan.co/contract/${contractAddress}`);
    console.log("\n" + "=".repeat(60));

  } catch (error) {
    console.error("\n❌ Deployment failed:");

    if (error.message?.includes("Class already declared")) {
      console.error("  Contract class already declared. You can:");
      console.error("  1. Use the existing class hash to deploy");
      console.error("  2. Modify the contract and redeclare");
    } else if (error.message?.includes("Insufficient funds")) {
      console.error("  Deployer account has insufficient funds");
      console.error("  Get testnet ETH from: https://starknet-faucet.vercel.app/");
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n💥 Unexpected error:");
  console.error(err);
  process.exit(1);
});