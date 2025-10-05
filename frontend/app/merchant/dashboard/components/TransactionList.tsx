'use client';

import { useState } from 'react';
import { usePayments } from '@/contexts/PaymentsContext';
import { formatTokenAmount } from '@/lib/contract';
import { History, ExternalLink, Copy, Check, Clock, CheckCircle, Loader } from 'lucide-react';

export function TransactionList() {
  const { payments, isLoading } = usePayments();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <History className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No payments yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Generate a QR code to start receiving payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.paymentId}
              className={`border rounded-lg p-4 transition-colors ${
                payment.status === 'pending'
                  ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                  : payment.status === 'completed'
                  ? 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  {payment.transactionHash ? (
                    <>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {shortenAddress(payment.transactionHash)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(payment.transactionHash!)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {copiedHash === payment.transactionHash ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={`https://sepolia.starkscan.co/tx/${payment.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {payment.amount} STRK
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>

              {payment.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{payment.description}</p>
              )}

              {payment.status === 'completed' && payment.netAmount ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Net Amount</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatTokenAmount(BigInt(payment.netAmount), 18, 4)} STRK
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {formatTokenAmount(BigInt(payment.feeAmount || '0'), 18, 4)} STRK
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">From</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{payment.payerAddress ? shortenAddress(payment.payerAddress) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{payment.completedAt ? new Date(payment.completedAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Requested: {payment.amount} STRK</p>
                  <p className="text-xs">Created: {new Date(payment.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}