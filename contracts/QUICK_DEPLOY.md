# Quick Deployment Guide

## 🚀 Fast Track to Deploy

### Step 1: Install Dependencies
```bash
cd contracts
npm install
```

### Step 2: Build Contract
```bash
npm run build
```

### Step 3: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your wallet details:
```bash
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
DEPLOYER_ADDRESS=0xYOUR_WALLET_ADDRESS
OWNER_ADDRESS=0xYOUR_WALLET_ADDRESS  # Can be same as deployer
TREASURY_ADDRESS=0xYOUR_WALLET_ADDRESS  # Where fees go
```

### Step 4: Deploy!
```bash
npm run deploy
```

## ✅ What Happens During Deployment

1. **Declares** the contract class on Starknet
2. **Deploys** a new contract instance
3. **Whitelists** USDC and USDT tokens
4. **Saves** deployment info to `deployment-info.json`
5. **Updates** `.env` with contract address

## 📋 After Deployment

Copy the contract address from the output and update:

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

**Backend** (`backend/.env`):
```bash
PAYMENT_PROCESSOR_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

## 🔑 Getting Your Private Key

### ArgentX:
Settings → Account → Export Private Key

### Braavos:
Settings → Privacy & Security → Export Private Key

⚠️ **Keep your private key secret! Never commit it!**

## 💰 Get Testnet Funds

Before deploying, get testnet ETH:
- https://starknet-faucet.vercel.app/

## 🔍 Verify Deployment

After deployment, check your contract on Starkscan:
```
https://sepolia.starkscan.co/contract/YOUR_CONTRACT_ADDRESS
```

## ❓ Need Help?

See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for detailed instructions.