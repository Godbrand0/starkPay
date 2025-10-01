#!/bin/bash

# Setup script for token purchase feature
# This script sets token prices and funds the contract with tokens

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   StarkPay Token Purchase Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"

# Check if .env exists
if [ ! -f "contracts/.env" ]; then
    echo -e "${RED}❌ contracts/.env not found${NC}"
    exit 1
fi

# Load environment variables
source contracts/.env

# Required variables
PAYMENT_PROCESSOR="${PAYMENT_PROCESSOR_ADDRESS:-0x615e9de18cd8280b5ff52479e7f0bfbb31b1fdc1800998e83cecb08e22cc259}"
USDC_ADDRESS="${MOCK_USDC_ADDRESS:-0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080}"
USDT_ADDRESS="${MOCK_USDT_ADDRESS:-0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8}"

echo -e "${YELLOW}Configuration:${NC}"
echo -e "Payment Processor: ${PAYMENT_PROCESSOR}"
echo -e "USDC Address: ${USDC_ADDRESS}"
echo -e "USDT Address: ${USDT_ADDRESS}\n"

# Token price (0.0005 ETH = 500000000000000 wei per token)
TOKEN_PRICE="500000000000000"
echo -e "${YELLOW}Setting token price: 0.0005 ETH per token${NC}\n"

# Function to set token price
set_price() {
    local token_address=$1
    local token_name=$2

    echo -e "${BLUE}Setting price for ${token_name}...${NC}"

    starkli invoke \
        --rpc "${STARKNET_RPC_URL}" \
        --account "${STARKNET_ACCOUNT}" \
        --keystore "${STARKNET_KEYSTORE}" \
        "${PAYMENT_PROCESSOR}" \
        set_token_price \
        "${token_address}" \
        "u256:${TOKEN_PRICE}" || {
        echo -e "${RED}Failed to set price for ${token_name}${NC}"
        return 1
    }

    echo -e "${GREEN}✅ ${token_name} price set successfully${NC}\n"
}

# Function to mint and transfer tokens
fund_contract() {
    local token_address=$1
    local token_name=$2
    local amount="10000000000"  # 10,000 tokens with 6 decimals

    echo -e "${BLUE}Funding contract with ${token_name}...${NC}"

    # First mint tokens to owner
    echo -e "  Minting tokens..."
    starkli invoke \
        --rpc "${STARKNET_RPC_URL}" \
        --account "${STARKNET_ACCOUNT}" \
        --keystore "${STARKNET_KEYSTORE}" \
        "${token_address}" \
        mint \
        "${STARKNET_ACCOUNT_ADDRESS}" \
        "u256:${amount}" || {
        echo -e "${RED}Failed to mint ${token_name}${NC}"
        return 1
    }

    # Transfer to payment processor
    echo -e "  Transferring to contract..."
    starkli invoke \
        --rpc "${STARKNET_RPC_URL}" \
        --account "${STARKNET_ACCOUNT}" \
        --keystore "${STARKNET_KEYSTORE}" \
        "${token_address}" \
        transfer \
        "${PAYMENT_PROCESSOR}" \
        "u256:${amount}" || {
        echo -e "${RED}Failed to transfer ${token_name}${NC}"
        return 1
    }

    echo -e "${GREEN}✅ Contract funded with 10,000 ${token_name}${NC}\n"
}

# Main execution
echo -e "${YELLOW}Step 1: Setting Token Prices${NC}"
echo -e "${YELLOW}══════════════════════════════${NC}\n"

set_price "${USDC_ADDRESS}" "USDC"
set_price "${USDT_ADDRESS}" "USDT"

echo -e "\n${YELLOW}Step 2: Funding Contract with Tokens${NC}"
echo -e "${YELLOW}══════════════════════════════════════${NC}\n"

fund_contract "${USDC_ADDRESS}" "USDC"
fund_contract "${USDT_ADDRESS}" "USDT"

echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Token Purchase Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Update frontend environment variables with new contract address"
echo -e "2. Deploy frontend (git push or vercel deploy)"
echo -e "3. Test token purchase flow\n"

echo -e "${YELLOW}Token Prices Set:${NC}"
echo -e "  USDC: 0.0005 ETH per token"
echo -e "  USDT: 0.0005 ETH per token\n"

echo -e "${YELLOW}Contract Funded:${NC}"
echo -e "  USDC: 10,000 tokens"
echo -e "  USDT: 10,000 tokens\n"

echo -e "${BLUE}To change prices, run:${NC}"
echo -e "  starkli invoke ${PAYMENT_PROCESSOR} set_token_price <TOKEN_ADDRESS> u256:<NEW_PRICE>\n"
