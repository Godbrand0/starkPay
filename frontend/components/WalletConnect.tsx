'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWallet, disconnectWallet as disconnectWalletAction } from '@/store/walletSlice';
import { connectWallet, disconnectWallet, getConnectedWallet } from '@/lib/wallet';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const wallet = await getConnectedWallet();
      if (wallet) {
        dispatch(setWallet({ address: wallet.address, chainId: wallet.chainId }));
      }
    };
    checkConnection();
  }, [dispatch]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const wallet = await connectWallet();
      if (wallet) {
        dispatch(setWallet({ address: wallet.address, chainId: wallet.chainId }));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    dispatch(disconnectWalletAction());
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-green-100 text-green-800 hidden md:block px-4 py-2 rounded-lg font-medium">
          {shortenAddress(address)}
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}