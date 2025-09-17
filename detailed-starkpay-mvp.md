# ⚡ StarkPay QR - Detailed Development MVP

## 1. Environment Setup Requirements

### **Prerequisites**
```bash
# Required Software
- Node.js v20.x (LTS)
- MongoDB v6.x (local or Atlas)
- Git
- VS Code or preferred IDE

# Starknet Development Tools
- Starkli CLI (latest stable)
- Scarb (Cairo package manager)
- Rust (for Cairo compilation)

# Browser Extensions
- ArgentX Wallet
- Braavos Wallet
```

### **Package Dependencies**

#### Smart Contract Dependencies
```toml
# Scarb.toml
[dependencies]
starknet = ">=2.6.3"
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v0.14.0" }
```

#### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "qrcode": "^1.5.3",
    "starknet": "^6.0.0",
    "crypto": "^1.0.1",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.6",
    "@starknet-io/get-starknet": "^3.0.0",
    "starknet": "^6.0.0",
    "qr-scanner": "^1.4.2",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "typescript": "^5.3.3",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 2. Smart Contract Specifications

### **File: `contracts/PaymentProcessor.cairo`**

#### Contract Structure
```cairo
#[starknet::contract]
mod PaymentProcessor {
    // Storage variables needed
    treasury_address: ContractAddress,
    registered_merchants: LegacyMap<ContractAddress, bool>,
    
    // Constructor parameters
    constructor(treasury_address: ContractAddress)
    
    // External functions to implement
    fn register_merchant(merchant_address: ContractAddress)
    fn process_payment(merchant_address: ContractAddress, token_address: ContractAddress, amount: u256)
    fn is_merchant_registered(merchant_address: ContractAddress) -> bool
    fn get_treasury_address() -> ContractAddress
    
    // Events to emit
    MerchantRegistered(merchant: ContractAddress, timestamp: u64)
    PaymentProcessed(merchant: ContractAddress, payer: ContractAddress, token: ContractAddress, gross_amount: u256, net_amount: u256, fee: u256, timestamp: u64)
}
```

#### Key Logic Requirements
- **Fee Calculation**: `fee = amount * 2 / 100`, `net_amount = amount - fee`
- **Token Transfer Logic**: Use IERC20 `transferFrom` for payer → merchant and payer → treasury
- **Input Validation**: Check merchant registration, token whitelist, amount > 0
- **Reentrancy Protection**: Use OpenZeppelin's ReentrancyGuard

### **File: `contracts/MockUSDC.cairo`**
```cairo
// Standard ERC20 implementation with minting capability
// Name: "Mock USD Coin", Symbol: "mUSDC", Decimals: 6
// Include mint() function for testing
```

### **File: `contracts/MockUSDT.cairo`**
```cairo
// Standard ERC20 implementation with minting capability  
// Name: "Mock Tether USD", Symbol: "mUSDT", Decimals: 6
// Include mint() function for testing
```

### **File: `contracts/interfaces/IERC20.cairo`**
```cairo
// Standard ERC20 interface
// transfer, transferFrom, approve, balanceOf, allowance functions
```

---

## 3. Backend API Specifications

### **File Structure Details**

#### `backend/src/models/Merchant.js`
```javascript
// MongoDB Schema
{
  address: String (required, unique, index),
  name: String (required),
  description: String,
  email: String,
  isActive: Boolean (default: true),
  totalEarnings: Number (default: 0),
  transactionCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### `backend/src/models/Transaction.js`
```javascript
// MongoDB Schema
{
  transactionHash: String (required, unique, index),
  merchantAddress: String (required, index),
  payerAddress: String (required),
  tokenAddress: String (required),
  grossAmount: String (required), // Store as string to handle big numbers
  netAmount: String (required),
  feeAmount: String (required),
  status: String (enum: ['pending', 'completed', 'failed'], default: 'pending'),
  blockNumber: Number,
  timestamp: Date,
  createdAt: Date
}
```

### **API Endpoint Specifications**

#### Merchant Routes (`/api/merchant`)
```javascript
// POST /register
Body: { address, name, description?, email? }
Response: { success, merchant, message }

// GET /:address
Response: { merchant, stats: { totalEarnings, transactionCount } }

// POST /:address/qr
Body: { tokenAddress, amount, description? }
Response: { qrData, paymentUrl, paymentId }

// GET /:address/transactions?page=1&limit=10
Response: { transactions, pagination, totalEarnings }
```

#### Payment Routes (`/api/payment`)
```javascript
// GET /details/:paymentId
Response: { merchantAddress, tokenAddress, amount, description, merchantName }

// POST /verify
Body: { transactionHash }
Response: { success, transaction }
```

### **Service Layer Specifications**

#### `backend/src/services/qrService.js`
```javascript
// Functions to implement:
- generatePaymentId() // Generate unique payment ID
- createQRData(merchantAddress, tokenAddress, amount, paymentId) // Create QR payload
- generateQRCode(data) // Generate base64 QR image
- createPaymentUrl(data) // Create payment page URL
```

#### `backend/src/services/contractService.js`
```javascript
// Functions to implement:
- getProvider() // Starknet RPC provider
- getContract() // PaymentProcessor contract instance
- verifyTransaction(hash) // Verify transaction on-chain
- getTransactionDetails(hash) // Get transaction data
- isValidToken(address) // Check if token is whitelisted
```

---

## 4. Frontend Component Specifications

### **Page Structure Details**

#### `frontend/app/page.tsx` (Landing Page)
```typescript
// Components needed:
- Hero section with project explanation
- "For Merchants" and "Make Payment" action buttons
- How it works section (3 steps)
- Footer with links

// Key features to highlight:
- Instant QR payments on Starknet
- 2% platform fee
- Mock tokens for testing
```

#### `frontend/app/merchant/dashboard/page.tsx`
```typescript
// State management needed:
- Connected wallet address
- Merchant registration status
- Generated QR codes list
- Transaction history
- Earnings analytics

// Components to render:
- WalletConnect component
- MerchantRegistration form (if not registered)
- QRGenerator component
- EarningsOverview component
- TransactionList component
```

#### `frontend/app/pay/page.tsx`
```typescript
// URL params to handle: ?m=merchant&t=token&a=amount&id=paymentId
// State needed:
- Payment details from URL
- Merchant information
- Transaction status
- Connected wallet

// Components:
- PaymentDetails display
- ConnectWallet button
- PaymentButton component
- TransactionStatus component
```

### **Component Specifications**

#### `frontend/app/components/QRGenerator.tsx`
```typescript
// Props interface:
interface QRGeneratorProps {
  merchantAddress: string;
}

// State needed:
- tokenAddress (USDC/USDT selection)
- amount input
- description input
- generated QR code
- payment URL

// Functions:
- handleGenerateQR()
- handleTokenSelect()
- validateAmount()
```

#### `frontend/app/components/PaymentButton.tsx`
```typescript
// Props interface:
interface PaymentButtonProps {
  merchantAddress: string;
  tokenAddress: string;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

// Functions needed:
- connectWallet()
- checkTokenAllowance()
- approveToken() (if needed)
- executePayment()
- waitForTransaction()
```

#### `frontend/app/components/TransactionList.tsx`
```typescript
// Props interface:
interface TransactionListProps {
  merchantAddress: string;
  limit?: number;
}

// Features:
- Pagination support
- Transaction status indicators
- Amount formatting (with decimals)
- Copy transaction hash
- Filter by date range
```

### **Utility Functions Needed**

#### `frontend/lib/wallet.ts`
```typescript
// Wallet connection utilities
- connectWallet(): Promise<string>
- getConnectedWallet(): string | null
- disconnectWallet(): void
- switchNetwork(): Promise<boolean>
```

#### `frontend/lib/contract.ts`
```typescript
// Contract interaction utilities
- getContract(): Contract
- getTokenContract(address: string): Contract
- formatTokenAmount(amount: string, decimals: number): string
- parseTokenAmount(amount: string, decimals: number): string
```

#### `frontend/lib/api.ts`
```typescript
// API client functions
- registerMerchant(data): Promise<Response>
- getMerchant(address): Promise<Response>
- generateQR(merchantAddress, data): Promise<Response>
- getPaymentDetails(paymentId): Promise<Response>
- verifyTransaction(hash): Promise<Response>
```

---

## 5. Configuration Requirements

### **Environment Variables**

#### Backend (`.env`)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/starkpay-qr
# OR MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/starkpay-qr

# Starknet
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
PAYMENT_PROCESSOR_ADDRESS=0x... # Deployed contract address
MOCK_USDC_ADDRESS=0x...
MOCK_USDT_ADDRESS=0x...

# Security
JWT_SECRET=your-jwt-secret-here
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...
```

### **Configuration Files**

#### `frontend/tailwind.config.js`
```javascript
// Custom color palette for StarkPay branding
// Dark mode support
// Custom component classes for buttons, cards, forms
```

#### `frontend/next.config.js`
```javascript
// Enable experimental features if needed
// Configure image domains
// API rewrites for development
```

#### `backend/src/config.js`
```javascript
// Centralized configuration
// Network settings
// Token whitelist
// Fee percentage (2%)
// Database connection settings
```

---

## 6. Database Schema & Indexes

### **MongoDB Collections**

#### Merchants Collection
```javascript
// Indexes needed:
db.merchants.createIndex({ "address": 1 }, { unique: true })
db.merchants.createIndex({ "email": 1 }, { sparse: true })
db.merchants.createIndex({ "createdAt": -1 })
```

#### Transactions Collection
```javascript
// Indexes needed:
db.transactions.createIndex({ "transactionHash": 1 }, { unique: true })
db.transactions.createIndex({ "merchantAddress": 1, "timestamp": -1 })
db.transactions.createIndex({ "payerAddress": 1, "timestamp": -1 })
db.transactions.createIndex({ "status": 1 })
db.transactions.createIndex({ "timestamp": -1 })
```

---

## 7. Testing Strategy

### **Smart Contract Tests**
```bash
# Test files needed:
tests/test_payment_processor.cairo
tests/test_mock_tokens.cairo

# Test scenarios:
- Merchant registration
- Payment processing with fee deduction
- Invalid payment attempts
- Token transfer failures
- Event emissions
```

### **Backend API Tests**
```javascript
// Test files needed:
tests/merchant.test.js
tests/payment.test.js
tests/qr.test.js

// Test scenarios:
- Merchant CRUD operations
- QR code generation
- Payment verification
- Error handling
- Database operations
```

### **Frontend Component Tests**
```javascript
// Test files needed:
__tests__/QRGenerator.test.tsx
__tests__/PaymentButton.test.tsx
__tests__/wallet-integration.test.tsx

// Test scenarios:
- Component rendering
- User interactions
- Wallet connection flow
- Payment execution
- Error states
```

---

## 8. Deployment Requirements

### **Smart Contract Deployment**
```bash
# Commands needed:
starkli declare PaymentProcessor.cairo
starkli deploy PaymentProcessor <treasury_address>
starkli declare MockUSDC.cairo
starkli deploy MockUSDC
starkli declare MockUSDT.cairo  
starkli deploy MockUSDT

# Post-deployment:
- Mint test tokens to demo addresses
- Verify contract on Starkscan
- Update environment variables
```

### **Backend Deployment**
```bash
# Platform options:
- Railway / Heroku / DigitalOcean
- MongoDB Atlas for database
- Environment variables configuration
- Health check endpoint
```

### **Frontend Deployment**
```bash
# Platform: Vercel (recommended for Next.js)
# Build command: npm run build
# Environment variables setup
# Domain configuration
```

---

## 9. Development Timeline

- [ ] Set up Cairo development environment
- [ ] Implement PaymentProcessor contract
- [ ] Create MockUSDC and MockUSDT contracts
- [ ] Write and run contract tests
- [ ] Deploy to Starknet Sepolia testnet


- [ ] Set up Express server with MongoDB
- [ ] Implement merchant management APIs
- [ ] Create QR generation service
- [ ] Add transaction verification
- [ ] Test API endpoints

- [ ] Set up Next.js project with Tailwind
- [ ] Create merchant dashboard
- [ ] Implement payment page
- [ ] Add wallet integration
- [ ] Test end-to-end flow


- [ ] End-to-end testing with real wallets
- [ ] Bug fixes and optimizations
- [ ] Documentation and README
- [ ] Deployment to production

---

## 10. Success Metrics

### **Functional Requirements**
- [ ] Merchant can register and generate QR codes
- [ ] Consumer can scan QR and complete payment
- [ ] 98% goes to merchant, 2% goes to treasury
- [ ] Transaction history is recorded
- [ ] Works with ArgentX and Braavos wallets

### **Technical Requirements**
- [ ] All contracts deployed and verified
- [ ] API responds within 2 seconds
- [ ] Frontend loads within 3 seconds
- [ ] Mobile-responsive design
- [ ] Error handling for all failure scenarios

### **Demo Requirements**
- [ ] Working live demo on testnet
- [ ] Pre-funded test wallets
- [ ] Clear setup instructions
- [ ] Video walkthrough of complete flow

---

## ✅ Ready to Code

This detailed MVP provides everything needed to start development:
- **Exact file structures and naming conventions**
- **Complete API specifications with request/response formats**
- **Database schemas with required indexes**
- **Component interfaces and required functions**
- **Environment setup and configuration**
- **Testing strategy and deployment plan**
- **Clear timeline and success metrics**

All that's left is the implementation! 🚀