# StarkPay Quick Start Guide

## ✅ Setup Complete

Your StarkPay application is fully integrated and ready to run!

## 🚀 Starting the Application

### Method 1: Using the Startup Script (Recommended)
```bash
./start-dev.sh
```

### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📍 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3004
- **Health Check**: http://localhost:3004/health

## 🔧 Environment Configuration

All configuration is in the root `.env` file. The following are already configured:

✅ **MongoDB Connection** - MongoDB Atlas connection string
✅ **Starknet RPC URL** - Sepolia testnet
✅ **Contract Addresses** - Payment Processor, USDC, USDT
✅ **CORS Settings** - Frontend and backend URLs

## 📝 Important Notes

1. **MongoDB Connection**: The app uses MongoDB Atlas. The connection string is already in the `.env` file.

2. **Wallet Setup**: You'll need:
   - ArgentX or Braavos wallet
   - Connected to Starknet Sepolia testnet
   - Some test tokens (mUSDC or mUSDT)

3. **Contract Owner**: To register merchants, the contract owner needs to whitelist tokens first.

## 🎯 Testing the Application

### Quick Test Flow:

1. **Start both servers** (backend and frontend)
2. **Open** http://localhost:3000
3. **Connect wallet** using the button in the top right
4. **Click "For Merchants"** to go to dashboard
5. **Register as merchant** (fill in the form)
6. **Generate a QR code** with an amount
7. **Open payment link** in a new window/incognito
8. **Complete payment** with a different wallet

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is accessible
- Verify `.env` file exists in root directory
- Check if port 3004 is available

### Frontend won't start
- Check if port 3000 is available
- Run `npm install` again if needed

### Wallet connection issues
- Make sure you're on Sepolia testnet
- Try disconnecting and reconnecting
- Clear browser cache

### Transaction fails
- Ensure you have sufficient token balance
- Check if tokens are whitelisted in the contract
- Verify merchant is registered on-chain

## 📚 Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed setup and API documentation
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete feature overview
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Testing guidelines

## 🔍 Checking Status

### Backend Status
```bash
curl http://localhost:3004/health
```

### Frontend Status
Open http://localhost:3000 in your browser

### MongoDB Connection
Check the backend terminal logs for:
```
✅ MongoDB connected successfully
```

## 💡 Tips

- Use **two different wallets** to test the payment flow
- Keep the **backend terminal open** to see API logs
- Check **browser console** for frontend errors
- Use **Starkscan** to verify transactions on-chain

## 🎉 You're All Set!

The application is fully functional and ready for testing. Start with the merchant registration flow, then test the payment flow with QR codes.

For detailed testing steps, see [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)