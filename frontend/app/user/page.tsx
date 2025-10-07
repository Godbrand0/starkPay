'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { WalletConnect } from '@/components/WalletConnect';
import { getUserPayments } from '@/lib/api';
import { QrCode, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { TOKENS } from '@/lib/contract';

const ThemeToggle = dynamic(() => import('@/components/ThemeToggle').then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-9 h-9" />
});

interface Payment {
  paymentId: string;
  merchantAddress: string;
  merchantName: string;
  tokenAddress: string;
  amount: string;
  grossAmount?: string;
  description?: string;
  transactionHash: string;
  completedAt: string;
  selectedCurrency?: string;
  usdAmount?: number;
  ngnAmount?: number;
}

export default function UserPaymentHistory() {
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchPayments = async () => {
      if (!address || !isConnected) {
        setPayments([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getUserPayments(address, currentPage, limit);
        setPayments(data.payments);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [address, isConnected, currentPage]);

  const getTokenSymbol = (addr: string) => {
    if (addr === TOKENS.STRK.address) return TOKENS.STRK.symbol;
    return 'TOKEN';
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">StarkPay</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
            {totalCount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} {totalCount === 1 ? 'payment' : 'payments'}
              </span>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your wallet to view your payment history
              </p>
              <WalletConnect />
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Payments Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't made any payments yet. Scan a QR code to make your first payment.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Merchant
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.paymentId}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {payment.merchantName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {payment.merchantAddress.slice(0, 10)}...{payment.merchantAddress.slice(-8)}
                            </p>
                            {payment.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {payment.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {parseFloat(payment.amount).toFixed(4)} {getTokenSymbol(payment.tokenAddress)}
                            </p>
                            {(payment.usdAmount || payment.ngnAmount) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                                {payment.usdAmount && <p>≈ ${payment.usdAmount.toFixed(2)} USD</p>}
                                {payment.ngnAmount && <p>≈ ₦{payment.ngnAmount.toFixed(2)} NGN</p>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(payment.completedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(payment.completedAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <a
                            href={`https://sepolia.starkscan.co/tx/${payment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 text-sm"
                          >
                            <span className="font-mono">
                              {payment.transactionHash.slice(0, 8)}...
                            </span>
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t dark:border-gray-700">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
