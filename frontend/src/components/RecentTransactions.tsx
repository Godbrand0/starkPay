'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Transaction } from '@/types';
import { Clock, ExternalLink, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRecentTransactions({ limit: 10 });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to load recent transactions:', error);
      
      // Show empty state when API is not available
      setTransactions([]);
      setSummary({
        total: 0,
        completed: 0,
        pending: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20';
      case 'failed':
        return 'bg-red-900/20 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-900/20 text-slate-400 border-slate-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-orange-500 border-r-transparent rounded-full"></div>
          <p className="text-slate-400 mt-4">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            {transactions.length > 0 ? 'Live' : 'No Data'}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{summary.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{summary.completed}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{summary.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)} ${
                      transaction.status === 'pending' ? 'animate-pulse' : ''
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white truncate">
                          {transaction.formattedNetAmount}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {`${transaction.payerAddress.slice(0, 8)}...${transaction.payerAddress.slice(-6)}`}
                          {' → '}
                          {`${transaction.merchantAddress.slice(0, 8)}...${transaction.merchantAddress.slice(-6)}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(transaction.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <a
                  href={`https://sepolia.starkscan.co/tx/${transaction.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-orange-400 transition-colors"
                  title="View on Starkscan"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No recent transactions</p>
          <p className="text-slate-500 text-sm mt-2">
            Transaction activity will appear here
          </p>
        </div>
      )}

      {/* View All Link */}
      {transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <button className="w-full text-center text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
}