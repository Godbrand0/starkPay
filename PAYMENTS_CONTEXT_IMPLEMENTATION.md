# PaymentsContext Implementation

## Overview

Implemented a React Context (`PaymentsContext`) to manage payment state globally across the merchant dashboard. This eliminates duplicate API calls and provides a single source of truth for payment data with automatic real-time updates.

## Benefits

✅ **Single source of truth** - One place to manage all payment data
✅ **No duplicate API calls** - Components share the same data
✅ **Automatic updates** - 5-second polling handled by context
✅ **Real-time calculations** - totalEarnings and transactionCount computed automatically
✅ **Cleaner components** - Components only consume data, don't fetch it
✅ **Easy to extend** - Add new computed values or features in one place

## Architecture

```
PaymentsProvider (wraps dashboard)
    ├── Manages payments state
    ├── Auto-fetches every 5 seconds
    ├── Computes derived values
    └── Provides data via usePayments() hook

Components consume via usePayments():
    ├── EarningsOverview (uses totalEarnings, transactionCount)
    ├── TransactionList (uses payments, isLoading)
    └── Future components can easily access the same data
```

## Files Created/Modified

### 1. **Created: [frontend/contexts/PaymentsContext.tsx](frontend/contexts/PaymentsContext.tsx:1)**

The main context provider with:

```typescript
interface PaymentsContextType {
  payments: Payment[];              // All payments (pending + completed)
  isLoading: boolean;               // Loading state
  error: string | null;             // Error state
  refresh: () => Promise<void>;     // Manual refresh function
  completedPayments: Payment[];     // Filtered completed payments
  pendingPayments: Payment[];       // Filtered pending/processing payments
  totalEarnings: bigint;            // Sum of all netAmounts
  transactionCount: number;         // Count of completed payments
}
```

**Features:**
- Auto-refresh every 5 seconds (configurable)
- Computed values updated automatically
- Error handling
- Loading states
- Manual refresh capability

### 2. **Modified: [frontend/app/merchant/dashboard/components/TransactionList.tsx](frontend/app/merchant/dashboard/components/TransactionList.tsx:1)**

**Before:**
```typescript
export function TransactionList({ merchantAddress }: TransactionListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getMerchantPayments(merchantAddress, 20);
      setPayments(data.payments || []);
    };
    fetchPayments();
    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, [merchantAddress]);
  // ...
}
```

**After:**
```typescript
export function TransactionList() {
  const { payments, isLoading } = usePayments();
  // That's it! No more fetching logic
}
```

### 3. **Modified: [frontend/app/merchant/dashboard/components/EarningsOverview.tsx](frontend/app/merchant/dashboard/components/EarningsOverview.tsx:1)**

**Before:**
```typescript
export function EarningsOverview({ merchantData }: EarningsOverviewProps) {
  const totalEarnings = merchantData?.stats?.totalEarnings || '0';
  const transactionCount = merchantData?.stats?.transactionCount || 0;
  const totalEarningsBigInt = BigInt(totalEarnings);
  const formattedEarnings = formatTokenAmount(totalEarningsBigInt, 18, 4);
  // ...
}
```

**After:**
```typescript
export function EarningsOverview() {
  const { totalEarnings, transactionCount } = usePayments();
  const formattedEarnings = formatTokenAmount(totalEarnings, 18, 4);
  // Cleaner and always up-to-date!
}
```

### 4. **Modified: [frontend/app/merchant/dashboard/page.tsx](frontend/app/merchant/dashboard/page.tsx:135)**

Wrapped the dashboard content with PaymentsProvider:

```typescript
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <PaymentsProvider merchantAddress={address!} autoRefreshInterval={5000}>
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
      {/* ... */}
    </div>

    <EarningsOverview />

    <div className="grid lg:grid-cols-2 gap-8 mt-8">
      <QRGenerator merchantAddress={address!} />
      <TransactionList />
    </div>
  </PaymentsProvider>
</main>
```

## How It Works

### Data Flow

```
1. PaymentsProvider mounts
   ↓
2. Fetches initial payment data
   ↓
3. Sets up 5-second interval
   ↓
4. On each interval:
   - Fetches latest payments from backend
   - Updates payments state
   - Automatically recomputes:
     * completedPayments
     * pendingPayments
     * totalEarnings (sum of netAmounts)
     * transactionCount
   ↓
5. All child components re-render with new data
```

### Computed Values

The context automatically calculates:

```typescript
// Completed payments only
const completedPayments = payments.filter(p => p.status === 'completed');

// Pending/processing payments
const pendingPayments = payments.filter(p =>
  p.status === 'pending' || p.status === 'processing'
);

// Total earnings (sum of net amounts from completed payments)
const totalEarnings = completedPayments.reduce((sum, payment) => {
  if (payment.netAmount) {
    return sum + BigInt(payment.netAmount);
  }
  return sum;
}, BigInt(0));

// Transaction count
const transactionCount = completedPayments.length;
```

## Integration with Backend Cron Job

This context works seamlessly with the backend cron job:

```
Backend Cron (every 30s)          Frontend Context (every 5s)
        ↓                                    ↓
Checks pending payments           Fetches all payments from DB
        ↓                                    ↓
Verifies on blockchain            Gets updated payment statuses
        ↓                                    ↓
Updates MongoDB                   Displays real-time changes
   (pending → completed)             (yellow → green)
```

**Result:** Payments automatically change from pending to completed in the UI within 5-35 seconds after blockchain confirmation!

## Usage Example

Any component can now easily access payment data:

```typescript
import { usePayments } from '@/contexts/PaymentsContext';

function MyComponent() {
  const {
    payments,           // All payments
    completedPayments,  // Completed only
    pendingPayments,    // Pending/processing only
    totalEarnings,      // BigInt of total net earnings
    transactionCount,   // Number of completed payments
    isLoading,          // Loading state
    error,              // Error if any
    refresh             // Manual refresh function
  } = usePayments();

  return (
    <div>
      <h1>Total: {formatTokenAmount(totalEarnings, 18, 4)} STRK</h1>
      <p>Transactions: {transactionCount}</p>
      <button onClick={refresh}>Refresh Now</button>
    </div>
  );
}
```

## Configuration

The PaymentsProvider accepts these props:

```typescript
<PaymentsProvider
  merchantAddress={address}         // Required: merchant wallet address
  autoRefreshInterval={5000}        // Optional: milliseconds (default 5000)
>
  {children}
</PaymentsProvider>
```

To disable auto-refresh, set `autoRefreshInterval={0}`.

## Performance Considerations

✅ **Efficient:** Only one API call per refresh cycle (not per component)
✅ **Optimized:** Uses useCallback to prevent unnecessary re-renders
✅ **Cleanup:** Properly clears intervals on unmount
✅ **Caching:** Shared data across all components

## Future Enhancements

Potential improvements:

1. **WebSocket support** - Replace polling with real-time events when RPC providers support it
2. **Optimistic updates** - Update UI immediately, confirm with blockchain later
3. **Pagination** - Load more payments on demand
4. **Filtering** - Add filters for status, date range, amount
5. **Sorting** - Sort by different fields
6. **Export** - Export payment history to CSV/JSON

## Testing

To verify the context is working:

1. Open merchant dashboard
2. Create a new payment (generate QR, pay from wallet)
3. Watch the payment appear as "pending" (yellow)
4. Within 30 seconds, backend cron verifies it
5. Within 5 seconds after that, frontend fetches updated status
6. Payment changes to "completed" (green)
7. Total earnings and transaction count update automatically

## Deployment Notes

When deploying to production:

1. The context works with the deployed backend automatically
2. No environment variables needed for the context itself
3. Backend cron job must be running on Render
4. RPC endpoint must be configured correctly
5. CORS must allow frontend domain

## Summary

The PaymentsContext provides a clean, efficient way to manage payment data across the merchant dashboard. It eliminates code duplication, provides real-time updates, and makes it easy to add new features that depend on payment data.

All components now have instant access to:
- All payments (pending and completed)
- Real-time earnings calculations
- Transaction counts
- Loading and error states

This architecture is scalable, maintainable, and provides a great user experience with automatic real-time updates!
