# Token Purchase Feature

## Overview

Added functionality to allow users to buy payment tokens (USDC/USDT) with ETH directly within the payment flow. If a user doesn't have enough tokens to complete a payment, they can now purchase them instantly using ETH.

## Changes Made

### 1. Smart Contract Updates

#### [`contracts/src/interfaces.cairo`](contracts/src/interfaces.cairo)
- Added `buy_tokens_with_eth()` function to `IPaymentProcessor` interface
- Added `set_token_price()` admin function
- Added `get_token_price()` view function

#### [`contracts/src/SimplePaymentProcessor.cairo`](contracts/src/SimplePaymentProcessor.cairo)
- Added storage for:
  - `token_prices`: Map of token addresses to ETH prices
  - `eth_token_address`: Starknet ETH token address
- Added new events:
  - `TokensPurchased`: Emitted when tokens are bought
  - `TokenPriceUpdated`: Emitted when token price is updated
- Implemented `buy_tokens_with_eth()`:
  - Accepts ETH payment
  - Calculates token amount based on price
  - Transfers ETH to treasury
  - Transfers tokens to buyer
  - Includes reentrancy protection
- Implemented `set_token_price()` (admin only)
- Implemented `get_token_price()` view function
- **Updated constructor** to require `eth_token_address` parameter

### 2. Frontend Updates

#### [`frontend/lib/contract.ts`](frontend/lib/contract.ts)
- Added ETH token constant
- Implemented `buyTokensWithETH()` function
- Implemented `getTokenPrice()` function
- Implemented `getETHBalance()` function
- Added ETH to `TOKENS` object

#### [`frontend/components/BuyTokensModal.tsx`](frontend/components/BuyTokensModal.tsx) - NEW
- Modal component for purchasing tokens
- Shows user's ETH balance
- Displays token price
- Calculates estimated tokens
- Handles ETH approval and token purchase in single transaction

#### [`frontend/app/pay/page.tsx`](frontend/app/pay/page.tsx)
- Integrated BuyTokensModal
- Added "Buy" button when user has insufficient balance
- Shows warning when balance is too low
- Auto-refreshes balance after purchase

## Deployment Instructions

### Step 1: Redeploy Smart Contracts

The contract constructor signature has changed. You need to redeploy:

```bash
cd contracts

# Build contracts
scarb build

# Deploy with ETH token address
# Starknet Sepolia ETH: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7

starkli declare target/dev/starkpay_SimplePaymentProcessor.contract_class.json

starkli deploy \
  <CLASS_HASH> \
  <OWNER_ADDRESS> \
  <TREASURY_ADDRESS> \
  0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
```

### Step 2: Set Token Prices

After deployment, set prices for your tokens (as contract owner):

```bash
# Example: Set USDC price to 0.0005 ETH per token (500000000000000 wei)
starkli invoke \
  <PAYMENT_PROCESSOR_ADDRESS> \
  set_token_price \
  <USDC_TOKEN_ADDRESS> \
  u256:500000000000000

# Example: Set USDT price
starkli invoke \
  <PAYMENT_PROCESSOR_ADDRESS> \
  set_token_price \
  <USDT_TOKEN_ADDRESS> \
  u256:500000000000000
```

### Step 3: Fund Contract with Tokens

The contract needs tokens to sell to users. Transfer tokens to the contract:

```bash
# Transfer tokens to payment processor
starkli invoke \
  <USDC_TOKEN_ADDRESS> \
  transfer \
  <PAYMENT_PROCESSOR_ADDRESS> \
  u256:10000000000  # 10,000 USDC (with 6 decimals)
```

### Step 4: Update Frontend Environment Variables

Update `.env.local` or Vercel environment variables:

```bash
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=<NEW_CONTRACT_ADDRESS>
```

### Step 5: Deploy Frontend

```bash
cd frontend
npm run build

# Or push to trigger Vercel deployment
git push
```

## How It Works

### User Flow

1. User scans QR code and opens payment page
2. Connects wallet (auto-launches on mobile)
3. If insufficient tokens:
   - "Buy" button appears next to balance
   - Click to open purchase modal
4. In modal:
   - See ETH balance and token price
   - Enter ETH amount to spend
   - See estimated tokens received
   - Click "Buy Tokens with ETH"
5. Single transaction:
   - Approves ETH spending
   - Purchases tokens
6. Balance refreshes automatically
7. User can now complete payment

### Smart Contract Flow

```
buy_tokens_with_eth(token_address, min_tokens):
  1. Check token is whitelisted
  2. Get ETH allowance from user
  3. Get token price from storage
  4. Calculate token amount: (eth_amount * 10^6) / price
  5. Transfer ETH from user to treasury
  6. Transfer tokens from contract to user
  7. Emit TokensPurchased event
```

## Pricing

Token prices are set in wei per token (18 decimals for ETH, 6 for tokens).

**Example calculations:**
- Price: 0.0005 ETH per token = 500000000000000 wei
- User approves: 0.001 ETH = 1000000000000000 wei
- Tokens received: (1000000000000000 * 1000000) / 500000000000000 = 2 tokens

## Security Features

- ✅ Reentrancy protection
- ✅ Only whitelisted tokens can be purchased
- ✅ Only owner can set prices
- ✅ Minimum token amount check (slippage protection)
- ✅ Contract must have sufficient token balance
- ✅ ETH allowance check before purchase

## Testing

### Manual Testing Checklist

- [ ] Deploy new contract with ETH address
- [ ] Set token prices
- [ ] Fund contract with tokens
- [ ] Connect wallet on payment page
- [ ] Verify "Buy" button appears when balance is low
- [ ] Open buy modal and check ETH balance displays
- [ ] Verify token price shows correctly
- [ ] Enter ETH amount and verify token calculation
- [ ] Complete purchase transaction
- [ ] Verify balance updates
- [ ] Complete payment with newly purchased tokens

## Known Limitations

1. **Fixed Price**: Prices are manually set by owner (no oracle integration)
2. **Contract Must Hold Tokens**: Requires pre-funding contract with tokens
3. **No Refunds**: Purchases are final
4. **Simple Calculation**: Uses basic math, no slippage beyond minimum tokens

## Future Enhancements

- [ ] Integrate price oracles (Pragma, Empiric)
- [ ] Add liquidity pools instead of contract holdings
- [ ] Support multiple payment paths (ETH → Token A → Token B)
- [ ] Add price impact warnings for large purchases
- [ ] Implement purchase history/receipts

## Support

For issues or questions:
- Check deployment logs
- Verify contract has sufficient tokens
- Ensure prices are set correctly
- Check user has ETH for purchase + gas
