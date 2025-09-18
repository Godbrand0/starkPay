'use client';

import { useState, useEffect } from 'react';
import { walletManager } from '@/lib/wallet';
import type { WalletState } from '@/lib/wallet';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function WalletConnector() {
  const [walletState, setWalletState] = useState<WalletState>(walletManager.getState());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    try {
      await walletManager.connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      
      // Show more helpful error messages
      if (errorMessage.includes('No Starknet wallet found')) {
        toast.error('No wallet found! Please install ArgentX or Braavos wallet extension and refresh the page.');
      } else if (errorMessage.includes('rejected')) {
        toast.error('Connection was rejected. Please try again and approve the connection.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await walletManager.disconnectWallet();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const handleCopyAddress = async () => {
    if (walletState.address) {
      try {
        await navigator.clipboard.writeText(walletState.address);
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy address');
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = () => {
    if (!walletState.chainId) return 'Unknown';
    const chainId = walletState.chainId.toString();
    if (chainId.includes('mainnet') || chainId === '0x534e5f4d41494e') return 'Mainnet';
    if (chainId.includes('sepolia') || chainId === '0x534e5f5345504f4c4941') return 'Sepolia';
    return 'Unknown Network';
  };

  const getNetworkColor = () => {
    const networkName = getNetworkName();
    if (networkName === 'Mainnet') return 'bg-green-500';
    if (networkName === 'Sepolia') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Network Badge */}
        <div className="hidden md:flex items-center space-x-2 rounded-lg bg-slate-800 px-3 py-2 border border-slate-700">
          <div 
            className={`h-2 w-2 rounded-full ${getNetworkColor()}`}
            aria-label={`Connected to ${getNetworkName()}`}
          ></div>
          <span className="text-sm text-slate-300">{getNetworkName()}</span>
        </div>

        {/* Address Display */}
        <div className="flex items-center space-x-2 rounded-lg bg-slate-800 px-3 py-2 border border-slate-700 touch-target">
          <Wallet className="h-4 w-4 text-orange-500" aria-hidden="true" />
          <span className="text-sm font-medium text-white">
            {formatAddress(walletState.address)}
          </span>
          <button
            onClick={handleCopyAddress}
            className="p-1 rounded hover:bg-slate-700 transition-colors interactive-focus touch-target"
            aria-label={copied ? 'Address copied' : 'Copy wallet address'}
            title={copied ? 'Address copied!' : 'Copy address'}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-red-900/20 px-2 sm:px-3 py-2 border border-red-500/20 hover:bg-red-900/30 transition-colors text-red-400 hover:text-red-300 interactive-focus touch-target"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-sm">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={walletState.isConnecting}
      className="btn-primary mobile-button mobile-touch-target interactive-focus"
      aria-label={walletState.isConnecting ? 'Connecting to wallet...' : 'Connect your Starknet wallet'}
    >
      {walletState.isConnecting ? (
        <>
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </>
      )}
    </button>
  );
}