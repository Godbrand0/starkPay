# STRK Token Payment Setup

## ✅ Implementation Complete!

StarkPay now accepts **STRK tokens** for payments instead of mock tokens.

## What Changed

### 1. Smart Contract
- ✅ STRK token whitelisted: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
- ✅ ETH token also whitelisted: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
- ✅ No redeployment needed

### 2. Backend Configuration
**File: `backend/.env`**
```
MOCK_USDC_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
MOCK_USDT_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
```

### 3. Frontend Configuration
**File: `frontend/.env.local`**
```
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
```

### 4. Token Labels
- Payment UI now shows "STRK" instead of "ETH"
- Token name: "Starknet Token"
- Decimals: 18

## How Users Get STRK

### Starknet Faucet
**URL**: https://starknet-faucet.vercel.app/

1. Visit the faucet
2. Connect your wallet
3. Request testnet tokens
4. Receive both ETH (for gas) and STRK (for payments)

### Alternative Faucets
- https://faucet.goerli.starknet.io/
- https://starknet-faucet.braavos.app/

## Benefits of Using STRK

✅ **Easy to obtain** - Available from multiple faucets
✅ **Official Starknet token** - Native to the ecosystem
✅ **No deployment** - Token already exists on Sepolia
✅ **No minting needed** - Users get it from faucets
✅ **Widely available** - Everyone on testnet can access it

## Payment Flow

1. **User scans QR code** → Opens payment page
2. **Connects wallet** (mobile or desktop)
3. **Checks STRK balance** → If insufficient, directs to faucet
4. **Approves STRK spending** → One-time approval
5. **Completes payment** → STRK transferred to merchant
6. **Platform fee (2%)** → Sent to treasury

## Contract Details

| Item | Address |
|------|---------|
| Payment Processor | `0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31` |
| STRK Token | `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` |
| ETH Token | `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7` |

## Deployment Checklist

- [x] Whitelist STRK in contract
- [x] Update backend .env
- [x] Update frontend .env
- [x] Update token labels
- [ ] Push changes to GitHub
- [ ] Update Vercel environment variables
- [ ] Update Render backend environment
- [ ] Test payment with STRK from faucet

## Testing Steps

1. Get STRK from faucet: https://starknet-faucet.vercel.app/
2. Create a QR code payment request
3. Scan QR code on mobile or open link
4. Connect wallet
5. Approve STRK spending
6. Complete payment
7. Verify transaction on Starkscan

## View on Starkscan

**Payment Processor Contract**:
https://sepolia.starkscan.co/contract/0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31

**STRK Token Contract**:
https://sepolia.starkscan.co/contract/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d

---

**Ready to deploy!** Just push changes and update environment variables on Vercel/Render.
