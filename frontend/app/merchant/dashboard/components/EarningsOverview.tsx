'use client';

import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { formatTokenAmount } from '@/lib/contract';
import { usePayments } from '@/contexts/PaymentsContext';

export function EarningsOverview() {
  const { totalEarnings, transactionCount } = usePayments();

  const formattedEarnings = formatTokenAmount(totalEarnings, 18, 4);

  // Calculate average
  const averageEarnings = transactionCount > 0
    ? formatTokenAmount(totalEarnings / BigInt(transactionCount), 18, 4)
    : '0';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Earnings</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {formattedEarnings} <span className="text-xl text-gray-600 dark:text-gray-400">STRK</span>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Transactions</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{transactionCount}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Transaction</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {averageEarnings} <span className="text-xl text-gray-600 dark:text-gray-400">STRK</span>
        </p>
      </div>
    </div>
  );
}