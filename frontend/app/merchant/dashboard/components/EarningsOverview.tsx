'use client';

import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { formatTokenAmount } from '@/lib/contract';

interface EarningsOverviewProps {
  merchantData: any;
}

export function EarningsOverview({ merchantData }: EarningsOverviewProps) {
  const totalEarnings = merchantData?.stats?.totalEarnings || '0';
  const transactionCount = merchantData?.stats?.transactionCount || 0;

  // Convert totalEarnings string to BigInt for formatting
  const totalEarningsBigInt = BigInt(totalEarnings);
  const formattedEarnings = formatTokenAmount(totalEarningsBigInt, 18);

  // Calculate average
  const averageEarnings = transactionCount > 0
    ? formatTokenAmount(totalEarningsBigInt / BigInt(transactionCount), 18)
    : '0.000000000000000000';

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-green-100 rounded-lg p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {formattedEarnings} <span className="text-xl text-gray-600">STRK</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-100 rounded-lg p-3">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">Transactions</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{transactionCount}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-purple-100 rounded-lg p-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">Average Transaction</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {averageEarnings} <span className="text-xl text-gray-600">STRK</span>
        </p>
      </div>
    </div>
  );
}