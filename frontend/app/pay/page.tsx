'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { WalletConnect } from '@/components/WalletConnect';
import { getPaymentDetails, verifyTransaction } from '@/lib/api';
import { processPayment, approveToken, checkTokenAllowance, getTokenBalance, formatTokenAmount, parseTokenAmount, TOKENS } from '@/lib/contract';
import { getConnectedWallet } from '@/lib/wallet';
import { openAnyWallet, isMobileDevice } from '@/lib/walletDeepLink';
import { QrCode, CheckCircle, XCircle, Loader, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAppSelector((state) => state.wallet);

  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'approving' | 'paying' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  // Get payment params from URL
  const merchantAddress = searchParams.get('m');
  const tokenAddress = searchParams.get('t');
  const amount = searchParams.get('a');
  const paymentId = searchParams.get('id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setIsLoading(false);
        return;
      }

      try {
        const details = await getPaymentDetails(paymentId);
        setPaymentDetails(details);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  // Auto-trigger wallet connection on mobile when page loads
  useEffect(() => {
    const autoConnectWallet = () => {
      if (isMobileDevice() && !isConnected && merchantAddress && tokenAddress && amount) {
        // Try to open wallet app using deep links
        openAnyWallet({ returnUrl: window.location.href });
      }
    };

    // Delay to ensure page is loaded
    const timer = setTimeout(autoConnectWallet, 1500);
    return () => clearTimeout(timer);
  }, [isConnected, merchantAddress, tokenAddress, amount]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !tokenAddress) return;

      try {
        const bal = await getTokenBalance(tokenAddress, address);
        setBalance(formatTokenAmount(bal, 18));
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    if (isConnected && address) {
      fetchBalance();
    }
  }, [address, isConnected, tokenAddress]);

  const handlePayment = async () => {
    if (!address || !isConnected) {
      alert('Please connect your wallet');
      return;
    }

    if (!merchantAddress || !tokenAddress || !amount) {
      alert('Invalid payment details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const wallet = await getConnectedWallet();
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      const amountBigInt = parseTokenAmount(amount, 18);
      const paymentProcessorAddress = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS!;

      // Check allowance
      console.log('Checking token allowance...');
      const allowance = await checkTokenAllowance(tokenAddress, address, paymentProcessorAddress);
      console.log('Current allowance:', allowance.toString(), 'Required:', amountBigInt.toString());

      if (allowance < amountBigInt) {
        // Need to approve
        console.log('Approving token...');
        setPaymentStatus('approving');
        const approveTxHash = await approveToken(wallet.account, tokenAddress, paymentProcessorAddress, amountBigInt);
        console.log('Token approved! Transaction hash:', approveTxHash);
      }

      // Process payment
      console.log('Processing payment...');
      setPaymentStatus('paying');
      const hash = await processPayment(wallet.account, merchantAddress, tokenAddress, amountBigInt);
      console.log('Payment successful! Transaction hash:', hash);

      // Verify transaction on backend to update merchant dashboard
      try {
        console.log('Verifying transaction on backend...');
        await verifyTransaction(hash);
        console.log('Transaction verified and recorded on backend');
      } catch (verifyError) {
        console.error('Failed to verify transaction on backend (payment still successful):', verifyError);
        // Don't fail the payment if backend verification fails
      }

      setTxHash(hash);
      setPaymentStatus('success');
    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTokenSymbol = (addr: string) => {
    if (addr === TOKENS.STRK.address) return TOKENS.STRK.symbol;
    return 'TOKEN';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!merchantAddress || !tokenAddress || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Link</h2>
          <p className="text-gray-600 mb-6">
            This payment link is invalid or incomplete. Please check the QR code or link.
          </p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if QR code has expired or been used
  if (paymentDetails && (paymentDetails.isExpired || paymentDetails.isCompleted)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <XCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {paymentDetails.isCompleted ? 'QR Code Already Used' : 'QR Code Expired'}
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentDetails.isCompleted
              ? 'This QR code has already been used for a payment and cannot be reused.'
              : 'This QR code has expired. QR codes are valid for 5 minutes after generation.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact the merchant to generate a new payment QR code.
          </p>
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of {amount} {getTokenSymbol(tokenAddress)} has been processed.
          </p>
          {txHash && (
            <a
              href={`https://sepolia.starkscan.co/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm break-all"
            >
              View transaction
            </a>
          )}
          <div className="mt-6">
            <Link
              href="/"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-block font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <QrCode className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">StarkPay</span>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Details</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Merchant</p>
              <p className="font-semibold text-gray-900">
                {paymentDetails?.merchantName || 'Merchant'}
              </p>
              <p className="text-xs font-mono text-gray-600 mt-1">
                {merchantAddress.slice(0, 10)}...{merchantAddress.slice(-8)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                {amount} <span className="text-lg">{getTokenSymbol(tokenAddress)}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Platform fee (2%): {(parseFloat(amount) * 0.02).toFixed(6)} {getTokenSymbol(tokenAddress)}
              </p>
            </div>

            {paymentDetails?.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{paymentDetails.description}</p>
              </div>
            )}

            {isConnected && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Your Balance</p>
                <p className="font-semibold text-blue-900">
                  {balance} {getTokenSymbol(tokenAddress)}
                </p>
                {parseFloat(balance) < parseFloat(amount) && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Insufficient balance. You need {(parseFloat(amount) - parseFloat(balance)).toFixed(6)} more {getTokenSymbol(tokenAddress)}
                  </p>
                )}
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center space-y-3">
              <p className="text-gray-600 mb-4">Connect your wallet to proceed with payment</p>
              <WalletConnect />
              {isMobileDevice() && (
                <>
                  <button
                    onClick={() => openAnyWallet({ returnUrl: window.location.href })}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Wallet className="h-5 w-5" />
                    Open Wallet App
                  </button>
                  <p className="text-xs text-gray-500">
                    Tap "Open Wallet App" to launch your Starknet wallet (ArgentX or Braavos)
                  </p>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {paymentStatus === 'approving' && 'Approving token...'}
                  {paymentStatus === 'paying' && 'Processing payment...'}
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          )}

          <Link
            href="/"
            className="mt-4 flex items-center justify-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}