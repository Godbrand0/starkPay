# Use Existing Starknet Sepolia Tokens

## Problem
Mock token contracts are too large to deploy via public RPC.

## Solution: Use Existing Sepolia Testnet Tokens

### Option 1: Use Starknet ETH as the "payment token"

Users can pay with ETH directly (no swap needed):

**ETH Token**: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`

Update your payment processor to:
1. Whitelist ETH token
2. Accept ETH payments directly
3. Remove the "buy tokens" feature (users already have ETH)

### Option 2: Use Existing STRK Token

**STRK Token**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

Users can pay with STRK.

### Option 3: Simplify - Just Use ETH for Everything

The simplest approach:
1. Remove USDC/USDT entirely
2. Whitelist only ETH
3. Users pay with ETH (which they already have for gas)
4. No token swapping needed

## Implementation

### Update `.env` files:

```bash
# Backend .env
MOCK_USDC_ADDRESS=0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
MOCK_USDT_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d

# Frontend .env.local
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
```

### Whitelist ETH in PaymentProcessor:

```bash
starkli invoke \
  0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31 \
  whitelist_token \
  0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7 \
  bool:true
```

### No Funding Needed!

Users already have ETH in their wallets - they don't need to buy it.

## Recommended: Remove Token Purchase Feature

Since users have ETH already:
1. Remove BuyTokensModal
2. Remove buy_tokens_with_eth from contract
3. Just let them pay with ETH directly

This makes the flow much simpler!
