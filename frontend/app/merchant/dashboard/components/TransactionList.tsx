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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <History className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No payments yet</p>
          <p className="text-xs text-gray-400 mt-2">Generate a QR code to start receiving payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.paymentId}
              className={`border rounded-lg p-4 transition-colors ${
                payment.status === 'pending'
                  ? 'border-yellow-300 bg-yellow-50'
                  : payment.status === 'completed'
                  ? 'border-gray-200 hover:border-primary-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  {payment.transactionHash ? (
                    <>
                      <span className="text-sm font-medium text-gray-700">
                        {shortenAddress(payment.transactionHash)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(payment.transactionHash!)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedHash === payment.transactionHash ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <a
                        href={`https://sepolia.starkscan.co/tx/${payment.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {payment.amount} STRK
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>

              {payment.description && (
                <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
              )}

              {payment.status === 'completed' && payment.netAmount ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Net Amount</p>
                    <p className="font-semibold text-green-600">
                      {formatTokenAmount(BigInt(payment.netAmount), 18, 4)} STRK
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fee</p>
                    <p className="font-medium text-gray-700">
                      {formatTokenAmount(BigInt(payment.feeAmount || '0'), 18, 4)} STRK
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">From</p>
                    <p className="font-mono text-xs">{payment.payerAddress ? shortenAddress(payment.payerAddress) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="text-xs">{payment.completedAt ? new Date(payment.completedAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
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