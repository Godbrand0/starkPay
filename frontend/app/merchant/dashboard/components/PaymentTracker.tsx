'use client';

import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getPaymentDetails } from '@/lib/api';

interface Payment {
  paymentId: string;
  amount: string;
  tokenAddress: string;
  status: 'pending' | 'completed' | 'expired';
  description?: string;
  createdAt: string;
}

interface PaymentTrackerProps {
  merchantAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentTracker({ merchantAddress, isOpen, onClose }: PaymentTrackerProps) {
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recent payments
  useEffect(() => {
    if (!isOpen || !merchantAddress) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const { getMerchantPayments } = await import('@/lib/api');
        const data = await getMerchantPayments(merchantAddress, 10);
        setRecentPayments(data.payments || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        setIsLoading(false);
      }
    };

    fetchPayments();

    // Refresh payments every 5 seconds
    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, [isOpen, merchantAddress]);

  // Poll for payment status updates
  useEffect(() => {
    if (!isOpen || recentPayments.length === 0) return;

    const interval = setInterval(async () => {
      // Update payment statuses
      const updatedPayments = await Promise.all(
        recentPayments.map(async (payment) => {
          if (payment.status === 'completed') return payment;

          try {
            const details = await getPaymentDetails(payment.paymentId);
            return {
              ...payment,
              status: details.status || payment.status,
            };
          } catch (error) {
            return payment;
          }
        })
      );

      setRecentPayments(updatedPayments);
    }, 10000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen, recentPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader className="h-5 w-5 text-gray-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader className="h-6 w-6 text-white animate-spin" />
            <h2 className="text-xl font-bold text-white">Payment Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent payment requests</p>
              <p className="text-sm text-gray-500 mt-2">
                Generate a QR code to start receiving payments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.paymentId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {payment.amount} STRK
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>

                  {payment.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {payment.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 font-mono">
                    ID: {payment.paymentId.slice(0, 16)}...
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> Payment statuses update
              automatically every 3 seconds. Keep this window open to track incoming
              payments in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
