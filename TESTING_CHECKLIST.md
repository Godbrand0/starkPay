# StarkPay Testing Checklist

## Prerequisites
- [ ] MongoDB is running (local or Atlas)
- [ ] Environment variables are set in `.env`
- [ ] Contract addresses are correct in `.env`
- [ ] Tokens are whitelisted in the contract
- [ ] Test wallets have mUSDC/mUSDT tokens

## Backend Testing

### Server Startup
- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Health check endpoint works (`/health`)
- [ ] CORS configured properly

### Merchant API
- [ ] POST `/api/merchant/register` - Register new merchant
  - [ ] Successful registration
  - [ ] Duplicate registration returns error
  - [ ] Missing required fields returns error

- [ ] GET `/api/merchant/:address` - Get merchant details
  - [ ] Returns merchant data
  - [ ] Returns stats (earnings, transaction count)
  - [ ] Returns 404 for non-existent merchant

- [ ] POST `/api/merchant/:address/qr` - Generate QR code
  - [ ] Generates valid QR code
  - [ ] Returns payment URL
  - [ ] Creates payment record in database
  - [ ] Handles invalid token address

- [ ] GET `/api/merchant/:address/transactions` - Get transactions
  - [ ] Returns paginated results
  - [ ] Filters by merchant address
  - [ ] Sorts by timestamp (descending)

### Payment API
- [ ] GET `/api/payment/details/:paymentId` - Get payment details
  - [ ] Returns payment information
  - [ ] Includes merchant name
  - [ ] Returns 404 for invalid payment ID

- [ ] POST `/api/payment/verify` - Verify transaction
  - [ ] Verifies on-chain transaction
  - [ ] Creates transaction record
  - [ ] Returns existing record if duplicate

## Frontend Testing

### Landing Page (`/`)
- [ ] Page loads correctly
- [ ] Navigation bar displays
- [ ] "For Merchants" button works
- [ ] "Make Payment" button works
- [ ] Wallet connect button visible
- [ ] All sections render properly

### Wallet Connection
- [ ] Connect wallet button works
- [ ] ArgentX wallet connects
- [ ] Braavos wallet connects
- [ ] Address displays correctly
- [ ] Disconnect button works
- [ ] Connection persists on refresh

### Merchant Registration (`/merchant/register`)
- [ ] Redirects if wallet not connected
- [ ] Form displays correctly
- [ ] Name field validation works
- [ ] Can submit with valid data
- [ ] Shows loading during registration
- [ ] On-chain registration triggered
- [ ] Backend registration triggered
- [ ] Success message displays
- [ ] Redirects to dashboard after success

### Merchant Dashboard (`/merchant/dashboard`)
- [ ] Redirects if wallet not connected
- [ ] Shows "Registration Required" if not registered
- [ ] Checks on-chain registration status
- [ ] Fetches merchant data from backend
- [ ] Displays earnings overview
- [ ] Shows transaction count
- [ ] QR Generator component loads
- [ ] Transaction List component loads

### QR Code Generation
- [ ] Token selection dropdown works
- [ ] Amount input validates
- [ ] Description field optional
- [ ] Generate button triggers API
- [ ] QR code displays correctly
- [ ] Download button works
- [ ] Copy URL button works
- [ ] URL format is correct

### Transaction List
- [ ] Fetches merchant transactions
- [ ] Displays transaction details
- [ ] Shows correct status colors
- [ ] Copy transaction hash works
- [ ] External link to Starkscan works
- [ ] Pagination works (if implemented)
- [ ] Shows "No transactions" when empty

### Payment Page (`/pay`)
- [ ] Accepts URL parameters (m, t, a, id)
- [ ] Fetches payment details
- [ ] Shows merchant name
- [ ] Displays amount and token
- [ ] Shows description if provided
- [ ] Redirects if wallet not connected
- [ ] Displays user's token balance
- [ ] Pay button enabled when connected

### Payment Processing
- [ ] Check token allowance
- [ ] Approve token if needed
- [ ] Process payment through contract
- [ ] Shows loading states
- [ ] Displays success message
- [ ] Shows transaction hash
- [ ] Links to Starkscan
- [ ] Handles errors gracefully

## Contract Integration Testing

### Merchant Registration
- [ ] Call `register_merchant` works
- [ ] Transaction confirmed on-chain
- [ ] Event emitted correctly
- [ ] Can verify registration with `is_merchant_registered`

### Token Operations
- [ ] Get token balance works
- [ ] Check allowance works
- [ ] Approve token works
- [ ] Approval amount is correct

### Payment Processing
- [ ] Process payment transaction succeeds
- [ ] Correct amounts transferred
- [ ] Fee calculation is correct (2%)
- [ ] Merchant receives net amount (98%)
- [ ] Treasury receives fee (2%)
- [ ] PaymentProcessed event emitted

## Error Handling

### Frontend Errors
- [ ] Network errors show message
- [ ] Transaction rejections handled
- [ ] Invalid payment links handled
- [ ] Insufficient balance detected
- [ ] Wallet disconnection handled

### Backend Errors
- [ ] 404 errors for missing resources
- [ ] 400 errors for invalid requests
- [ ] 500 errors logged properly
- [ ] Error messages are user-friendly
- [ ] CORS errors prevented

## User Experience

### Navigation
- [ ] All links work correctly
- [ ] Back buttons function
- [ ] Protected routes redirect properly
- [ ] Navigation is intuitive

### Loading States
- [ ] Spinners show during async operations
- [ ] Button states change appropriately
- [ ] No UI freezing

### Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] All components responsive

### Visual Feedback
- [ ] Success messages clear
- [ ] Error messages helpful
- [ ] Status indicators accurate
- [ ] Copy confirmations work

## Performance

### Frontend
- [ ] Initial page load < 3s
- [ ] Navigation smooth
- [ ] No console errors
- [ ] No memory leaks

### Backend
- [ ] API responses < 2s
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Proper indexing

## Security

### Frontend
- [ ] No sensitive data in localStorage
- [ ] HTTPS in production
- [ ] No API keys in code

### Backend
- [ ] Environment variables secure
- [ ] CORS configured properly
- [ ] Input validation present
- [ ] Error messages don't leak data

## Complete Flow Test

### End-to-End Merchant Flow
1. [ ] Open landing page
2. [ ] Connect wallet
3. [ ] Navigate to merchant dashboard
4. [ ] Register as merchant
5. [ ] Generate QR code
6. [ ] Download/copy QR code

### End-to-End Payment Flow
1. [ ] Open payment link
2. [ ] Connect wallet
3. [ ] View payment details
4. [ ] Complete payment
5. [ ] See success confirmation
6. [ ] Verify transaction on Starkscan
7. [ ] Check merchant receives payment

## Database Verification

- [ ] Merchants saved correctly
- [ ] Transactions recorded
- [ ] Payments stored
- [ ] Indexes created
- [ ] Data relationships correct

## Documentation

- [ ] README is clear
- [ ] Integration guide complete
- [ ] API endpoints documented
- [ ] Environment variables listed
- [ ] Setup instructions accurate

---

## Test Results

**Date**: ___________
**Tester**: ___________
**Pass Rate**: ___/___
**Issues Found**: ___________

## Notes
_Add any observations, bugs, or improvements here_