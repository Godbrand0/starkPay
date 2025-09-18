'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import { apiClient } from '@/lib/api';
import { contractService } from '@/lib/contracts';
import type { Token, QRCodeData } from '@/types';
import { QrCode, Download, Copy, Check, RefreshCw, BarChart3 } from 'lucide-react';
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
      
      // Show error state when API is not available
      setSupportedTokens({});
      setPlatformFee({ percentage: 2.0, basisPoints: 200 });
      toast.error('Failed to load supported tokens. Backend API not available.');
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
      <div className="text-center py-16">
        <div className="loading-spinner-lg mx-auto"></div>
        <p className="text-[rgb(var(--color-text-secondary))] mt-6 font-medium">Loading supported tokens...</p>
        <p className="text-[rgb(var(--color-text-muted))] text-sm mt-2">Please wait while we fetch the available payment options</p>
      </div>
    );
  }

  if (qrData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 sm:p-12 text-center animate-scaleIn">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-secondary mx-auto mb-6 shadow-lg shadow-[rgb(var(--color-secondary))]/20">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h3 className="heading-3 mb-8 text-[rgb(var(--color-text-primary))]">Payment QR Code Generated</h3>
          
          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl mb-8 inline-block shadow-lg">
            <QRCode value={qrData.paymentUrl} size={240} />
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-8 text-left bg-[rgb(var(--color-surface-elevated))] p-6 rounded-2xl">
            <h4 className="heading-5 text-center mb-4 text-[rgb(var(--color-text-primary))]">Payment Details</h4>
            <div className="flex justify-between py-2">
              <span className="text-[rgb(var(--color-text-secondary))] font-medium">Amount:</span>
              <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                {qrData.paymentData.amount} {supportedTokens[qrData.paymentData.tokenAddress]?.symbol}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[rgb(var(--color-text-secondary))] font-medium">Description:</span>
              <span className="text-[rgb(var(--color-text-primary))]">{qrData.paymentData.description || 'Payment'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[rgb(var(--color-text-secondary))] font-medium">Payment ID:</span>
              <span className="text-[rgb(var(--color-text-primary))] font-mono text-sm">{qrData.paymentId}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[rgb(var(--color-text-secondary))] font-medium">Expires:</span>
              <span className="text-[rgb(var(--color-text-primary))]">{new Date(qrData.expiresAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handleCopyPaymentUrl}
              className="btn-secondary flex-1 flex items-center justify-center space-x-3"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
            <button
              onClick={handleDownloadQR}
              className="btn-secondary flex-1 flex items-center justify-center space-x-3"
            >
              <Download className="h-5 w-5" />
              <span>Download QR</span>
            </button>
          </div>

          <button
            onClick={handleNewPayment}
            className="btn-primary w-full flex items-center justify-center space-x-3"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Generate New QR Code</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 sm:p-12 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 shadow-lg shadow-[rgb(var(--color-primary))]/20">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h3 className="heading-3 mb-4 text-[rgb(var(--color-text-primary))]">
            Generate Payment QR Code
          </h3>
          <p className="body-large text-[rgb(var(--color-text-secondary))] max-w-md mx-auto">
            Create a secure QR code for customers to scan and pay instantly
          </p>
        </div>

        <form onSubmit={handleSubmit(handleGenerateQR)} className="mobile-form-spacing">
          <div>
            <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Token *
            </label>
            <select
              {...register('tokenAddress', { required: 'Please select a token' })}
              className={`input-primary ${errors.tokenAddress ? 'error-border' : ''}`}
            >
              <option value="">Select payment token</option>
              {Object.entries(supportedTokens).map(([address, token]) => (
                <option key={address} value={address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            {errors.tokenAddress && (
              <p className="error-state text-sm mt-2">{errors.tokenAddress.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
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
              className={`input-primary ${errors.amount ? 'error-border' : ''}`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="error-state text-sm mt-2">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Description
            </label>
            <input
              {...register('description')}
              type="text"
              className="input-primary"
              placeholder="Payment description (optional)"
            />
          </div>

          {/* Payment Calculation */}
          {calculation && (
            <div className="card-elevated p-6 space-y-4 animate-slideInUp">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgb(var(--color-accent))]/10">
                  <BarChart3 className="h-5 w-5 text-[rgb(var(--color-accent))]" />
                </div>
                <h4 className="heading-5 text-[rgb(var(--color-text-primary))]">Payment Breakdown</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[rgb(var(--color-surface))]">
                  <span className="text-[rgb(var(--color-text-secondary))] font-medium">Customer pays:</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">{calculation.grossAmount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[rgb(var(--color-surface))]">
                  <span className="text-[rgb(var(--color-text-secondary))] font-medium">Platform fee ({platformFee.percentage}%):</span>
                  <span className="text-[rgb(var(--color-warning))] font-semibold">-{calculation.feeAmount.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[rgb(var(--color-success-light))] border border-[rgb(var(--color-success))]/20">
                  <span className="text-[rgb(var(--color-text-primary))] font-semibold">You receive:</span>
                  <span className="text-[rgb(var(--color-success))] font-bold text-lg">{calculation.netAmount.toFixed(6)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary w-full mobile-button"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="loading-spinner"></div>
                <span>Generating QR Code...</span>
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