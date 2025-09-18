'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Transaction, PaginationInfo } from '@/types';
import { Search, Filter, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TransactionHistoryProps {
  merchantAddress: string;
}

export function TransactionHistory({ merchantAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [merchantAddress, currentPage, statusFilter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMerchantTransactions(merchantAddress, {
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });

      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Show error state when API is not available
      setTransactions([]);
      setPagination(null);
      toast.error('Failed to load transactions. Backend API not available.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleExportTransactions = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    toast.success('Export feature would be implemented here');
  };

  const getStatusColor = (status: string) => {
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

  const filteredTransactions = transactions.filter(transaction =>
    searchTerm === '' ||
    transaction.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.payerAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.formattedGrossAmount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block h-8 w-8 border-4 border-orange-500 border-r-transparent rounded-full"></div>
        <p className="text-slate-400 mt-4">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Transaction History</h3>
        <button
          onClick={handleExportTransactions}
          className="flex items-center space-x-2 rounded-lg bg-slate-700 px-3 py-2 text-white hover:bg-slate-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {`${transaction.transactionHash.slice(0, 10)}...${transaction.transactionHash.slice(-8)}`}
                        </div>
                        <div className="text-sm text-slate-400">
                          From: {`${transaction.payerAddress.slice(0, 8)}...${transaction.payerAddress.slice(-6)}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {transaction.formattedNetAmount}
                        </div>
                        <div className="text-sm text-slate-400">
                          Gross: {transaction.formattedGrossAmount}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-orange-400">
                        {transaction.formattedFeeAmount}
                      </div>
                      <div className="text-sm text-slate-400">
                        {transaction.feePercentage}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://sepolia.starkscan.co/tx/${transaction.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-400"
                        title="View on Starkscan"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-slate-400 mb-4">No transactions found</div>
          {searchTerm || statusFilter ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="text-orange-500 hover:text-orange-400"
            >
              Clear filters
            </button>
          ) : (
            <p className="text-slate-500">Transactions will appear here once you start receiving payments</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-800 rounded-lg border border-slate-700 px-6 py-3">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} transactions
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}