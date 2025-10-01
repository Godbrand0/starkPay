'use client';

import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

interface EarningsOverviewProps {
  merchantAddress: string;
  merchantData: any;
}

export function EarningsOverview({ merchantAddress, merchantData }: EarningsOverviewProps) {
  const totalEarnings = merchantData?.stats?.totalEarnings || 0;
  const transactionCount = merchantData?.stats?.transactionCount || 0;

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
          ${totalEarnings.toFixed(2)}
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
          ${transactionCount > 0 ? (totalEarnings / transactionCount).toFixed(2) : '0.00'}
        </p>
      </div>
    </div>
  );
}