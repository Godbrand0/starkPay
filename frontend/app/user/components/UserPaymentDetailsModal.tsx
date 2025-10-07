'use client';

import { X, ExternalLink, Copy, Check, Store } from 'lucide-react';
import { useState } from 'react';
import { TOKENS } from '@/lib/contract';

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

interface UserPaymentDetailsModalProps {
  payment: Payment;
  onClose: () => void;
}

export function UserPaymentDetailsModal({ payment, onClose }: UserPaymentDetailsModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedMerchant, setCopiedMerchant] = useState(false);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTokenSymbol = (addr: string) => {
    if (addr === TOKENS.STRK.address) return TOKENS.STRK.symbol;
    return 'TOKEN';
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
              <Store className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Receipt</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Paid */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <p className="text-sm text-green-600 dark:text-green-400 mb-2">Amount Paid</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-300">
              {parseFloat(payment.amount).toFixed(4)} {getTokenSymbol(payment.tokenAddress)}
            </p>
            {(payment.usdAmount || payment.ngnAmount) && (
              <div className="mt-3 space-y-1">
                {payment.usdAmount && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ≈ ${payment.usdAmount.toFixed(2)} USD
                  </p>
                )}
                {payment.ngnAmount && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ≈ ₦{payment.ngnAmount.toFixed(2)} NGN
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            {/* Merchant Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Paid To</p>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {payment.merchantName}
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {payment.merchantAddress}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(payment.merchantAddress, setCopiedMerchant)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedMerchant ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {payment.description && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-900 dark:text-white">{payment.description}</p>
              </div>
            )}

            {/* Transaction Hash */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all flex-1">
                  {payment.transactionHash}
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyToClipboard(payment.transactionHash, setCopiedHash)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {copiedHash ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${payment.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Payment Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment ID</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {payment.paymentId}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(payment.completedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(payment.completedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {payment.selectedCurrency && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Payment Currency</p>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {payment.selectedCurrency}
                </p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-6 py-3 rounded-full font-semibold">
              ✓ Payment Completed
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
