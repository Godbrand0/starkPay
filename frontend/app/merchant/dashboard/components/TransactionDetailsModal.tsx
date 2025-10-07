'use client';

import { X, ExternalLink, Copy, Check, Clock, CheckCircle, Loader, QrCode, XCircle } from 'lucide-react';
import { useState } from 'react';
import { formatTokenAmount } from '@/lib/contract';
import { CountdownTimer } from './CountdownTimer';
import type { Payment } from '@/contexts/PaymentsContext';

interface TransactionDetailsModalProps {
  payment: Payment;
  onClose: () => void;
}

export function TransactionDetailsModal({ payment, onClose }: TransactionDetailsModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
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
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getStatusIcon(payment.status)}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
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
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(payment.status)}`}>
              {payment.status.toUpperCase()}
            </span>
            {payment.expiresAt && (payment.status === 'pending' || payment.status === 'processing') && (
              <CountdownTimer
                expiresAt={new Date(payment.expiresAt)}
                onExpire={() => {}}
              />
            )}
          </div>

          {/* QR Code for pending payments */}
          {payment.qrCode && (payment.status === 'pending' || payment.status === 'processing') && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
              <img
                src={payment.qrCode}
                alt="Payment QR Code"
                className="mx-auto border-4 border-primary-100 dark:border-primary-900 rounded-lg"
                style={{ width: '200px', height: '200px' }}
              />
              {payment.paymentUrl && (
                <button
                  onClick={() => copyToClipboard(payment.paymentUrl!, setCopiedUrl)}
                  className="mt-3 flex items-center justify-center gap-2 mx-auto bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Payment Link
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Transaction Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment ID</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{payment.paymentId}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount Requested</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{parseFloat(payment.amount).toFixed(3)} STRK</p>
              </div>
            </div>

            {payment.description && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-900 dark:text-white">{payment.description}</p>
              </div>
            )}

            {payment.transactionHash && (
              <>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all flex-1">{payment.transactionHash}</p>
                    <button
                      onClick={() => copyToClipboard(payment.transactionHash!, setCopiedHash)}
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

                {payment.status === 'completed' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Net Amount (You Receive)</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">
                          {payment.netAmount ? formatTokenAmount(BigInt(payment.netAmount), 18, 4) : '0'} STRK
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Fee</p>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {payment.feeAmount ? formatTokenAmount(BigInt(payment.feeAmount), 18, 4) : '0'} STRK
                        </p>
                      </div>
                    </div>

                    {payment.payerAddress && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{shortenAddress(payment.payerAddress)}</p>
                      </div>
                    )}

                    {payment.blockNumber && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Block Number</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{payment.blockNumber}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">{new Date(payment.createdAt).toLocaleString()}</p>
              </div>

              {payment.completedAt && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(payment.completedAt).toLocaleString()}</p>
                </div>
              )}
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
