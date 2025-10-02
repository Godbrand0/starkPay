'use client';

import { useState } from 'react';
import { generateQRCode } from '@/lib/api';
import { TOKENS } from '@/lib/contract';
import { QrCode, Download, Copy, Check } from 'lucide-react';

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsGenerating(true);
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <QrCode className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Generate QR Code</h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <select
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option className='text-black' value={TOKENS.STRK.address}>{TOKENS.STRK.symbol} - {TOKENS.STRK.name}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black  focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment for..."
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {qrData && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <img
              src={qrData.qrCode}
              alt="Payment QR Code"
              className="mx-auto mb-4 border-4 border-primary-100 rounded-lg"
              style={{ width: '200px', height: '200px' }}
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-lg transition-colors"
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
            {qrData.paymentUrl && (
              <p className="mt-4 text-xs text-gray-500 break-all">
                {qrData.paymentUrl}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
0x0693a1b59ab67b6441eb72bf20750737056a3dee52755564fd51e5180eb3dc09