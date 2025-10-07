'use client';

import { useState, useEffect } from 'react';
import { usePayments } from '@/contexts/PaymentsContext';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { History, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Payment } from '@/contexts/PaymentsContext';

interface TransactionListProps {
  limit?: number;
  showViewAll?: boolean;
}

export function TransactionList({ limit = 5, showViewAll = true }: TransactionListProps) {
  const { payments, isLoading } = usePayments();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Update selectedPayment when payments update (e.g., status changes from pending to completed)
  useEffect(() => {
    if (selectedPayment) {
      const updatedPayment = payments.find(p => p.paymentId === selectedPayment.paymentId);
      if (updatedPayment && updatedPayment.status !== selectedPayment.status) {
        setSelectedPayment(updatedPayment);
      }
    }
  }, [payments, selectedPayment]);

  const displayedPayments = limit ? payments.slice(0, limit) : payments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'processing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'expired':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <>
      {selectedPayment && (
        <TransactionDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <History className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          </div>
          {showViewAll && payments.length > limit && (
            <Link
              href="/merchant/transactions"
              className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No transactions yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Generate a QR code to start receiving payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPayments.map((payment) => (
              <div
                key={payment.paymentId}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  payment.status === 'pending'
                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                    : payment.status === 'completed'
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Amount and info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {parseFloat(payment.amount).toFixed(3)} STRK
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {payment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {payment.description}
                        </p>
                      )}

                      {payment.transactionHash ? (
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          {shortenHash(payment.transactionHash)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created: {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      )}

                      {payment.status === 'completed' && payment.netAmount && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                          Net: {(parseFloat(payment.netAmount) / 1e18).toFixed(4)} STRK
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side - View Details button */}
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="ml-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
