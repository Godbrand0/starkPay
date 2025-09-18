#!/bin/bash

# StarkPay Contract Deployment Script
# This script deploys all contracts to Starknet Sepolia testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 StarkPay Contract Deployment Script${NC}"
echo "========================================"

# Check if starkli is available
if ! command -v starkli &> /dev/null; then
    echo -e "${RED}❌ Error: starkli is not installed or not in PATH${NC}"
    echo "Please install starkli first: curl -L https://get.starkli.sh | bash"
    exit 1
fi

# Source starkli environment
if [ -f "$HOME/.starkli/env" ]; then
    source "$HOME/.starkli/env"
fi

# Set default values
RPC_URL=${STARKNET_RPC_URL:-"https://starknet-sepolia.public.blastapi.io"}
NETWORK="sepolia"

echo -e "${YELLOW}📡 Using RPC URL: $RPC_URL${NC}"

# Check if contracts are built
if [ ! -d "contracts/target/dev" ]; then
    echo -e "${YELLOW}⚠️  Contracts not built. Building now...${NC}"
    cd contracts && scarb build && cd ..
fi

# Create accounts directory if it doesn't exist
mkdir -p accounts

echo -e "${BLUE}📋 Step 1: Setting up account...${NC}"

# Check if account exists, if not create one
if [ ! -f "accounts/deployer.json" ]; then
    echo -e "${YELLOW}⚠️  No deployer account found. Creating new account...${NC}"
    echo "Please fund this account with ETH from the Sepolia faucet:"
    echo "https://starknet-faucet.vercel.app/"
    
    starkli account oz init accounts/deployer.json
    
    echo -e "${GREEN}✅ Account created. Please fund it before continuing.${NC}"
    echo "Press any key to continue after funding..."
    read -n 1 -s
else
    echo -e "${GREEN}✅ Deployer account found${NC}"
fi

# Deploy SimplePaymentProcessor contract
echo -e "${BLUE}📋 Step 2: Deploying SimplePaymentProcessor...${NC}"

# For demo purposes, we'll use a dummy treasury address
# In production, this should be your actual treasury wallet
TREASURY_ADDRESS="0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0"
OWNER_ADDRESS="0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0"

echo -e "${YELLOW}📝 Treasury Address: $TREASURY_ADDRESS${NC}"

# Declare the contract
echo -e "${BLUE}🔄 Declaring SimplePaymentProcessor contract...${NC}"

DECLARED_CLASS_HASH=$(starkli declare \
    --rpc $RPC_URL \
    --account accounts/deployer.json \
    contracts/target/dev/starkpay_contracts_SimplePaymentProcessor.contract_class.json \
    2>/dev/null | tail -n 1)

if [ -z "$DECLARED_CLASS_HASH" ]; then
    echo -e "${RED}❌ Failed to declare SimplePaymentProcessor contract${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SimplePaymentProcessor declared with class hash: $DECLARED_CLASS_HASH${NC}"

# Deploy the contract
echo -e "${BLUE}🔄 Deploying SimplePaymentProcessor contract...${NC}"

PAYMENT_PROCESSOR_ADDRESS=$(starkli deploy \
    --rpc $RPC_URL \
    --account accounts/deployer.json \
    $DECLARED_CLASS_HASH \
    $OWNER_ADDRESS \
    $TREASURY_ADDRESS \
    2>/dev/null | tail -n 1)

if [ -z "$PAYMENT_PROCESSOR_ADDRESS" ]; then
    echo -e "${RED}❌ Failed to deploy SimplePaymentProcessor contract${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SimplePaymentProcessor deployed at: $PAYMENT_PROCESSOR_ADDRESS${NC}"

# Deploy MockUSDC contract
echo -e "${BLUE}📋 Step 3: Deploying MockUSDC...${NC}"

# Check if MockUSDC contract class exists
if [ -f "contracts/target/dev/starkpay_contracts_MockUSDC.contract_class.json" ]; then
    MOCK_USDC_CLASS_HASH=$(starkli declare \
        --rpc $RPC_URL \
        --account accounts/deployer.json \
        contracts/target/dev/starkpay_contracts_MockUSDC.contract_class.json \
        2>/dev/null | tail -n 1)

    if [ ! -z "$MOCK_USDC_CLASS_HASH" ]; then
        MOCK_USDC_ADDRESS=$(starkli deploy \
            --rpc $RPC_URL \
            --account accounts/deployer.json \
            $MOCK_USDC_CLASS_HASH \
            2>/dev/null | tail -n 1)
        
        echo -e "${GREEN}✅ MockUSDC deployed at: $MOCK_USDC_ADDRESS${NC}"
    else
        echo -e "${YELLOW}⚠️  MockUSDC declaration failed, using placeholder${NC}"
        MOCK_USDC_ADDRESS="0x0000000000000000000000000000000000000000000000000000000000000001"
    fi
else
    echo -e "${YELLOW}⚠️  MockUSDC contract not found, using placeholder${NC}"
    MOCK_USDC_ADDRESS="0x0000000000000000000000000000000000000000000000000000000000000001"
fi

# Deploy MockUSDT contract
echo -e "${BLUE}📋 Step 4: Deploying MockUSDT...${NC}"

if [ -f "contracts/target/dev/starkpay_contracts_MockUSDT.contract_class.json" ]; then
    MOCK_USDT_CLASS_HASH=$(starkli declare \
        --rpc $RPC_URL \
        --account accounts/deployer.json \
        contracts/target/dev/starkpay_contracts_MockUSDT.contract_class.json \
        2>/dev/null | tail -n 1)

    if [ ! -z "$MOCK_USDT_CLASS_HASH" ]; then
        MOCK_USDT_ADDRESS=$(starkli deploy \
            --rpc $RPC_URL \
            --account accounts/deployer.json \
            $MOCK_USDT_CLASS_HASH \
            2>/dev/null | tail -n 1)
        
        echo -e "${GREEN}✅ MockUSDT deployed at: $MOCK_USDT_ADDRESS${NC}"
    else
        echo -e "${YELLOW}⚠️  MockUSDT declaration failed, using placeholder${NC}"
        MOCK_USDT_ADDRESS="0x0000000000000000000000000000000000000000000000000000000000000002"
    fi
else
    echo -e "${YELLOW}⚠️  MockUSDT contract not found, using placeholder${NC}"
    MOCK_USDT_ADDRESS="0x0000000000000000000000000000000000000000000000000000000000000002"
fi

# Save deployment info
echo -e "${BLUE}📋 Step 5: Saving deployment information...${NC}"

cat > deployment_info.json << EOF
{
  "network": "$NETWORK",
  "rpc_url": "$RPC_URL",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "SimplePaymentProcessor": {
      "address": "$PAYMENT_PROCESSOR_ADDRESS",
      "class_hash": "$DECLARED_CLASS_HASH"
    },
    "MockUSDC": {
      "address": "$MOCK_USDC_ADDRESS"
    },
    "MockUSDT": {
      "address": "$MOCK_USDT_ADDRESS"
    }
  },
  "treasury_address": "$TREASURY_ADDRESS"
}
EOF

echo -e "${GREEN}✅ Deployment information saved to deployment_info.json${NC}"

# Update backend .env file
echo -e "${BLUE}📋 Step 6: Updating backend environment variables...${NC}"

if [ -f "backend/.env" ]; then
    # Create backup
    cp backend/.env backend/.env.backup
    
    # Update the addresses
    sed -i "s|PAYMENT_PROCESSOR_ADDRESS=.*|PAYMENT_PROCESSOR_ADDRESS=$PAYMENT_PROCESSOR_ADDRESS|g" backend/.env
    sed -i "s|MOCK_USDC_ADDRESS=.*|MOCK_USDC_ADDRESS=$MOCK_USDC_ADDRESS|g" backend/.env
    sed -i "s|MOCK_USDT_ADDRESS=.*|MOCK_USDT_ADDRESS=$MOCK_USDT_ADDRESS|g" backend/.env
    
    echo -e "${GREEN}✅ Backend .env file updated${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env file not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "========================================"
echo -e "${BLUE}📋 Contract Addresses:${NC}"
echo "SimplePaymentProcessor: $PAYMENT_PROCESSOR_ADDRESS"
echo "MockUSDC: $MOCK_USDC_ADDRESS"
echo "MockUSDT: $MOCK_USDT_ADDRESS"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Verify contracts on Starkscan"
echo "2. Test the payment flow"
echo "3. Update frontend configuration"
echo ""
echo -e "${BLUE}🔍 Verify on Starkscan:${NC}"
echo "https://sepolia.starkscan.co/contract/$PAYMENT_PROCESSOR_ADDRESS"
echo ""
echo -e "${GREEN}✅ Ready to use! Your StarkPay system is deployed on Sepolia testnet.${NC}"
