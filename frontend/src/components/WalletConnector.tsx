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
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Network Badge */}
        <div className="hidden md:flex items-center space-x-3 rounded-xl bg-[rgb(var(--color-surface-elevated))] px-4 py-2.5 border border-[rgb(var(--color-border))] shadow-sm">
          <div 
            className={`h-2.5 w-2.5 rounded-full ${getNetworkColor()}`}
            aria-label={`Connected to ${getNetworkName()}`}
          ></div>
          <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{getNetworkName()}</span>
        </div>

        {/* Address Display */}
        <div className="flex items-center space-x-3 rounded-xl bg-[rgb(var(--color-surface-elevated))] px-4 py-2.5 border border-[rgb(var(--color-border))] touch-target shadow-sm">
          <Wallet className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden="true" />
          <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
            {formatAddress(walletState.address)}
          </span>
          <button
            onClick={handleCopyAddress}
            className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface))] transition-all duration-200 interactive-focus touch-target"
            aria-label={copied ? 'Address copied' : 'Copy wallet address'}
            title={copied ? 'Address copied!' : 'Copy address'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[rgb(var(--color-success))]" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[rgb(var(--color-text-tertiary))]" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-2 rounded-xl bg-[rgb(var(--color-error-light))] px-3 sm:px-4 py-2.5 border border-[rgb(var(--color-error))]/20 hover:bg-[rgb(var(--color-error))]/10 transition-all duration-200 text-[rgb(var(--color-error))] hover:text-red-600 interactive-focus touch-target shadow-sm"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={walletState.isConnecting}
      className="btn-primary mobile-button mobile-touch-target interactive-focus flex items-center space-x-2"
      aria-label={walletState.isConnecting ? 'Connecting to wallet...' : 'Connect your Starknet wallet'}
    >
      {walletState.isConnecting ? (
        <>
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline font-medium">Connect Wallet</span>
          <span className="sm:hidden font-medium">Connect</span>
        </>
      )}
    </button>
  );
}