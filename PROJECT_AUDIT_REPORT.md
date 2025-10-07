# StarkPay - Comprehensive Project Audit Report

## 🔍 Audit Date: January 2025

---

## ⚠️ CRITICAL ISSUES (Must Fix Immediately)

### 1. **MISSING PRAGMA_API_KEY Environment Variable**
**Location**: `backend/.env`
**Issue**: The Pragma API key is hardcoded in `priceService.js` but NOT in `.env`
**Risk**: HIGH - API key exposed in code, not configurable per environment
**Fix**:
```bash
# Add to backend/.env
PRAGMA_API_KEY=fVgkdq4oYA6FfN5megaTs1Iwu8YusvRH
```
**Update**: `backend/src/services/priceService.js:4`
```javascript
const PRAGMA_API_KEY = process.env.PRAGMA_API_KEY;
if (!PRAGMA_API_KEY) {
  throw new Error('PRAGMA_API_KEY is not set in environment variables');
}
```

### 2. **Frontend API URL Mismatch**
**Location**: `frontend/.env.local`
**Issue**:
- Frontend `.env.local` points to `http://localhost:3004/api`
- Backend `.env` has `FRONTEND_URL=https://stark-pay-nine.vercel.app`
**Risk**: HIGH - Production deployment will fail
**Fix**:
Create `frontend/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x59a2afea28e769e8f59facda6c4a8019c5dcfb53adb1a8927b418bc6683dd31
```

### 3. **Database Credentials Exposed**
**Location**: `backend/.env`
**Issue**: MongoDB URI with credentials is in `.env` (should be in `.gitignore`)
**Risk**: CRITICAL - If committed to git, database is compromised
**Fix**:
```bash
# Check if .env is in .gitignore
echo ".env" >> .gitignore
git rm --cached .env  # If already committed
```

### 4. **Missing Currency Fields in Payment Model**
**Location**: `backend/src/models/Payment.js`
**Issue**: Payment model doesn't store USD/NGN amounts or exchange rates
**Risk**: MEDIUM - Cannot track what was the original currency/amount requested
**Fix**: Add these fields:
```javascript
usdAmount: { type: Number },
ngnAmount: { type: Number },
strkAmount: { type: String },  // Already exists as 'amount'
selectedCurrency: { type: String, enum: ['USD', 'NGN', 'STRK'] },
exchangeRate: { type: Number },  // STRK/USD rate at time of creation
rateTimestamp: { type: Date },
```

---

## 🟡 HIGH PRIORITY ISSUES (Fix Soon)

### 5. **No Error Handling for Price API Failures**
**Location**: `frontend/app/merchant/dashboard/components/QRGenerator.tsx`
**Issue**: If price API fails, user sees no error, just loading state
**Risk**: MEDIUM - User doesn't know why they can't generate QR
**Fix**: Add error state and display:
```typescript
const [priceError, setPriceError] = useState<string | null>(null);

// In fetchConversions catch block:
setPriceError('Failed to fetch exchange rates. Please try again.');

// In UI:
{priceError && <p className="text-red-600">{priceError}</p>}
```

### 6. **QR Code Payment URL Shows STRK Amount, Not Original Currency**
**Location**: Payment page displays and `merchantController.js`
**Issue**: User enters $10, but QR shows "Pay 22.222 STRK" - confusing
**Risk**: MEDIUM - User confusion, might think wrong amount
**Fix**: Store and display original amount:
- Store: `description: "Coffee - $10.00 USD (22.222 STRK)"`
- Display both on payment page

### 7. **No Rate Limiting on Price API**
**Location**: `backend/src/routes/price.js`
**Issue**: Price API has no rate limiting - can be abused
**Risk**: MEDIUM - API key quota exhaustion, DoS
**Fix**: Add express-rate-limit:
```javascript
const rateLimit = require('express-rate-limit');
const priceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many requests, please try again later.'
});
router.get('/rates', priceLimiter, priceController.getRates);
```

### 8. **Stale Price Cache (1 Minute)**
**Location**: `backend/src/services/priceService.js:11`
**Issue**: 1-minute cache might be too long for volatile crypto prices
**Risk**: LOW-MEDIUM - Users might get outdated rates
**Recommendation**: Reduce to 30 seconds for better accuracy
```javascript
cacheDuration: 30000, // 30 seconds instead of 60
```

### 9. **Missing .env.example Files**
**Location**: Root of backend and frontend
**Issue**: New developers don't know what env vars are needed
**Risk**: LOW - Onboarding friction
**Fix**: Create `.env.example` files (see template below)

### 10. **No Validation on Currency Conversion Amounts**
**Location**: `backend/src/controllers/priceController.js`
**Issue**: No validation for negative amounts or NaN
**Risk**: LOW - Could cause calculation errors
**Fix**:
```javascript
const amount = parseFloat(req.body.amount);
if (isNaN(amount) || amount <= 0) {
  return res.status(400).json({
    success: false,
    message: 'Amount must be a positive number',
  });
}
```

---

## 🟢 MEDIUM PRIORITY ISSUES (Nice to Have)

### 11. **No Retry Logic for Failed API Calls**
**Location**: `priceService.js`
**Issue**: If Pragma API fails once, immediately falls back
**Recommendation**: Add retry with exponential backoff

### 12. **Hardcoded Fallback Exchange Rates**
**Location**: `priceService.js:88-92`
**Issue**: Fallback rates (STRK=$0.45, NGN=1550) could be very outdated
**Recommendation**: Update fallback rates monthly or fetch from backup API

### 13. **No Logging for Price Fetch Failures**
**Location**: `priceService.js`
**Issue**: When price fetch fails, only console.error - no structured logging
**Recommendation**: Add proper logging service (Winston, Pino)

### 14. **Transaction List Doesn't Show Currency Information**
**Location**: `TransactionList.tsx`
**Issue**: Transactions only show STRK amount, not original currency
**Impact**: Merchant can't see "this was a $10 sale"
**Fix**: Display original currency if available

### 15. **Payment Page Doesn't Show Live Currency Conversions**
**Location**: `frontend/app/pay/page.tsx`
**Issue**: Customer sees "Pay 22.222 STRK" but doesn't know USD/NGN value
**Recommendation**: Add currency display like QR generator

### 16. **No Webhook for Price Updates**
**Location**: N/A
**Issue**: Merchants don't get notified if prices change significantly
**Recommendation**: Optional - notify if STRK price changes >5%

### 17. **MongoDB Indexes Could Be Optimized**
**Location**: `Payment.js`
**Current**:
- `paymentId` (unique)
- `merchantAddress`
- `createdAt`
- `status`

**Add compound indexes**:
```javascript
paymentSchema.index({ merchantAddress: 1, status: 1, createdAt: -1 });
paymentSchema.index({ merchantAddress: 1, expiresAt: 1, status: 1 });
```

---

## 📋 CONFIGURATION ISSUES

### 18. **Inconsistent Token Address Variable Names**
**Backend**: `MOCK_USDC_ADDRESS`, `MOCK_USDT_ADDRESS`
**Frontend**: `STARKNET_SEPOLIA_ADDRESS`
**Issue**: Confusing naming, should be `STRK_TOKEN_ADDRESS`

### 19. **No Health Check for External APIs**
**Missing**: Health check endpoint that tests:
- MongoDB connection
- Starknet RPC
- Pragma API
- Forex API

---

## 🔒 SECURITY ISSUES

### 20. **JWT_SECRET in .env but Not Used**
**Location**: `backend/.env:19`
**Issue**: JWT secret defined but no JWT auth implemented
**Action**: Either implement JWT auth or remove unused variable

### 21. **No Input Sanitization**
**Location**: All controllers
**Issue**: No validation/sanitization of user inputs
**Risk**: MEDIUM - Potential NoSQL injection
**Fix**: Use express-validator or joi

### 22. **CORS Origin Too Permissive?**
**Location**: `backend/src/server.js:23-26`
**Current**: Only allows `stark-pay-nine.vercel.app`
**Good**: Properly restricted ✅
**Note**: Update when deploying to custom domain

---

## 🐛 POTENTIAL BUGS

### 23. **Race Condition in QR Expiration**
**Location**: Multiple places check expiration
**Issue**: If two requests check expiration simultaneously, both might update status
**Impact**: LOW - MongoDB atomic operations should handle this
**Monitor**: Watch for duplicate status updates in logs

### 24. **Cron Job Runs Every 30 Seconds - Too Frequent?**
**Location**: `server.js:73`
**Issue**: Checking pending payments every 30 seconds might be overkill
**Recommendation**: Increase to 60 seconds or use event-driven approach

### 25. **Payment Verification Doesn't Handle Chain Reorgs**
**Location**: `paymentVerificationService.js`
**Issue**: If Starknet has a chain reorg, verified payments might become invalid
**Risk**: LOW on Sepolia, but consider for mainnet
**Recommendation**: Wait for N confirmations before marking complete

### 26. **No Idempotency Keys**
**Location**: Payment creation
**Issue**: If user clicks "Generate QR" multiple times quickly, creates multiple payments
**Risk**: LOW - User confusion
**Fix**: Add idempotency key based on merchant+amount+timestamp

---

## 📦 MISSING FEATURES (Future Enhancements)

### 27. **No Payment Cancellation**
- Can't cancel a pending payment
- QR expires but payment record stays as "expired"

### 28. **No Refund Mechanism**
- If payment completed but merchant wants to refund
- Need admin function to initiate on-chain refund

### 29. **No Multi-Token Support**
- Currently only STRK
- Could add USDC, USDT, ETH on Starknet

### 30. **No Analytics Dashboard**
- No charts/graphs for merchant earnings
- No export to CSV
- No date range filtering

### 31. **No Email Notifications**
- Merchant doesn't get email when payment received
- Customer doesn't get receipt

### 32. **No QR Code Customization**
- Can't add merchant logo to QR
- Can't change colors
- Can't add branding

---

## 🧪 TESTING GAPS

### 33. **No Unit Tests**
**Missing**: Jest/Mocha tests for services, controllers
**Critical Functions to Test**:
- Currency conversion logic
- Price caching
- Payment status transitions
- QR generation

### 34. **No Integration Tests**
**Missing**: E2E tests for critical flows:
- Merchant registration → QR generation → Payment → Verification
- Currency conversion accuracy
- Expiration timing

### 35. **No Load Testing**
**Unknown**: How many concurrent users can system handle?
**Recommendation**: Use k6 or Artillery to test

---

## 📝 DOCUMENTATION GAPS

### 36. **No API Documentation**
**Missing**: Swagger/OpenAPI spec for backend API
**Impact**: Frontend developers guessing API structure

### 37. **No Deployment Guide**
**Missing**: Step-by-step guide for:
- Backend deployment (Docker, PM2, etc.)
- Frontend deployment (Vercel, Netlify)
- Database setup
- Environment variables

### 38. **No Troubleshooting Guide**
**Missing**: Common issues and solutions:
- "Payment stuck in pending"
- "QR code doesn't scan"
- "Price conversion not loading"

---

## ✅ WHAT'S WORKING WELL

1. ✅ **Dark Mode** - Fully implemented across all pages
2. ✅ **Real-time Payment Updates** - PaymentsContext polls every 5 seconds
3. ✅ **QR Expiration** - 5-minute timer with visual countdown
4. ✅ **Address Normalization** - Properly handles Starknet addresses
5. ✅ **Auto-expiration** - Pending payments expire automatically
6. ✅ **View QR Modal** - Can view past QR codes
7. ✅ **Multi-currency Support** - USD, NGN, STRK conversion
8. ✅ **Mobile Wallet Deep Links** - Opens ArgentX/Braavos on mobile

---

## 🎯 PRIORITY ACTION ITEMS

### Immediate (Today):
1. ✅ Add `PRAGMA_API_KEY` to `.env`
2. ✅ Create `.env.example` files
3. ✅ Add currency fields to Payment model
4. ✅ Add validation to price conversion endpoints

### This Week:
5. ⏳ Create frontend `.env.production`
6. ⏳ Add error handling for price API failures
7. ⏳ Show original currency on payment page
8. ⏳ Add rate limiting to price endpoints

### This Month:
9. ⏳ Add unit tests for critical functions
10. ⏳ Create API documentation
11. ⏳ Add structured logging
12. ⏳ Implement retry logic for API calls

---

## 🔧 RECOMMENDED FIXES

### Backend .env.example Template:
```bash
# Server Configuration
NODE_ENV=development
PORT=3004

# Database
MONGODB_URI=mongodb://localhost:27017/starkpay

# Starknet Configuration
STARKNET_RPC_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/YOUR_KEY
PAYMENT_PROCESSOR_ADDRESS=0x...
STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d

# API Keys
PRAGMA_API_KEY=your_pragma_api_key_here

# Security
JWT_SECRET=your_random_secret_here
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend .env.example Template:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004/api

# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...
```

---

## 📊 OVERALL PROJECT HEALTH: 7.5/10

**Strengths**:
- ✅ Core payment flow works
- ✅ Good UX with dark mode, countdown timers
- ✅ Multi-currency support implemented
- ✅ Real-time updates

**Weaknesses**:
- ⚠️ Missing tests
- ⚠️ Configuration issues (env vars)
- ⚠️ No proper error handling in many places
- ⚠️ Security concerns (exposed credentials)

**Recommendation**: Fix critical issues (1-4) before production deployment. System is functional but needs hardening for real users.

---

## 📞 Next Steps

1. Review this audit with team
2. Prioritize fixes based on risk/impact
3. Create GitHub issues for each item
4. Set up CI/CD pipeline with automated tests
5. Schedule security review before mainnet launch

---

**Audit Completed By**: Claude AI Assistant
**Date**: January 2025
**Next Audit**: After critical fixes implemented
