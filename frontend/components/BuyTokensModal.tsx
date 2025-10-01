'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader } from 'lucide-react';
import { buyTokensWithETH, getETHBalance, getTokenPrice, formatTokenAmount, parseTokenAmount, TOKENS } from '@/lib/contract';
import { getConnectedWallet } from '@/lib/wallet';

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  tokenSymbol: string;
  requiredAmount: string;
  userAddress: string;
  onSuccess: () => void;
}

export function BuyTokensModal({
  isOpen,
  onClose,
  tokenAddress,
  tokenSymbol,
  requiredAmount,
  userAddress,
  onSuccess
}: BuyTokensModalProps) {
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [tokenPrice, setTokenPrice] = useState<bigint>(0n);
  const [ethAmount, setEthAmount] = useState<string>('');
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userAddress) {
      fetchData();
    }
  }, [isOpen, userAddress, tokenAddress]);

  useEffect(() => {
    // Calculate estimated tokens when ETH amount changes
    if (ethAmount && tokenPrice > 0n) {
      try {
        const ethAmountBigInt = parseTokenAmount(ethAmount, 18);
        const tokensAmount = (ethAmountBigInt * 1000000n) / tokenPrice;
        setEstimatedTokens(formatTokenAmount(tokensAmount, 6));
      } catch {
        setEstimatedTokens('0');
      }
    } else {
      setEstimatedTokens('0');
    }
  }, [ethAmount, tokenPrice]);

  const fetchData = async () => {
    try {
      const [balance, price] = await Promise.all([
        getETHBalance(userAddress),
        getTokenPrice(tokenAddress)
      ]);

      setEthBalance(formatTokenAmount(balance, 18));
      setTokenPrice(price);

      // Auto-calculate ETH needed for required amount
      if (price > 0n && requiredAmount) {
        const required = parseTokenAmount(requiredAmount, 6);
        const ethNeeded = (required * price) / 1000000n;
        setEthAmount(formatTokenAmount(ethNeeded, 18));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleBuy = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setError('Please enter a valid ETH amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = await getConnectedWallet();
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      const ethAmountBigInt = parseTokenAmount(ethAmount, 18);
      const minTokens = parseTokenAmount(requiredAmount, 6);

      const txHash = await buyTokensWithETH(
        wallet.account,
        tokenAddress,
        ethAmountBigInt,
        minTokens
      );

      console.log('Tokens purchased! Tx:', txHash);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Failed to buy tokens');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const pricePerToken = tokenPrice > 0n
    ? formatTokenAmount(tokenPrice, 18)
    : 'Not set';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Buy {tokenSymbol}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Your ETH Balance</p>
            <p className="text-lg font-semibold text-gray-900">{ethBalance} ETH</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Token Price</p>
            <p className="text-lg font-semibold text-blue-900">
              {pricePerToken} ETH per {tokenSymbol}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-700 mb-1">Required Amount</p>
            <p className="text-lg font-semibold text-orange-900">
              {requiredAmount} {tokenSymbol}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ETH Amount to Spend
            </label>
            <input
              type="text"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">You will receive</p>
              <p className="text-xl font-bold text-green-900">
                ~{estimatedTokens} {tokenSymbol}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-green-600" />
          </div>

          <button
            onClick={handleBuy}
            disabled={isLoading || !ethAmount || parseFloat(ethAmount) <= 0 || tokenPrice === 0n}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Buying Tokens...
              </>
            ) : (
              'Buy Tokens with ETH'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Transaction will approve ETH spending and purchase tokens in one step
          </p>
        </div>
      </div>
    </div>
  );
}
