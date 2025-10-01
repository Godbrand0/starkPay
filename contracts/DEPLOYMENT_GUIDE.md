# StarkPay Contract Deployment Guide

## Prerequisites

### 1. Wallet Setup
You need a deployed Starknet wallet (Argent X or Braavos) with:
- Some ETH for gas fees (≈0.01 ETH on Sepolia testnet)
- Wallet must be deployed on-chain

### 2. Get Your Wallet Details

#### Using Argent X or Braavos:
1. Open your wallet extension
2. Click on your account
3. Copy your wallet address (starts with 0x...)
4. Export your private key (Settings → Export Private Key)
   - ⚠️ **NEVER share this with anyone!**

### 3. Verify Wallet is Deployed

Check if your wallet exists on Sepolia:
```bash
# Replace with your wallet address
curl -X POST https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "starknet_getNonce",
    "params": {
      "contract_address": "YOUR_WALLET_ADDRESS",
      "block_id": "pending"
    },
    "id": 1
  }'
```

If you get `"Contract not found"`, you need to deploy your wallet first by:
- Making a transaction from your wallet in the extension
- Or using the wallet's deploy function

---

## Environment Setup

### Step 1: Update `.env` file

```bash
# Your deployed wallet address (from Argent X / Braavos)
DEPLOYER_PRIVATE_KEY=0x...your_private_key_here
DEPLOYER_ADDRESS=0x...your_wallet_address_here

# Same as deployer if you want to be the owner
OWNER_ADDRESS=0x...your_wallet_address_here

# Treasury can be same as owner or separate
TREASURY_ADDRESS=0x...treasury_wallet_address_here

# Token addresses (Sepolia testnet - these are provided)
USDC_TOKEN_ADDRESS=0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080
USDT_TOKEN_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
```

### Step 2: Build Contracts

```bash
# Install dependencies (if not already done)
npm install

# Compile contracts
scarb build
```

This generates:
- `target/dev/*contract_class.json` (Sierra)
- `target/dev/*compiled_contract_class.json` (CASM)

---

## Deployment Options

### Option 1: Deploy SimplePaymentProcessor (Recommended)

This is the main payment processor contract.

```bash
node deploy.js
```

**What it does:**
1. Declares the contract class on-chain
2. Deploys the contract instance
3. Sets platform fee to 2% (200 basis points)
4. Whitelists USDC and USDT tokens
5. Saves deployment info to `deployment-info.json`
6. Updates `.env` with CONTRACT_ADDRESS

### Option 2: Deploy Mock Tokens (For Testing)

If you want to deploy your own test tokens:

```bash
node deploy-tokens.js
```

This deploys:
- Mock USDC (mUSDC)
- Mock USDT (mUSDT)

And mints 1,000,000 tokens to the deployer.

---

## Post-Deployment Steps

### 1. Verify Deployment

Check your contract on Starkscan:
```
https://sepolia.starkscan.co/contract/YOUR_CONTRACT_ADDRESS
```

### 2. Update Environment Files

**Backend** (`backend/.env`):
```env
PAYMENT_PROCESSOR_ADDRESS=0x...deployed_contract_address
MOCK_USDC_ADDRESS=0x...usdc_address
MOCK_USDT_ADDRESS=0x...usdt_address
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...deployed_contract_address
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...usdc_address
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...usdt_address
```

### 3. Test the Contract

```bash
# Test merchant registration
node test-contract.js
```

---

## Troubleshooting

### Error: "Contract not found"
**Problem:** Deployer address not deployed on-chain

**Solutions:**
1. Make a transaction from your wallet to deploy it
2. Check you're using the correct network (Sepolia)
3. Verify the address format is correct

### Error: "Insufficient funds"
**Problem:** Not enough ETH for gas fees

**Solution:** Get testnet ETH from:
- Starknet Faucet: https://faucet.goerli.starknet.io/
- Blastapi Faucet: https://blastapi.io/faucets/starknet-sepolia-eth

### Error: "Class already declared"
**Problem:** Contract class already exists on-chain

**Options:**
1. Skip declaration and deploy using existing class hash
2. Modify contract and redeclare

### Error: "Invalid argument"
**Problem:** Constructor parameters incorrect

**Solution:** Check that:
- Owner address is valid
- Treasury address is valid
- Platform fee is reasonable (0-10000 basis points)

---

## Deployment Checklist

- [ ] Wallet deployed on Sepolia testnet
- [ ] Private key exported securely
- [ ] `.env` file configured
- [ ] Contracts compiled (`scarb build`)
- [ ] Sufficient ETH in wallet (≈0.01 ETH)
- [ ] Deployment successful
- [ ] Contract verified on Starkscan
- [ ] Backend `.env` updated
- [ ] Frontend `.env.local` updated
- [ ] Test merchant registration working

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Never share your private key
- Keep private keys encrypted
- Use different addresses for mainnet
- Test thoroughly on testnet first

---

## Quick Start Script

For a streamlined deployment:

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
scarb build

# 3. Configure .env file
cp .env.example .env
# Edit .env with your details

# 4. Deploy
node deploy.js

# 5. Verify
curl -s https://sepolia.starkscan.co/api/contract/YOUR_ADDRESS | jq .
```

---

## Need Help?

1. Check Starknet documentation: https://docs.starknet.io
2. Join Starknet Discord: https://discord.gg/starknet
3. Review transaction on Starkscan: https://sepolia.starkscan.co

---

**Last Updated:** September 30, 2025