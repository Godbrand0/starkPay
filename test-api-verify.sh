#!/bin/bash

# Test the verify transaction API endpoint
# Usage: ./test-api-verify.sh <transaction_hash>

TX_HASH=${1:-"0x0693a1b59ab67b6441eb72bf20750737056a3dee52755564fd51e5180eb3dc09"}

echo "Testing verify transaction API..."
echo "Transaction Hash: $TX_HASH"
echo ""

# Test against local backend
echo "Testing LOCAL backend (http://localhost:3004):"
curl -X POST http://localhost:3004/api/payment/verify \
  -H "Content-Type: application/json" \
  -d "{\"transactionHash\": \"$TX_HASH\"}" \
  | jq .

echo ""
echo ""

# Test against production backend
echo "Testing PRODUCTION backend (https://starkpay.onrender.com):"
curl -X POST https://starkpay.onrender.com/api/payment/verify \
  -H "Content-Type: application/json" \
  -H "Origin: https://stark-pay-nine.vercel.app" \
  -d "{\"transactionHash\": \"$TX_HASH\"}" \
  | jq .
