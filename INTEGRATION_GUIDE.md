# StarkPay Frontend-Backend Integration Guide

## Overview
StarkPay is now fully integrated with:
- **Frontend**: Next.js 14 with TypeScript, Redux, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Smart Contracts**: Deployed on Starknet Sepolia

## Contract Addresses
- **Payment Processor**: `0x066ec7390154371e8abd8ff905e017efcbbb98e6b61086095dae915dcadbb502`
- **Mock USDC**: `0x048d5928b8a9dfb82c3fb7a34699d58d516f7102511ccb00f16f2c8735d59dd6`
- **Mock USDT**: `0x03d33e450ba20cc9ac8b08e4dec804f68d5750281318e46b8afa9060265b7451`

## Getting Started

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables

The project uses a shared `.env` file in the root directory with all necessary configurations:
- MongoDB connection
- Starknet RPC URL
- Contract addresses
- CORS settings

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:3004`

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Application Flow

### For Merchants:

1. **Landing Page** (`/`)
   - Click "For Merchants"

2. **Connect Wallet**
   - Use ArgentX or Braavos wallet
   - Connect to Starknet Sepolia

3. **Register as Merchant** (`/merchant/register`)
   - Fill in business details
   - Triggers on-chain registration via contract
   - Saves merchant data to MongoDB

4. **Merchant Dashboard** (`/merchant/dashboard`)
   - View earnings overview
   - Generate QR codes for payments
   - View transaction history

5. **Generate QR Code**
   - Select token (mUSDC or mUSDT)
   - Enter amount
   - Add optional description
   - QR code and payment URL generated

### For Customers:

1. **Scan QR Code** or open payment link
   - Redirects to payment page (`/pay`)

2. **Payment Page**
   - View payment details
   - Connect wallet
   - See token balance

3. **Complete Payment**
   - Approve token (if needed)
   - Process payment through contract
   - 98% goes to merchant, 2% platform fee

## Key Features

### Frontend
- ✅ Wallet connection with Starknet wallets
- ✅ Redux state management
- ✅ Protected routes (registration check)
- ✅ QR code generation and display
- ✅ Real-time transaction history
- ✅ Token approval and payment flow
- ✅ Responsive design with Tailwind CSS

### Backend
- ✅ RESTful API with Express
- ✅ MongoDB for data persistence
- ✅ Merchant registration
- ✅ QR code generation service
- ✅ Transaction tracking
- ✅ Payment verification

### Smart Contracts
- ✅ Merchant registration
- ✅ Token whitelisting (mUSDC, mUSDT)
- ✅ Payment processing with 2% fee
- ✅ Reentrancy protection
- ✅ Event emissions for tracking

## API Endpoints

### Merchant Routes
- `POST /api/merchant/register` - Register new merchant
- `GET /api/merchant/:address` - Get merchant details
- `POST /api/merchant/:address/qr` - Generate QR code
- `GET /api/merchant/:address/transactions` - Get merchant transactions

### Payment Routes
- `GET /api/payment/details/:paymentId` - Get payment details
- `POST /api/payment/verify` - Verify transaction

## Testing the Integration

1. **Start both servers** (backend and frontend)

2. **Open browser** to `http://localhost:3000`

3. **Test merchant flow:**
   - Connect wallet
   - Register as merchant
   - Generate a QR code

4. **Test payment flow:**
   - Open payment URL in new window/device
   - Connect different wallet
   - Complete payment

## Important Notes

- Ensure you have test tokens (mUSDC or mUSDT) in your wallet
- The contract owner needs to whitelist tokens
- MongoDB must be running (check connection in `.env`)
- Both frontend and backend must be running simultaneously

## Troubleshooting

### Wallet Connection Issues
- Ensure you're on Starknet Sepolia testnet
- Try refreshing and reconnecting wallet
- Check browser console for errors

### Transaction Failures
- Verify sufficient token balance
- Check token allowance
- Ensure merchant is registered on-chain

### Backend Issues
- Verify MongoDB connection
- Check environment variables
- Review server logs in terminal

## Next Steps

1. Test the complete flow end-to-end
2. Add event listening for automatic transaction updates
3. Implement webhook notifications
4. Add analytics dashboard
5. Deploy to production

## Support

For issues or questions, check:
- Browser console for frontend errors
- Backend terminal for server logs
- MongoDB logs for database issues
- Starknet explorer for transaction details