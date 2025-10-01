# StarkPay Contract Deployment Guide

## Prerequisites

1. **Starknet Wallet**: ArgentX or Braavos wallet with some testnet ETH
2. **Testnet Funds**: Get testnet ETH from [Starknet Faucet](https://starknet-faucet.vercel.app/)
3. **Node.js**: Version 18 or higher
4. **Scarb**: Cairo package manager installed

## Setup

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Build the Contract

```bash
npm run build
# or
scarb build
```

This will compile the Cairo contract and generate artifacts in `target/dev/`.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```bash
# Your wallet private key (keep this secret!)
DEPLOYER_PRIVATE_KEY=0x1234...

# Your wallet address
DEPLOYER_ADDRESS=0x5678...

# Contract owner (can be same as deployer)
OWNER_ADDRESS=0x5678...

# Treasury address to receive fees
TREASURY_ADDRESS=0x9abc...
```

#### How to Get Your Private Key:

**ArgentX:**
1. Click on Settings → Account → Export Private Key
2. Enter your password
3. Copy the private key

**Braavos:**
1. Click on Settings → Privacy & Security → Export Private Key
2. Enter your password
3. Copy the private key

⚠️ **IMPORTANT**: Never share your private key or commit it to git!

### 4. Deploy the Contract

```bash
npm run deploy
```

This will:
1. ✅ Declare the contract class
2. ✅ Deploy the contract instance
3. ✅ Set up owner and treasury addresses
4. ✅ Whitelist USDC and USDT tokens
5. ✅ Save deployment info to `deployment-info.json`
6. ✅ Update `.env` with the deployed contract address

## Deployment Output

After successful deployment, you'll see:

```
============================================================
🎉 DEPLOYMENT SUCCESSFUL!
============================================================

📝 Contract Details:
  Contract Address: 0x...
  Class Hash: 0x...
  Owner: 0x...
  Treasury: 0x...
  Platform Fee: 2%

🪙 Whitelisted Tokens:
  USDC: 0x053b40...
  USDT: 0x068f5c...

🔗 View on Starkscan:
  https://sepolia.starkscan.co/contract/0x...
============================================================
```

## Post-Deployment Steps

### 1. Update Frontend Environment

Edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x... # Your deployed contract address
```

### 2. Update Backend Environment

Edit `backend/.env` or root `.env`:

```bash
PAYMENT_PROCESSOR_ADDRESS=0x... # Your deployed contract address
```

### 3. Verify on Starkscan

Visit the Starkscan link provided in the deployment output to verify your contract.

### 4. Test the Contract

You can test basic functionality:

```bash
# Check if a token is whitelisted
starkli call <CONTRACT_ADDRESS> is_token_whitelisted <USDC_ADDRESS> --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7

# Check treasury address
starkli call <CONTRACT_ADDRESS> get_treasury_address --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7

# Check platform fee
starkli call <CONTRACT_ADDRESS> get_platform_fee_basis_points --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7
```

## Deployment Info

The deployment script saves all deployment information to `deployment-info.json`:

```json
{
  "network": "sepolia",
  "contractAddress": "0x...",
  "classHash": "0x...",
  "ownerAddress": "0x...",
  "treasuryAddress": "0x...",
  "platformFeeBasisPoints": 200,
  "whitelistedTokens": {
    "USDC": "0x...",
    "USDT": "0x..."
  },
  "deploymentTimestamp": "2025-09-30T...",
  "declareTransactionHash": "0x...",
  "deployTransactionHash": "0x..."
}
```

## Troubleshooting

### Error: "Class already declared"

The contract class has already been declared. You can:
1. Use the existing class hash to deploy a new instance
2. Modify the contract code and rebuild

### Error: "Insufficient funds"

Your deployer account doesn't have enough testnet ETH. Get more from:
- https://starknet-faucet.vercel.app/
- https://faucet.goerli.starknet.io/

### Error: "Contract artifact not found"

Run `scarb build` first to compile the contract.

### Error: "Invalid private key"

Make sure your private key:
- Starts with `0x`
- Is a valid hex string
- Corresponds to your deployer address

## Security Notes

⚠️ **Never commit your `.env` file to version control!**

The `.env` file is already in `.gitignore`, but always double-check:

```bash
# Check if .env is ignored
git status
```

If you see `.env` listed, add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

## Contract Functions

After deployment, your contract will have:

### Admin Functions (Owner Only)
- `register_merchant(merchant_address)` - Register a new merchant
- `whitelist_token(token_address, whitelisted)` - Whitelist/delist tokens
- `update_platform_fee(new_fee_basis_points)` - Update platform fee (max 10%)

### Public Functions
- `process_payment(merchant, token, amount)` - Process a payment
- `is_merchant_registered(merchant)` - Check merchant status
- `is_token_whitelisted(token)` - Check token whitelist status
- `get_treasury_address()` - Get treasury address
- `get_platform_fee_basis_points()` - Get current fee (200 = 2%)

## Next Steps

1. ✅ Deploy contract
2. ✅ Update environment variables
3. ✅ Start backend server
4. ✅ Start frontend application
5. ✅ Test merchant registration
6. ✅ Generate QR codes
7. ✅ Test payment flow

For full integration instructions, see [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md)