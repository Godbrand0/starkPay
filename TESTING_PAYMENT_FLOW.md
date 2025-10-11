# Testing Payment Flow - Debug Guide

## Issue Description
New transaction objects are being created with different prices instead of updating the existing pending payment.

## How to Test and Debug

### Step 1: Start the Backend with Logging
```bash
cd backend
npm run dev
```

The server now has enhanced logging that will show:
- All pending payments for a merchant when verification starts
- Each search strategy being attempted
- Why matches are or aren't found
- Detailed warnings when creating new payments

### Step 2: Generate a QR Code

1. Go to merchant dashboard
2. Create a payment QR code (e.g., 5 STRK)
3. **Note the details**:
   - Amount created
   - Payment ID (check browser console)
   - Current time

### Step 3: Check Database Before Payment

```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const Payment = require('./src/models/Payment');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const pending = await Payment.findOne({ status: 'pending' }).sort({ createdAt: -1 });
  if (pending) {
    console.log('Latest Pending Payment:');
    console.log('  Payment ID:', pending.paymentId);
    console.log('  Amount:', pending.amount);
    console.log('  Merchant:', pending.merchantAddress.slice(0, 20) + '...');
    console.log('  Token:', pending.tokenAddress.slice(0, 20) + '...');
    console.log('  Created:', pending.createdAt);
    console.log('  Expires:', pending.expiresAt);
  }
  process.exit(0);
});
"
```

### Step 4: Make the Payment

1. Scan the QR code or open the payment link
2. Connect wallet
3. Confirm payment
4. **Watch the backend logs closely!**

### Step 5: Check Backend Logs

Look for these log sections:

```
🔍 ===== SEARCHING FOR EXISTING PAYMENT =====
  Merchant: 0x...
  Token: 0x...
  Amount: 5

  Found X pending/processing/expired payments for this merchant:
    1. ID: abc12345... | Amount: 5 | Status: pending | Created: ...
```

This shows what pending payments exist.

Then:
```
✅ Found exact match: abc12345...
```
OR
```
⚠️  ===== NO MATCHING PAYMENT FOUND =====
```

### Step 6: Check Database After Payment

```bash
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const Payment = require('./src/models/Payment');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Get the latest completed payment
  const completed = await Payment.findOne({ status: 'completed' }).sort({ completedAt: -1 });

  console.log('Latest Completed Payment:');
  console.log('  Payment ID:', completed.paymentId);
  console.log('  Amount:', completed.amount);
  console.log('  Has expiresAt?', !!completed.expiresAt, '(should be true if updated from pending)');
  console.log('  Created:', completed.createdAt);
  console.log('  Completed:', completed.completedAt);

  // Check if there's still a pending payment with same details
  const pendingDuplicate = await Payment.findOne({
    merchantAddress: completed.merchantAddress,
    tokenAddress: completed.tokenAddress,
    amount: completed.amount,
    status: 'pending'
  });

  if (pendingDuplicate) {
    console.log('\n❌ DUPLICATE FOUND!');
    console.log('  Pending Payment ID:', pendingDuplicate.paymentId);
    console.log('  This is a bug - the pending payment should have been updated!');
  } else {
    console.log('\n✅ No duplicate found - payment was properly updated!');
  }

  process.exit(0);
});
"
```

## Common Issues and Solutions

### Issue 1: Amount Mismatch

**Symptom**: Logs show pending payment exists but with different amount
```
Found 1 pending/processing/expired payments for this merchant:
  1. ID: abc... | Amount: 5.5555 | Status: pending
```
But verification is looking for amount `5`

**Solution**: The merchant might have entered amount in USD, which gets converted to STRK. The actual blockchain payment is in STRK with exact amount.

**Fix**: Ensure the QR code amount matches exactly what's sent on blockchain.

### Issue 2: Token Address Mismatch

**Symptom**: Different token addresses between pending and completed

**Check**: Are both using normalized addresses?
```javascript
// Pending: 0x04718f5a...
// Completed: 0x4718f5a...  ← Missing leading zero!
```

**Fix**: Already implemented - both should use `normalizeAddress()` function.

### Issue 3: Timing Issues

**Symptom**: Payment expired before user could pay

**Check**:
- Created: 2025-10-11T08:25:40
- Expires: 2025-10-11T08:30:40 (5 minutes later)
- User paid: 2025-10-11T08:32:00 (too late!)

**Result**: Pending payment marked as expired, new payment created during verification.

**Solution**: Increase expiry time or prompt user to generate new QR.

### Issue 4: Direct Wallet Payment

**Symptom**: User paid directly from wallet without scanning QR

**Result**: No pending payment exists, new one created during verification.

**This is expected behavior** - can't update a payment that doesn't exist!

## Monitoring Script

Run this to continuously monitor payment creation:

```bash
cd backend
watch -n 2 'node -e "
const mongoose = require(\"mongoose\");
require(\"dotenv\").config();
const Payment = require(\"./src/models/Payment\");
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const stats = await Payment.aggregate([
    { \\$group: { _id: \"\\$status\", count: { \\$sum: 1 } } }
  ]);
  console.log(\"Payment Counts:\");
  stats.forEach(s => console.log(\"  \" + s._id + \": \" + s.count));
  process.exit(0);
});
" 2>/dev/null'
```

## Expected Behavior

### Correct Flow:
1. Merchant generates QR → **Pending** payment created (has `expiresAt`)
2. User scans and pays within 5 minutes
3. Verification finds pending payment → Updates to **Completed**
4. Result: 1 payment record with both `expiresAt` and `completedAt`

### Incorrect Flow (Bug):
1. Merchant generates QR → **Pending** payment created
2. User scans and pays
3. Verification can't find pending payment → Creates **new Completed** payment
4. Result: 2 payment records (1 pending/expired, 1 completed)

## Next Steps After Testing

Based on the logs, you should be able to see:
- Why the matching is failing (amount format? token address? timing?)
- What the actual search criteria are
- What pending payments exist at the time of verification

Report the findings and we can fix the specific issue!
