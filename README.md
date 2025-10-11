# StrkPay 💳⚡

> **Accept crypto payments in seconds** - The fastest, most affordable way to accept STRK payments on Starknet

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://stark-pay-nine.vercel.app/)
[![Pitch Deck](https://img.shields.io/badge/pitch-deck-blue)](https://gamma.app/docs/StrkPay-Accept-Crypto-Payments-in-Seconds-mamfb7er2ul8j34)
[![Contract](https://img.shields.io/badge/contract-sepolia-orange)](https://sepolia.voyager.online/contract/0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31#events)
[![GitHub](https://img.shields.io/badge/github-starkPay-black)](https://github.com/Godbrand0/starkPay)

---

## 🚀 Overview

**StrkPay** is a next-generation QR code payment platform built on Starknet that enables merchants to accept cryptocurrency payments instantly with industry-leading low fees. No terminals, no setup fees—just scan and get paid.

### 🎯 Key Features

- 💰 **2% Platform Fee** - Lowest in the industry, no hidden costs
- ⚡ **Instant Settlement** - Funds arrive in seconds, not days
- 📊 **98% Revenue to Merchants** - Highest payout rate
- 🔐 **Secure** - Built on Starknet L2 with OpenZeppelin contracts
- 📱 **Mobile-First** - Responsive design with QR scanning
- 🌐 **Zero Setup** - Connect wallet and start accepting payments in 10 seconds

---

## 📋 Table of Contents

- [Quick Links](#-quick-links)
- [Why StrkPay?](#-why-strkpay)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Merchant Flow](#-merchant-flow)
- [User Flow](#-user-flow)
- [Smart Contract](#-smart-contract)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Live Application** | [https://stark-pay-nine.vercel.app/](https://stark-pay-nine.vercel.app/) |
| **Pitch Deck** | [View on Gamma](https://gamma.app/docs/StrkPay-Accept-Crypto-Payments-in-Seconds-mamfb7er2ul8j34) |
| **Smart Contract** | [Sepolia Voyager](https://sepolia.voyager.online/contract/0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31#events) |
| **GitHub Repository** | [github.com/Godbrand0/starkPay](https://github.com/Godbrand0/starkPay) |

---

## 💡 Why StrkPay?

### The Problem

Traditional payment processors are expensive and slow:
- **High Fees**: 2.9% + $0.30 per transaction (Stripe, Square)
- **Slow Settlement**: 2-5 business days for funds to arrive
- **Complex Setup**: Days of paperwork and verification
- **Limited Access**: Excludes small merchants and crypto economy

### Our Solution

StrkPay leverages Starknet's Layer 2 technology to provide:

| Feature | StrkPay | Traditional Processors |
|---------|---------|----------------------|
| **Transaction Fee** | 2.0% | 2.9% + $0.30 |
| **Settlement Time** | Instant (2-5 seconds) | 2-5 business days |
| **Setup Time** | 10 seconds | 2-3 days |
| **Gas Fees** | <$0.01 | N/A |
| **Merchant Revenue** | **98%** | 96.8% - 97.1% |
| **Monthly Fees** | $0 | $0 - $60 |

---

## 🛠 Technology Stack

### Smart Contracts
- **Cairo** - Starknet smart contract language
- **OpenZeppelin** - Security-audited contract libraries
- **Starknet Sepolia** - Testnet deployment

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Starknet.js** - Blockchain interaction library

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **get-starknet** - Wallet connection library
- **QR Code Scanner** - Camera integration for payments
- **Lucide React** - Modern icon library

### Infrastructure
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Database hosting (optional)
- **Starknet Sepolia** - Blockchain network

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ and npm
- MongoDB (local or Atlas)
- Starknet wallet (ArgentX or Braavos)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Godbrand0/starkPay.git
cd starkPay

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables (see Environment Variables section)
cp .env.example .env.local

# Start backend server (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 👨‍💼 Merchant Flow

### Overview
Merchants can register, generate payment QR codes, and track their earnings in real-time.

### Detailed Steps

#### 1. Registration & Wallet Connection

```
┌─────────────────────────────────────────────────────────┐
│  Merchant visits: /merchant/register                     │
│  ↓                                                        │
│  Clicks "Connect Wallet"                                 │
│  ↓                                                        │
│  Selects wallet (ArgentX or Braavos)                     │
│  ↓                                                        │
│  Signs connection request                                │
│  ↓                                                        │
│  Enters merchant details:                                │
│    • Business Name                                       │
│    • Description                                         │
│  ↓                                                        │
│  Merchant registered on blockchain & database            │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `POST /api/merchant/register`

**Request Body**:
```json
{
  "address": "0x...",
  "name": "Coffee Shop",
  "description": "Local coffee shop accepting crypto"
}
```

**Response**:
```json
{
  "success": true,
  "merchant": {
    "address": "0x...",
    "name": "Coffee Shop",
    "totalEarnings": "0",
    "transactionCount": 0
  }
}
```

#### 2. Dashboard Access

```
┌─────────────────────────────────────────────────────────┐
│  Navigate to: /merchant/dashboard                        │
│  ↓                                                        │
│  View real-time metrics:                                 │
│    • Total Earnings                                      │
│    • Transaction Count                                   │
│    • Recent Transactions                                 │
│  ↓                                                        │
│  Access quick actions:                                   │
│    • Generate QR Code                                    │
│    • View Transaction History                            │
│    • Withdraw Funds                                      │
└─────────────────────────────────────────────────────────┘
```

#### 3. Generate Payment QR Code

```
┌─────────────────────────────────────────────────────────┐
│  Click "Generate QR Code" button                         │
│  ↓                                                        │
│  Fill payment details:                                   │
│    • Amount (in STRK or USD/NGN equivalent)              │
│    • Description (optional)                              │
│    • Currency selection (STRK/USD/NGN)                   │
│  ↓                                                        │
│  System fetches current STRK price from Pragma Oracle    │
│  ↓                                                        │
│  QR code generated with:                                 │
│    • Unique payment ID                                   │
│    • Merchant address                                    │
│    • Amount                                              │
│    • 5-minute expiry timer                               │
│  ↓                                                        │
│  Display QR code + shareable link                        │
│  ↓                                                        │
│  Customer scans QR code                                  │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `POST /api/merchant/generate-qr`

**Request Body**:
```json
{
  "merchantAddress": "0x...",
  "amount": "10.50",
  "selectedCurrency": "USD",
  "description": "Coffee and pastry",
  "tokenAddress": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "paymentUrl": "https://stark-pay-nine.vercel.app/pay/abc123",
  "paymentId": "abc123",
  "expiresAt": "2025-10-10T10:15:00Z",
  "amount": "10.50",
  "usdAmount": 10.50,
  "exchangeRate": 0.42
}
```

#### 4. Monitor Payment Status

```
┌─────────────────────────────────────────────────────────┐
│  Payment status automatically updates:                   │
│    • "pending" → Customer hasn't paid                    │
│    • "processing" → Payment submitted to blockchain      │
│    • "completed" → Payment confirmed, funds received     │
│    • "expired" → 5-minute window passed                  │
│  ↓                                                        │
│  Real-time notifications via WebSocket                   │
│  ↓                                                        │
│  Merchant receives:                                      │
│    • 98% of payment amount                               │
│    • Platform retains 2% fee                             │
│  ↓                                                        │
│  Transaction appears in dashboard history                │
└─────────────────────────────────────────────────────────┘
```

#### 5. View Transaction History

```
┌─────────────────────────────────────────────────────────┐
│  Navigate to: /merchant/transactions                     │
│  ↓                                                        │
│  View detailed transaction list:                         │
│    • Transaction hash                                    │
│    • Amount (gross & net)                                │
│    • Fee deducted                                        │
│    • Customer address                                    │
│    • Timestamp                                           │
│    • Status                                              │
│  ↓                                                        │
│  Filter by date, amount, or status                       │
│  ↓                                                        │
│  Export to CSV (optional feature)                        │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `GET /api/merchant/:address/transactions`

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "transactionHash": "0x...",
      "amount": "10.50",
      "netAmount": "10.29",
      "feeAmount": "0.21",
      "payerAddress": "0x...",
      "status": "completed",
      "completedAt": "2025-10-10T10:12:30Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}
```

---

## 👤 User Flow

### Overview
Users can scan QR codes, make payments, and track their payment history.

### Detailed Steps

#### 1. Scan QR Code

```
┌─────────────────────────────────────────────────────────┐
│  User scans merchant QR code with:                       │
│    • Phone camera (redirects to payment page)            │
│    • QR scanner in app                                   │
│    • Manual link entry                                   │
│  ↓                                                        │
│  Redirected to: /pay/[paymentId]                         │
│  ↓                                                        │
│  System fetches payment details:                         │
│    • Merchant name                                       │
│    • Amount                                              │
│    • Description                                         │
│    • Time remaining (5-minute countdown)                 │
│  ↓                                                        │
│  Display payment information                             │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `GET /api/payment/:paymentId`

**Response**:
```json
{
  "success": true,
  "merchantAddress": "0x...",
  "merchantName": "Coffee Shop",
  "tokenAddress": "0x...",
  "amount": "10.50",
  "description": "Coffee and pastry",
  "status": "pending",
  "expiresAt": "2025-10-10T10:15:00Z",
  "isValid": true,
  "isExpired": false,
  "isCompleted": false,
  "selectedCurrency": "USD",
  "usdAmount": 10.50,
  "exchangeRate": 0.42
}
```

#### 2. Connect Wallet

```
┌─────────────────────────────────────────────────────────┐
│  Click "Connect Wallet" button                           │
│  ↓                                                        │
│  Select wallet:                                          │
│    • ArgentX                                             │
│    • Braavos                                             │
│  ↓                                                        │
│  Approve connection in wallet extension                  │
│  ↓                                                        │
│  Wallet connected successfully                           │
│  ↓                                                        │
│  Display:                                                │
│    • Connected address                                   │
│    • Current balance                                     │
│    • Payment amount                                      │
└─────────────────────────────────────────────────────────┘
```

#### 3. Review Payment Details

```
┌─────────────────────────────────────────────────────────┐
│  Payment summary displayed:                              │
│  ┌────────────────────────────────────────┐             │
│  │ Pay to: Coffee Shop                    │             │
│  │ Amount: 25 STRK (~$10.50 USD)          │             │
│  │ Description: Coffee and pastry          │             │
│  │                                         │             │
│  │ Payment Breakdown:                      │             │
│  │   • Merchant receives: 24.5 STRK (98%) │             │
│  │   • Platform fee: 0.5 STRK (2%)        │             │
│  │                                         │             │
│  │ Time remaining: 4:23                    │             │
│  └────────────────────────────────────────┘             │
│  ↓                                                        │
│  Review and confirm                                      │
└─────────────────────────────────────────────────────────┘
```

#### 4. Execute Payment

```
┌─────────────────────────────────────────────────────────┐
│  Click "Pay Now" button                                  │
│  ↓                                                        │
│  System initiates blockchain transaction:                │
│    1. Approve token spending (if first time)             │
│    2. Call PaymentProcessor.process_payment()            │
│  ↓                                                        │
│  Wallet shows transaction details:                       │
│    • To: Payment Processor Contract                      │
│    • Amount: 25 STRK                                     │
│    • Gas fee: ~0.001 STRK                                │
│  ↓                                                        │
│  User confirms in wallet                                 │
│  ↓                                                        │
│  Transaction submitted to blockchain                     │
│  ↓                                                        │
│  Show loading state: "Processing payment..."             │
└─────────────────────────────────────────────────────────┘
```

**Smart Contract Call**:
```cairo
PaymentProcessor.process_payment(
  merchant_address: 0x...,
  token_address: 0x...,
  amount: 25000000000000000000  // 25 STRK in wei
)
```

**Contract Logic**:
1. Verify merchant is registered
2. Verify token is whitelisted
3. Calculate 2% fee: `fee = amount * 200 / 10000`
4. Calculate net amount: `net = amount - fee`
5. Transfer net amount to merchant
6. Transfer fee to treasury
7. Emit `PaymentProcessed` event

#### 5. Payment Confirmation

```
┌─────────────────────────────────────────────────────────┐
│  Transaction submitted (status: "processing")            │
│  ↓                                                        │
│  Backend monitors blockchain for confirmation            │
│  ↓                                                        │
│  Transaction confirmed in ~3-5 seconds                   │
│  ↓                                                        │
│  Backend verifies transaction:                           │
│    • Extracts PaymentProcessed event                     │
│    • Validates amounts                                   │
│    • Updates payment status to "completed"               │
│  ↓                                                        │
│  Success screen displayed:                               │
│  ┌────────────────────────────────────────┐             │
│  │ ✓ Payment Successful!                  │             │
│  │                                         │             │
│  │ Transaction: 0x1a2b3c...               │             │
│  │ Amount paid: 25 STRK                   │             │
│  │ Merchant received: 24.5 STRK           │             │
│  │                                         │             │
│  │ [View on Voyager] [Done]               │             │
│  └────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `POST /api/payment/verify`

**Request Body**:
```json
{
  "transactionHash": "0x..."
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "paymentId": "abc123",
    "status": "completed",
    "transactionHash": "0x...",
    "amount": "25.0",
    "netAmount": "24.5",
    "feeAmount": "0.5",
    "payerAddress": "0x...",
    "merchantAddress": "0x...",
    "completedAt": "2025-10-10T10:12:30Z"
  }
}
```

#### 6. View Payment History

```
┌─────────────────────────────────────────────────────────┐
│  Navigate to: /user                                      │
│  ↓                                                        │
│  Connect wallet (if not already connected)               │
│  ↓                                                        │
│  View all completed payments:                            │
│    • Merchant name                                       │
│    • Amount paid                                         │
│    • Date & time                                         │
│    • Transaction hash (link to explorer)                 │
│    • Payment status                                      │
│  ↓                                                        │
│  Filter by date or merchant                              │
│  ↓                                                        │
│  Click transaction to view details                       │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint**: `GET /api/payment/user/:address`

**Response**:
```json
{
  "success": true,
  "payments": [
    {
      "paymentId": "abc123",
      "merchantAddress": "0x...",
      "merchantName": "Coffee Shop",
      "amount": "25.0",
      "description": "Coffee and pastry",
      "transactionHash": "0x...",
      "completedAt": "2025-10-10T10:12:30Z",
      "selectedCurrency": "USD",
      "usdAmount": 10.50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3
  }
}
```

---

## 📜 Smart Contract

### Contract Address
**Sepolia Testnet**: [`0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31`](https://sepolia.voyager.online/contract/0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31#events)

### Contract Interface

```cairo
#[starknet::interface]
trait IPaymentProcessor<TContractState> {
    // Merchant registration
    fn register_merchant(ref self: TContractState, merchant_address: ContractAddress);

    // Process payment with automatic fee distribution
    fn process_payment(
        ref self: TContractState,
        merchant_address: ContractAddress,
        token_address: ContractAddress,
        amount: u256
    );

    // Admin functions
    fn whitelist_token(ref self: TContractState, token_address: ContractAddress, whitelisted: bool);
    fn update_platform_fee(ref self: TContractState, new_fee_basis_points: u256);

    // View functions
    fn is_merchant_registered(self: @TContractState, merchant_address: ContractAddress) -> bool;
    fn is_token_whitelisted(self: @TContractState, token_address: ContractAddress) -> bool;
    fn get_treasury_address(self: @TContractState) -> ContractAddress;
    fn get_platform_fee_basis_points(self: @TContractState) -> u256;
}
```

### Key Features

- **Automatic Fee Distribution**: 98% to merchant, 2% to platform treasury
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard component
- **Access Control**: Ownable pattern for admin functions
- **Token Whitelisting**: Support for multiple ERC20 tokens
- **Event Emissions**: Comprehensive logging for off-chain indexing

### Events

```cairo
#[derive(Drop, starknet::Event)]
struct PaymentProcessed {
    merchant: ContractAddress,
    payer: ContractAddress,
    token: ContractAddress,
    gross_amount: u256,
    net_amount: u256,
    fee: u256,
    timestamp: u64
}
```

---

## 📁 Project Structure

```
starkPay/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── merchantController.js
│   │   │   └── paymentController.js
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── Merchant.js
│   │   │   └── Payment.js
│   │   ├── routes/            # API routes
│   │   │   ├── merchant.js
│   │   │   └── payment.js
│   │   ├── services/          # Business logic
│   │   │   └── contractService.js
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Next.js application
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx          # Homepage
│   │   ├── merchant/         # Merchant pages
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   └── transactions/
│   │   ├── pay/              # Payment pages
│   │   │   └── [paymentId]/
│   │   └── user/             # User pages
│   ├── components/            # React components
│   │   ├── WalletConnect.tsx
│   │   ├── QRScanner.tsx
│   │   └── PaymentTimer.tsx
│   ├── lib/                   # Utilities
│   │   └── apiService.ts
│   ├── package.json
│   └── .env.local.example
│
├── contracts/                 # Cairo smart contracts (if included)
│   └── src/
│       └── PaymentProcessor.cairo
│
└── README.md
```

---

## 💻 Local Development

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if running locally)
mongod

# Start development server
npm run dev
```

The backend server will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### Testing the Full Flow

1. **Start Backend**: Terminal 1 - `cd backend && npm run dev`
2. **Start Frontend**: Terminal 2 - `cd frontend && npm run dev`
3. **Visit Homepage**: Open `http://localhost:3000`
4. **Register as Merchant**:
   - Click "For Merchants"
   - Connect ArgentX/Braavos wallet
   - Fill in merchant details
5. **Generate QR Code**:
   - Enter amount and description
   - Generate QR code
6. **Make Payment**:
   - Open QR code link in new tab/phone
   - Connect wallet
   - Confirm payment
7. **Verify Success**:
   - Check merchant dashboard for updated earnings
   - Check transaction history

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/starkpay
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/starkpay

# Starknet Configuration
STARKNET_NETWORK=sepolia
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
PAYMENT_PROCESSOR_ADDRESS=0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31

# Token Addresses (Sepolia Testnet)
STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
MOCK_USDC_ADDRESS=0x...
MOCK_USDT_ADDRESS=0x...

# Oracle Configuration (Pragma)
PRAGMA_ORACLE_ADDRESS=0x...
PRICE_FEED_UPDATE_INTERVAL=60000

# CORS
CORS_ORIGIN=http://localhost:3000

# API Keys (Optional)
COINGECKO_API_KEY=your-api-key
```

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31
NEXT_PUBLIC_STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-backend-url.com/api`

### Merchant Endpoints

#### Register Merchant
```http
POST /api/merchant/register
Content-Type: application/json

{
  "address": "0x...",
  "name": "Coffee Shop",
  "description": "Local coffee shop"
}
```

#### Get Merchant Details
```http
GET /api/merchant/:address
```

#### Generate QR Code
```http
POST /api/merchant/generate-qr
Content-Type: application/json

{
  "merchantAddress": "0x...",
  "amount": "10.50",
  "selectedCurrency": "USD",
  "description": "Coffee",
  "tokenAddress": "0x..."
}
```

#### Get Merchant Transactions
```http
GET /api/merchant/:address/transactions?page=1&limit=20
```

### Payment Endpoints

#### Get Payment Details
```http
GET /api/payment/:paymentId
```

#### Verify Transaction
```http
POST /api/payment/verify
Content-Type: application/json

{
  "transactionHash": "0x..."
}
```

#### Get User Payment History
```http
GET /api/payment/user/:address?page=1&limit=20
```

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🚀 Deployment

### Frontend (Vercel)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Framework: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables from `.env.local`
   - Deploy!

3. **Custom Domain** (Optional):
   - Add your domain in Vercel settings
   - Update DNS records as instructed

### Backend (Railway/Render/Heroku)

**Railway Example**:

1. **Create `railway.json`** in backend folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Deploy**:
   - Visit [railway.app](https://railway.app)
   - Create new project
   - Connect GitHub repository
   - Select `backend` directory
   - Add environment variables
   - Deploy

3. **Add MongoDB**:
   - Add MongoDB plugin in Railway
   - Copy connection string to `MONGODB_URI`

### Database (MongoDB Atlas)

1. **Create Cluster**:
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Configure network access (allow all IPs for development)

2. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add to backend environment variables

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/Godbrand0/starkPay.git
   cd starkPay
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create Pull Request on GitHub
   - Describe your changes
   - Wait for review

### Code Style

- **Frontend**: Follow Next.js and React best practices
- **Backend**: Use ES6+ features, async/await
- **Formatting**: Use Prettier (run `npm run format`)
- **Linting**: Use ESLint (run `npm run lint`)

---

## 🐛 Known Issues & Roadmap

### Current Issues
- [ ] Payment expiry doesn't auto-cancel on frontend (timer visual only)
- [ ] No pagination UI on transaction history pages
- [ ] Camera permission handling on iOS Safari

### Upcoming Features
- [ ] Multi-token support (USDC, USDT, ETH)
- [ ] Merchant withdrawal feature
- [ ] Email notifications for payments
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Merchant API keys for integrations
- [ ] Refund functionality
- [ ] Recurring payments / subscriptions
- [ ] Multi-language support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Starknet** - For the amazing L2 infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **Pragma Oracle** - For real-time price feeds
- **Vercel** - For seamless frontend hosting
- **The Starknet Community** - For continuous support

---

## 📞 Support & Contact

- **Live Demo**: [stark-pay-nine.vercel.app](https://stark-pay-nine.vercel.app/)
- **Pitch Deck**: [View on Gamma](https://gamma.app/docs/StrkPay-Accept-Crypto-Payments-in-Seconds-mamfb7er2ul8j34)
- **Issues**: [GitHub Issues](https://github.com/Godbrand0/starkPay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Godbrand0/starkPay/discussions)

---

<div align="center">

**Built with ❤️ on Starknet**

⭐ Star us on GitHub if you find this project useful!

[Website](https://stark-pay-nine.vercel.app/) • [Docs](https://gamma.app/docs/StrkPay-Accept-Crypto-Payments-in-Seconds-mamfb7er2ul8j34) • [Contract](https://sepolia.voyager.online/contract/0x059a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31)

</div>
