# Transaction Status Documentation

## Overview

StarkPay uses **5 distinct statuses** to track the lifecycle of payment transactions. Each status represents a specific state in the payment flow.

---

## Status Types

### 1. **`pending`**
**Initial State** - Default status when a QR code is generated

#### Conditions:
- ✅ Merchant generates a QR code
- ✅ Payment request is created in database
- ✅ QR code has not expired (within 5-minute window)
- ✅ No transaction has been submitted yet

#### Fields Set:
- `status: 'pending'`
- `paymentId`: Unique identifier
- `merchantAddress`: Merchant's wallet
- `tokenAddress`: Payment token (STRK)
- `amount`: Expected payment amount
- `qrCode`: Base64 encoded QR code
- `paymentUrl`: Payment page URL
- `expiresAt`: 5 minutes from creation
- `createdAt`: Timestamp

#### What Happens:
- QR code is displayed to customer
- Customer can scan and initiate payment
- Status remains `pending` until:
  - Customer submits transaction → Changes to `processing`
  - QR code expires without payment → Changes to `expired`

#### Where It's Used:
- **Frontend**: Shows as "Pending" badge in transaction list
- **Backend Cron Job**: Checks every 30 seconds for expired pending payments
- **Cleanup Service**: Auto-expires after 5 minutes if no transaction

---

### 2. **`processing`**
**Transaction Submitted** - Payment transaction sent to blockchain

#### Conditions:
- ✅ User submitted payment transaction
- ✅ Transaction hash exists
- ✅ Transaction is being verified on Starknet blockchain
- ✅ Waiting for transaction confirmation

#### Fields Set:
- `status: 'processing'`
- `transactionHash`: Blockchain transaction hash
- All previous `pending` fields remain

#### What Happens:
- Backend cron job (every 30 seconds) checks transaction status
- Calls Starknet RPC to get transaction receipt
- Verifies `execution_status` from blockchain
- Status will change to:
  - `completed` if transaction succeeded
  - `failed` if transaction failed on blockchain

#### Where It's Used:
- **Frontend**: Shows "Processing" badge with loading animation
- **Backend**: `paymentVerificationService.js` monitors these transactions

#### Transition Logic:
```javascript
// Backend checks pending/processing payments
const pendingPayments = await Payment.find({
  status: { $in: ['pending', 'processing'] },
  transactionHash: { $exists: true, $ne: null }
}).limit(50);

// For each payment, verify on blockchain
const receipt = await provider.getTransactionReceipt(payment.transactionHash);

if (receipt.execution_status === 'SUCCEEDED') {
  payment.status = 'completed'; // ✅ Success
} else {
  payment.status = 'failed'; // ❌ Failed
}
```

---

### 3. **`completed`**
**Payment Successful** - Transaction confirmed on blockchain

#### Conditions:
- ✅ Transaction hash exists
- ✅ Blockchain confirms `execution_status: 'SUCCEEDED'`
- ✅ PaymentProcessed event found in transaction logs
- ✅ Merchant stats updated (earnings, transaction count)

#### Fields Set:
- `status: 'completed'`
- `transactionHash`: Blockchain transaction hash
- `payerAddress`: Customer's wallet address
- `grossAmount`: Total amount paid (wei format)
- `netAmount`: Amount after 2% fee (wei format)
- `feeAmount`: Platform fee (wei format)
- `blockNumber`: Block where transaction was mined
- `completedAt`: Completion timestamp

#### What Happens:
- Payment is marked as successful
- Merchant's `totalEarnings` increased by `netAmount`
- Merchant's `transactionCount` incremented by 1
- QR code cannot be reused
- Shows in merchant dashboard as completed

#### Where It's Used:
- **Merchant Dashboard**: Counts toward total earnings
- **User Payment History**: Shows successful payments
- **Transaction Details Modal**: Full payment breakdown

#### Important Notes:
- ⚠️ **Cannot be changed back** - Final successful state
- ⚠️ **Merchant stats updated only once** - Protected against duplicates
- ✅ **Has transaction hash** - Always present
- ✅ **Immune to expiration** - Will never be marked as expired

---

### 4. **`failed`**
**Transaction Failed** - Blockchain rejected the transaction

#### Conditions:
- ✅ Transaction hash exists
- ✅ Transaction was submitted to blockchain
- ❌ Blockchain returned `execution_status !== 'SUCCEEDED'`
- ❌ Transaction reverted or failed validation

#### Fields Set:
- `status: 'failed'`
- `transactionHash`: Failed transaction hash
- Previous fields from `pending`/`processing` state

#### What Happens:
- Transaction failed on blockchain (insufficient gas, contract error, etc.)
- Payment is marked as failed
- No merchant stats updated
- Customer needs to retry payment with new QR code

#### Where It's Used:
- **Frontend**: Shows "Failed" badge in red
- **Backend**: Logged for debugging
- **Cleanup Service**: Old failed payments deleted after 30 days

#### Common Causes:
- Insufficient token balance
- Gas estimation failed
- Contract execution reverted
- Network congestion

---

### 5. **`expired`**
**QR Code Expired** - Payment window closed without transaction

#### Conditions:
- ✅ QR code generated but not used
- ✅ 5-minute expiration time passed
- ❌ **No transaction hash** (critical - no payment was attempted)
- ❌ QR code is no longer valid

#### Fields Set:
- `status: 'expired'`
- `expiresAt`: Past timestamp (< current time)
- All original `pending` fields

#### What Happens:
- Auto-expired by cleanup services:
  - `cleanupService.js` - Every 5 minutes
  - `merchantController.js` - On payment fetch
  - `paymentVerificationService.js` - Every 30 seconds
- Customer must request new QR code
- No merchant stats affected
- Old expired records deleted after 30 days

#### Where It's Used:
- **Frontend**: Shows "Expired" badge in gray
- **Payment Page**: Blocks payment attempt, shows expiration message
- **Cleanup Service**: Automatically expires old QR codes

#### Protection Against False Expiration:
```javascript
// ✅ ONLY expire if no transaction was made
const result = await Payment.updateMany(
  {
    status: { $in: ['pending', 'processing'] },
    expiresAt: { $exists: true, $lte: now },
    transactionHash: { $exists: false } // KEY: No payment attempted
  },
  {
    $set: { status: 'expired' }
  }
);
```

This ensures that if a payment was made before expiration, it will become `completed` instead of `expired`.

---

## Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         QR Code Generated                        │
│                         status: pending                          │
│                     expiresAt: now + 5 min                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
   ┌─────────┐               ┌──────────────┐
   │ Payment │               │  Time > 5min │
   │ Made    │               │  No TxHash   │
   └────┬────┘               └──────┬───────┘
        │                           │
        ▼                           ▼
  ┌──────────────┐           ┌──────────┐
  │ processing   │           │ expired  │ ◄── FINAL STATE
  │ + txHash     │           │          │     (No payment made)
  └──────┬───────┘           └──────────┘
         │
         │ Blockchain Verification
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐  ┌─────────┐
│completed│  │ failed  │ ◄── FINAL STATES
│ SUCCESS │  │ ERROR   │     (Payment attempted)
└─────────┘  └─────────┘
```

---

## Status Transition Rules

| Current Status | Can Transition To | Trigger |
|----------------|-------------------|---------|
| `pending` | `processing` | User submits transaction |
| `pending` | `expired` | QR expires without payment |
| `processing` | `completed` | Blockchain confirms success |
| `processing` | `failed` | Blockchain rejects transaction |
| `expired` | ❌ **NONE** | Final state - no transitions |
| `completed` | ❌ **NONE** | Final state - no transitions |
| `failed` | ❌ **NONE** | Final state - no transitions |

---

## Key Business Rules

### ✅ **Merchant Stats Updates**

Only `completed` payments affect merchant statistics:

```javascript
// Merchant stats ONLY updated for newly completed payments
if (payment.status === 'completed' && !wasAlreadyCompleted) {
  merchant.totalEarnings += netAmount;
  merchant.transactionCount += 1;
}
```

### ✅ **Transaction Hash Protection**

Payments with transaction hashes are **immune to expiration**:

```javascript
// Will NEVER expire a payment that has a transaction hash
transactionHash: { $exists: false } // Required for expiration
```

### ✅ **Duplicate Prevention**

- Transaction hash is checked before creating/updating payments
- Merchant stats only incremented once per transaction
- Completed payments cannot be re-processed

### ✅ **QR Code Reuse Prevention**

- Each QR code (paymentId) is unique
- Completed QR codes cannot be reused
- Expired QR codes cannot be paid

---

## Database Query Examples

### Find All Active Payments
```javascript
const activePayments = await Payment.find({
  status: { $in: ['pending', 'processing'] },
  expiresAt: { $gt: new Date() }
});
```

### Find Completed Transactions for Merchant
```javascript
const completed = await Payment.find({
  merchantAddress: normalizeAddress(merchantAddr),
  status: 'completed'
}).sort({ completedAt: -1 });
```

### Find Payments Needing Verification
```javascript
const needsVerification = await Payment.find({
  status: { $in: ['pending', 'processing'] },
  transactionHash: { $exists: true, $ne: null }
}).limit(50);
```

### Find Expired QR Codes to Clean
```javascript
const toExpire = await Payment.find({
  status: { $in: ['pending', 'processing'] },
  expiresAt: { $lte: new Date() },
  transactionHash: { $exists: false } // KEY: No payment made
});
```

---

## Frontend Display

### Status Colors & Badges

| Status | Color | Icon | Background |
|--------|-------|------|------------|
| `pending` | Yellow | ⏱️ Clock | `bg-yellow-100` |
| `processing` | Blue | 🔄 Loader | `bg-blue-100` |
| `completed` | Green | ✅ Check | `bg-green-100` |
| `failed` | Red | ❌ X Circle | `bg-red-100` |
| `expired` | Gray | ⏰ Alert | `bg-gray-100` |

### User-Facing Labels

```typescript
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'processing': return 'Processing';
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    case 'expired': return 'Expired';
    default: return 'Unknown';
  }
};
```

---

## Cron Jobs & Automation

### Payment Verification Cron
**Runs**: Every 30 seconds
**File**: `server.js`

```javascript
cron.schedule('*/30 * * * * *', async () => {
  await checkPendingPayments();
});
```

**What it does**:
- Finds `pending`/`processing` payments with transaction hashes
- Verifies each on Starknet blockchain
- Updates to `completed` or `failed`

### Cleanup Service
**Runs**: Every 5 minutes
**File**: `cleanupService.js`

```javascript
setInterval(autoExpirePendingPayments, 5 * 60 * 1000);
```

**What it does**:
- Finds payments past `expiresAt` with no transaction
- Marks them as `expired`
- Deletes old expired/failed payments after 30 days

---

## Troubleshooting

### ❌ Payment shows as "expired" but transaction was made
**Cause**: Transaction submitted but cleanup service expired it before verification
**Fix**: Applied in latest version - payments with `transactionHash` cannot be expired

### ❌ Duplicate completed transactions
**Cause**: Both frontend and cron job verified same transaction
**Fix**: Added duplicate prevention - only updates merchant stats once

### ❌ Payment stuck in "processing"
**Cause**: Transaction failed or not found on blockchain
**Solution**:
- Check transaction on [Starkscan](https://sepolia.starkscan.co/)
- If failed, status will update to `failed` on next cron run
- If not found, may be still pending on blockchain

---

## Related Files

### Backend
- `/backend/src/models/Payment.js` - Payment schema definition
- `/backend/src/controllers/paymentController.js` - Payment verification logic
- `/backend/src/services/paymentVerificationService.js` - Background verification
- `/backend/src/services/cleanupService.js` - Auto-expiration service
- `/backend/src/controllers/merchantController.js` - Merchant payment queries

### Frontend
- `/frontend/contexts/PaymentsContext.tsx` - Payment state management
- `/frontend/app/merchant/dashboard/components/TransactionList.tsx` - Display logic
- `/frontend/app/merchant/dashboard/components/TransactionDetailsModal.tsx` - Details view

---

## Summary

StarkPay uses a **5-status system** that ensures:
- ✅ Clear payment lifecycle tracking
- ✅ No double-counting of merchant earnings
- ✅ Automatic QR code expiration
- ✅ Blockchain-verified payments
- ✅ Protection against duplicate transactions

Every payment starts as `pending`, can briefly be `processing`, and must end in one of three final states: `completed`, `failed`, or `expired`.
