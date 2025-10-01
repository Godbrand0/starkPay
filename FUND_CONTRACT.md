# Fund Contract with Tokens

The contract has been deployed successfully, but needs tokens to sell to users.

## Contract Details
- **Address**: `0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31`
- **USDC Address**: `0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080`
- **USDT Address**: `0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8`
- **Token Prices**: 0.0005 ETH per token (already set)

## Option 1: Use Starkli (Recommended)

### Step 1: Mint USDC to Contract
```bash
starkli invoke \
  --rpc https://starknet-sepolia.public.blastapi.io \
  0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080 \
  mint \
  0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31 \
  u256:10000000000
```

### Step 2: Mint USDT to Contract
```bash
starkli invoke \
  --rpc https://starknet-sepolia.public.blastapi.io \
  0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8 \
  mint \
  0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31 \
  u256:10000000000
```

This will mint 10,000 USDC and 10,000 USDT to the contract.

## Option 2: Use Your Wallet

If you prefer to use your wallet UI (ArgentX/Braavos):

1. Go to the USDC contract on Starkscan:
   https://sepolia.starkscan.co/contract/0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080

2. Click "Write Contract"
3. Call `mint` function with:
   - `to`: `0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31`
   - `amount`: `10000000000` (10,000 tokens with 6 decimals)

4. Repeat for USDT contract:
   https://sepolia.starkscan.co/contract/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8

## Verify Contract Balance

After minting, verify the contract has tokens:

```bash
starkli call \
  --rpc https://starknet-sepolia.public.blastapi.io \
  0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080 \
  balance_of \
  0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31
```

Expected output: `10000000000` (10,000 tokens)

## Next Steps

After funding the contract:
1. ✅ Deploy frontend changes to Vercel
2. ✅ Update Vercel environment variables
3. ✅ Update Render backend environment variables
4. ✅ Test the token purchase flow

The feature is fully deployed once tokens are in the contract!
