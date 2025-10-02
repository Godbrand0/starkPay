'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMerchantPayments } from '@/lib/api';

export interface Payment {
  paymentId: string;
  transactionHash?: string;
  payerAddress?: string;
  tokenAddress: string;
  amount: string;
  grossAmount?: string;
  netAmount?: string;
  feeAmount?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  description?: string;
  createdAt: string;
  completedAt?: string;
  blockNumber?: number;
}

interface PaymentsContextType {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  completedPayments: Payment[];
  pendingPayments: Payment[];
  totalEarnings: bigint;
  transactionCount: number;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

interface PaymentsProviderProps {
  children: React.ReactNode;
  merchantAddress: string;
  autoRefreshInterval?: number; // milliseconds, default 5000
}

export function PaymentsProvider({
  children,
  merchantAddress,
  autoRefreshInterval = 5000
}: PaymentsProviderProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!merchantAddress) return;

    try {
      setError(null);
      const data = await getMerchantPayments(merchantAddress, 50);
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [merchantAddress]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      refresh();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [refresh, autoRefreshInterval]);

  // Computed values
  const completedPayments = payments.filter(p => p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing');

  const totalEarnings = completedPayments.reduce((sum, payment) => {
    if (payment.netAmount) {
      return sum + BigInt(payment.netAmount);
    }
    return sum;
  }, BigInt(0));

  const transactionCount = completedPayments.length;

  const value: PaymentsContextType = {
    payments,
    isLoading,
    error,
    refresh,
    completedPayments,
    pendingPayments,
    totalEarnings,
    transactionCount,
  };

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
}
