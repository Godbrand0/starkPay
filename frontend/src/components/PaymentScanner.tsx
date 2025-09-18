'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { contractService } from '@/lib/contracts';
import { walletManager } from '@/lib/wallet';
import type { PaymentDetails } from '@/types';
import { Camera, Upload, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentScannerProps {
  walletAddress: string;
}

export function PaymentScanner({ walletAddress }: PaymentScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'url'>('url');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsePaymentUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const paymentId = pathParts[pathParts.length - 1];
      
      const params = {
        m: urlObj.searchParams.get('m') || '', // merchant address
        t: urlObj.searchParams.get('t') || '', // token address
        a: urlObj.searchParams.get('a') || '', // amount
        d: urlObj.searchParams.get('d') || '', // description
      };

      return { paymentId, params };
    } catch (error) {
      throw new Error('Invalid payment URL format');
    }
  };

  const handleUrlSubmit = async () => {
    if (!paymentUrl) {
      toast.error('Please enter a payment URL');
      return;
    }

    setIsLoading(true);
    try {
      const { paymentId, params } = parsePaymentUrl(paymentUrl);
      
      const response = await apiClient.getPaymentDetails(paymentId, params);
      if (response.success && response.data) {
        setPaymentDetails(response.data.paymentDetails);
      } else {
        throw new Error(response.error || 'Payment not found');
      }
    } catch (error) {
      console.error('Error loading payment details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would use a QR code scanning library
      // For now, we'll show an error message
      toast.error('QR code scanning from image is not implemented in this demo');
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error('Failed to scan QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails) {
      toast.error('No payment details available');
      return;
    }

    setIsPaying(true);
    setPaymentStatus('processing');
    
    try {
      const contractAddress = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS;
      if (!contractAddress) {
        throw new Error('Payment processor contract not configured');
      }

      // Check token balance
      toast.success('Checking token balance...');
      const balance = await contractService.getTokenBalance(
        paymentDetails.tokenAddress,
        walletAddress
      );
      
      const balanceFormatted = contractService.formatTokenAmount(
        balance,
        paymentDetails.tokenDecimals
      );
      
      if (parseFloat(balanceFormatted) < paymentDetails.grossAmount) {
        throw new Error(`Insufficient ${paymentDetails.tokenSymbol} balance. You have ${balanceFormatted} ${paymentDetails.tokenSymbol}.`);
      }

      // Check allowance
      toast.success('Checking token allowance...');
      const allowance = await contractService.getAllowance(
        paymentDetails.tokenAddress,
        walletAddress,
        contractAddress
      );
      
      const allowanceFormatted = contractService.formatTokenAmount(
        allowance,
        paymentDetails.tokenDecimals
      );
      
      // If allowance is insufficient, request approval first
      if (parseFloat(allowanceFormatted) < paymentDetails.grossAmount) {
        toast.success('Requesting token approval...');
        
        const amountToApprove = contractService.parseTokenAmount(
          (paymentDetails.grossAmount * 2).toString(), // Approve double the amount to avoid future approvals
          paymentDetails.tokenDecimals
        );
        
        const approvalTxHash = await walletManager.approveToken(
          paymentDetails.tokenAddress,
          contractAddress,
          amountToApprove
        );
        
        toast.success('Approval transaction submitted! Waiting for confirmation...');
        await walletManager.waitForTransaction(approvalTxHash);
        toast.success('Token approval confirmed!');
      }

      // Process payment
      toast.success('Processing payment...');
      const amountToPay = contractService.parseTokenAmount(
        paymentDetails.grossAmount.toString(),
        paymentDetails.tokenDecimals
      );
      
      const txHash = await walletManager.processPayment(
        contractAddress,
        paymentDetails.merchantAddress,
        paymentDetails.tokenAddress,
        amountToPay
      );
      
      setTransactionHash(txHash);
      toast.success('Payment transaction submitted!');
      
      // Wait for transaction confirmation
      toast.success('Waiting for transaction confirmation...');
      await walletManager.waitForTransaction(txHash);
      
      // Verify payment with backend
      toast.success('Verifying payment with backend...');
      const verifyResponse = await apiClient.verifyTransaction({
        transactionHash: txHash,
        paymentId: paymentDetails.paymentId,
      });
      
      if (verifyResponse.success) {
        setPaymentStatus('success');
        toast.success('Payment completed successfully!');
      } else {
        // Payment succeeded on-chain but backend verification failed
        console.warn('Backend verification failed but payment succeeded on-chain');
        setPaymentStatus('success');
        toast.success('Payment completed! (Backend verification pending)');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          toast.error('Transaction was rejected by user.');
        } else if (error.message.includes('insufficient funds')) {
          toast.error('Insufficient ETH for transaction fees.');
        } else if (error.message.includes('Insufficient')) {
          toast.error(error.message);
        } else if (error.message.includes('not configured')) {
          toast.error('Payment system not configured. Please contact support.');
        } else {
          toast.error(`Payment failed: ${error.message}`);
        }
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleNewPayment = () => {
    setPaymentDetails(null);
    setPaymentUrl('');
    setPaymentStatus('idle');
    setTransactionHash(null);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'success':
        return 'Payment completed successfully!';
      case 'error':
        return 'Payment failed. Please try again.';
      default:
        return null;
    }
  };

  if (paymentStatus !== 'idle') {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-slate-800 p-8 border border-slate-700 text-center">
          {getStatusIcon()}
          <h3 className="text-xl font-semibold text-white mt-4 mb-2">
            {getStatusMessage()}
          </h3>
          
          {transactionHash && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">Transaction Hash:</p>
              <div className="flex items-center justify-between">
                <code className="text-xs text-white font-mono">
                  {`${transactionHash.slice(0, 10)}...${transactionHash.slice(-8)}`}
                </code>
                <a
                  href={`https://sepolia.starkscan.co/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-400"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
          
          {paymentStatus === 'success' || paymentStatus === 'error' ? (
            <button
              onClick={handleNewPayment}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Make Another Payment
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (paymentDetails) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Payment Details
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Merchant:</span>
              <span className="text-white font-medium">{paymentDetails.merchantName}</span>
            </div>
            
            {paymentDetails.merchantDescription && (
              <div className="flex justify-between">
                <span className="text-slate-400">Description:</span>
                <span className="text-white">{paymentDetails.merchantDescription}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-slate-400">Token:</span>
              <span className="text-white">{paymentDetails.tokenSymbol}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white font-medium">
                {paymentDetails.grossAmount} {paymentDetails.tokenSymbol}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Platform Fee:</span>
              <span className="text-orange-400">
                {paymentDetails.feeAmount} {paymentDetails.tokenSymbol} ({paymentDetails.platformFeePercentage}%)
              </span>
            </div>
            
            <div className="flex justify-between font-medium border-t border-slate-600 pt-3">
              <span className="text-slate-300">Merchant Receives:</span>
              <span className="text-green-400">
                {paymentDetails.netAmount} {paymentDetails.tokenSymbol}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleNewPayment}
              className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 font-medium text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPaying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  <span>Paying...</span>
                </div>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Scan Payment QR Code
        </h3>
        
        {/* Scan Mode Selector */}
        <div className="flex rounded-lg bg-slate-700 p-1 mb-6">
          <button
            onClick={() => setScanMode('url')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              scanMode === 'url'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            URL
          </button>
          <button
            onClick={() => setScanMode('upload')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              scanMode === 'upload'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              scanMode === 'camera'
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Camera
          </button>
        </div>
        
        {/* URL Input */}
        {scanMode === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment URL
              </label>
              <input
                type="url"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                placeholder="Paste payment URL here..."
                className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              disabled={isLoading || !paymentUrl}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 font-medium text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load Payment'
              )}
            </button>
          </div>
        )}
        
        {/* File Upload */}
        {scanMode === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
            >
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">Click to upload QR code image</p>
              <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
        
        {/* Camera Scanner */}
        {scanMode === 'camera' && (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Camera scanning is not available in this demo</p>
            <p className="text-slate-500 text-sm">
              In a production app, this would open your device's camera to scan QR codes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}