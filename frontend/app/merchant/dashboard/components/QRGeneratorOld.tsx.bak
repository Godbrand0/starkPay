'use client';

import { useState, useEffect } from 'react';
import { generateQRCode, getPaymentDetails } from '@/lib/api';
import { TOKENS } from '@/lib/contract';
import { QrCode, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface QRGeneratorProps {
  merchantAddress: string;
}

export function QRGenerator({ merchantAddress }: QRGeneratorProps) {
  const [tokenAddress, setTokenAddress] = useState(TOKENS.STRK.address);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qrData, setQrData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Fetch payment details when QR is generated
  useEffect(() => {
    if (qrData?.paymentId) {
      const fetchDetails = async () => {
        try {
          const details = await getPaymentDetails(qrData.paymentId);
          setPaymentDetails(details);
          setIsExpired(details.isExpired || false);
        } catch (error) {
          console.error('Failed to fetch payment details:', error);
        }
      };
      fetchDetails();
      // Refresh details every 10 seconds
      const interval = setInterval(fetchDetails, 10000);
      return () => clearInterval(interval);
    }
  }, [qrData?.paymentId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsGenerating(true);
    setIsExpired(false);
    try {
      const data = await generateQRCode(merchantAddress, {
        tokenAddress,
        amount,
        description,
      });
      setQrData(data);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleRegenerateQR = () => {
    setQrData(null);
    setPaymentDetails(null);
    setIsExpired(false);
  };

  const handleCopyUrl = () => {
    if (qrData?.paymentUrl) {
      navigator.clipboard.writeText(qrData.paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrData?.qrCode) {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `payment-qr-${qrData.paymentId}.png`;
      link.click();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <QrCode className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate QR Code</h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token
          </label>
          <select
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={TOKENS.STRK.address}>{TOKENS.STRK.symbol} - {TOKENS.STRK.name}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment for..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {qrData && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            {/* Countdown Timer */}
            {paymentDetails?.expiresAt && !paymentDetails?.isCompleted && (
              <div className="mb-4 flex justify-center">
                <CountdownTimer
                  expiresAt={new Date(paymentDetails.expiresAt)}
                  onExpire={handleExpire}
                />
              </div>
            )}

            {/* QR Code with expiration overlay */}
            <div className="relative inline-block mb-4">
              <img
                src={qrData.qrCode}
                alt="Payment QR Code"
                className={`mx-auto border-4 rounded-lg ${
                  isExpired || paymentDetails?.isExpired || paymentDetails?.isCompleted
                    ? 'border-gray-300 dark:border-gray-600 opacity-40'
                    : 'border-primary-100 dark:border-primary-900'
                }`}
                style={{ width: '200px', height: '200px' }}
              />
              {(isExpired || paymentDetails?.isExpired || paymentDetails?.isCompleted) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold transform rotate-12">
                    {paymentDetails?.isCompleted ? 'USED' : 'EXPIRED'}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isExpired && !paymentDetails?.isExpired && !paymentDetails?.isCompleted ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy URL
                  </>
                )}
              </button>
            </div>
            ) : (
              <button
                onClick={handleRegenerateQR}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mx-auto"
              >
                <RefreshCw className="h-5 w-5" />
                Generate New QR Code
              </button>
            )}
            {qrData.paymentUrl && !isExpired && !paymentDetails?.isExpired && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 break-all">
                {qrData.paymentUrl}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
