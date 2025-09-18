'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import { apiClient } from '@/lib/api';
import { contractService } from '@/lib/contracts';
import type { Token, QRCodeData } from '@/types';
import { QrCode, Download, Copy, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeGeneratorProps {
  merchantAddress: string;
}

interface PaymentForm {
  tokenAddress: string;
  amount: string;
  description: string;
}

export function QRCodeGenerator({ merchantAddress }: QRCodeGeneratorProps) {
  const [supportedTokens, setSupportedTokens] = useState<{ [key: string]: Token }>({});
  const [platformFee, setPlatformFee] = useState<{ percentage: number; basisPoints: number }>({ percentage: 2, basisPoints: 200 });
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [copied, setCopied] = useState(false);
  const [calculation, setCalculation] = useState<{
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
  } | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<PaymentForm>();
  const watchedAmount = watch('amount');
  const watchedToken = watch('tokenAddress');

  useEffect(() => {
    fetchSupportedTokens();
  }, []);

  useEffect(() => {
    if (watchedAmount && watchedToken) {
      calculatePayment();
    }
  }, [watchedAmount, watchedToken]);

  const fetchSupportedTokens = async () => {
    try {
      const response = await apiClient.getSupportedTokens();
      if (response.success && response.data) {
        setSupportedTokens(response.data.tokens);
        setPlatformFee(response.data.platformFee);
      }
    } catch (error) {
      console.error('Error fetching supported tokens:', error);
      toast.error('Failed to load supported tokens');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const calculatePayment = async () => {
    if (!watchedAmount || !watchedToken || parseFloat(watchedAmount) <= 0) {
      setCalculation(null);
      return;
    }

    try {
      const response = await apiClient.calculatePayment({
        amount: watchedAmount,
        tokenAddress: watchedToken,
      });

      if (response.success && response.data) {
        setCalculation({
          grossAmount: response.data.calculation.grossAmount,
          feeAmount: response.data.calculation.feeAmount,
          netAmount: response.data.calculation.netAmount,
        });
      }
    } catch (error) {
      console.error('Error calculating payment:', error);
      setCalculation(null);
    }
  };

  const handleGenerateQR = async (data: PaymentForm) => {
    setIsGenerating(true);
    try {
      const response = await apiClient.generatePaymentQR(merchantAddress, {
        tokenAddress: data.tokenAddress,
        amount: data.amount,
        description: data.description,
      });

      if (response.success && response.data) {
        setQrData(response.data);
        toast.success('QR code generated successfully!');
      } else {
        throw new Error(response.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPaymentUrl = async () => {
    if (qrData?.paymentUrl) {
      try {
        await navigator.clipboard.writeText(qrData.paymentUrl);
        setCopied(true);
        toast.success('Payment URL copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy payment URL');
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `payment-qr-${qrData.paymentId}.png`;
      link.href = qrData.qrCodeDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded');
    }
  };

  const handleNewPayment = () => {
    setQrData(null);
    setCalculation(null);
    reset();
  };

  if (isLoadingTokens) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block h-8 w-8 border-4 border-orange-500 border-r-transparent rounded-full"></div>
        <p className="text-slate-400 mt-4">Loading supported tokens...</p>
      </div>
    );
  }

  if (qrData) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-slate-800 p-6 border border-slate-700 text-center">
          <h3 className="text-xl font-semibold text-white mb-6">Payment QR Code</h3>
          
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg mb-6 inline-block">
            <QRCode value={qrData.paymentUrl} size={200} />
          </div>

          {/* Payment Details */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-medium">
                {qrData.paymentData.amount} {supportedTokens[qrData.paymentData.tokenAddress]?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Description:</span>
              <span className="text-white">{qrData.paymentData.description || 'Payment'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment ID:</span>
              <span className="text-white font-mono text-sm">{qrData.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expires:</span>
              <span className="text-white">{new Date(qrData.expiresAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleCopyPaymentUrl}
              className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>

          <button
            onClick={handleNewPayment}
            className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate New QR</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
        <div className="text-center mb-6">
          <QrCode className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Generate Payment QR
          </h3>
          <p className="text-slate-400 text-sm">
            Create a QR code for customers to scan and pay
          </p>
        </div>

        <form onSubmit={handleSubmit(handleGenerateQR)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Token *
            </label>
            <select
              {...register('tokenAddress', { required: 'Please select a token' })}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select token</option>
              {Object.entries(supportedTokens).map(([address, token]) => (
                <option key={address} value={address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            {errors.tokenAddress && (
              <p className="text-red-400 text-sm mt-1">{errors.tokenAddress.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount *
            </label>
            <input
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                pattern: {
                  value: /^\d+(\.\d{1,6})?$/,
                  message: 'Invalid amount format'
                }
              })}
              type="number"
              step="0.000001"
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              {...register('description')}
              type="text"
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              placeholder="Payment description (optional)"
            />
          </div>

          {/* Payment Calculation */}
          {calculation && (
            <div className="rounded-lg bg-slate-700 p-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Payment Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Customer pays:</span>
                <span className="text-white">{calculation.grossAmount.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Platform fee ({platformFee.percentage}%):</span>
                <span className="text-orange-400">-{calculation.feeAmount.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-slate-600 pt-2">
                <span className="text-slate-300">You receive:</span>
                <span className="text-green-400">{calculation.netAmount.toFixed(6)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 font-medium text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                <span>Generating QR...</span>
              </div>
            ) : (
              'Generate QR Code'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}