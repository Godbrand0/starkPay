'use client';

import { useState, useEffect } from 'react';
import { WalletConnector } from '@/components/WalletConnector';
import { MerchantDashboard } from '@/components/MerchantDashboard';
import { PaymentScanner } from '@/components/PaymentScanner';
import { RecentTransactions } from '@/components/RecentTransactions';
import { PlatformStats } from '@/components/PlatformStats';
import { walletManager } from '@/lib/wallet';
import { contractService } from '@/lib/contracts';
import type { WalletState } from '@/lib/wallet';
import { CreditCard, QrCode, BarChart3, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [walletState, setWalletState] = useState<WalletState>(walletManager.getState());
  const [activeTab, setActiveTab] = useState<'merchant' | 'payment' | 'analytics'>('merchant');
  const [isMerchantRegistered, setIsMerchantRegistered] = useState<boolean>(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkMerchantRegistration = async () => {
      if (walletState.isConnected && walletState.address) {
        setIsCheckingRegistration(true);
        try {
          const isRegistered = await contractService.getMerchantRegistrationStatus(walletState.address);
          setIsMerchantRegistered(isRegistered);
        } catch (error) {
          console.error('Error checking merchant registration:', error);
        } finally {
          setIsCheckingRegistration(false);
        }
      }
    };

    checkMerchantRegistration();
  }, [walletState.address, walletState.isConnected]);

  const tabs = [
    {
      id: 'merchant' as const,
      name: 'Merchant',
      icon: CreditCard,
      description: 'Manage your merchant account and generate payment QR codes',
    },
    {
      id: 'payment' as const,
      name: 'Pay',
      icon: QrCode,
      description: 'Scan QR codes to make payments',
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: BarChart3,
      description: 'View platform statistics and transaction data',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Skip Link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-orange-600 text-white px-4 py-2 rounded-br-lg font-medium"
      >
        Skip to main content
      </a>
      
      {/* Demo Mode Banner */}
      <div 
        className="bg-yellow-900/20 border-b border-yellow-500/20 px-4 py-3" 
        role="banner" 
        aria-label="Demo mode notification"
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full bg-yellow-500" 
              aria-hidden="true"
            ></div>
            <span className="text-yellow-200">
              <strong>Demo Mode</strong> - Connect wallet to interact with Starknet contracts
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 touch-target">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">StarkPay</h1>
                <p className="text-xs sm:text-sm text-slate-400">QR Payments on Starknet</p>
              </div>
            </div>
            <WalletConnector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!walletState.isConnected && (
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 sm:mb-8 heading-1">
                Accept Crypto Payments
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2">
                  Instantly
                </span>
              </h2>
              <p className="mb-8 sm:mb-10 body-large max-w-2xl mx-auto">
                Generate QR codes, accept USDC/USDT payments, and track transactions
                on Starknet with just 2% platform fee.
              </p>
              
              {/* Wallet Installation Instructions */}
              <div className="mb-8 sm:mb-10 rounded-xl bg-slate-800/50 p-6 sm:p-8 border border-slate-700/50 mobile-card">
                <h3 className="heading-4 mb-4">Get Started</h3>
                <p className="body-base mb-6 max-w-lg mx-auto">
                  To use StarkPay, you'll need a Starknet wallet. Install one of these wallets:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-md mx-auto">
                  <a
                    href="https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mobile-button mobile-touch-target interactive-focus"
                    aria-label="Install ArgentX wallet extension"
                  >
                    Install ArgentX
                  </a>
                  <a
                    href="https://chrome.google.com/webstore/detail/braavos-smart-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary mobile-button mobile-touch-target interactive-focus"
                    aria-label="Install Braavos wallet extension"
                  >
                    Install Braavos
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 tablet-layout">
                <div className="card-hover p-6 sm:p-8 mobile-card group">
                  <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <Users className="h-8 w-8 text-orange-500" aria-hidden="true" />
                  </div>
                  <h3 className="heading-5 mb-3">For Merchants</h3>
                  <p className="body-small">
                    Generate payment QR codes and manage your transactions
                  </p>
                </div>
                <div className="card-hover p-6 sm:p-8 mobile-card group">
                  <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <QrCode className="h-8 w-8 text-orange-500" aria-hidden="true" />
                  </div>
                  <h3 className="heading-5 mb-3">Easy Payments</h3>
                  <p className="body-small">
                    Scan QR codes to pay with USDC or USDT tokens
                  </p>
                </div>
                <div className="card-hover p-6 sm:p-8 mobile-card group sm:col-span-2 lg:col-span-1">
                  <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <TrendingUp className="h-8 w-8 text-orange-500" aria-hidden="true" />
                  </div>
                  <h3 className="heading-5 mb-3">Real-time Analytics</h3>
                  <p className="body-small">
                    Track your earnings and transaction history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      {walletState.isConnected && (
        <>
          {/* Navigation Tabs */}
          <div className="border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm sticky top-[73px] sm:top-[81px] z-20">
            <div className="container mx-auto px-4">
              <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Main navigation">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      className={`flex items-center space-x-2 border-b-2 px-2 sm:px-3 py-4 text-sm font-medium transition-colors whitespace-nowrap touch-target interactive-focus ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-orange-500'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                      title={tab.description}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.name.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main id="main-content" className="container mx-auto px-4 py-8" role="main">
            {activeTab === 'merchant' && (
              <div id="tabpanel-merchant" role="tabpanel" aria-labelledby="tab-merchant" className="space-y-8">
                <div className="text-center">
                  <h2 className="heading-2 mb-2">Merchant Dashboard</h2>
                  <p className="body-base text-muted">
                    Manage your payments and generate QR codes for customers
                  </p>
                </div>
                
                {isCheckingRegistration ? (
                  <div className="text-center py-12" role="status" aria-live="polite">
                    <div className="loading-spinner-lg mx-auto" aria-hidden="true"></div>
                    <p className="body-base text-muted mt-4">
                      Checking merchant registration<span className="loading-dots"></span>
                    </p>
                    <p className="body-small text-slate-500 mt-2">
                      Verifying with blockchain...
                    </p>
                  </div>
                ) : (
                  <MerchantDashboard 
                    walletAddress={walletState.address!}
                    isRegistered={isMerchantRegistered}
                    onRegistrationChange={setIsMerchantRegistered}
                  />
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div id="tabpanel-payment" role="tabpanel" aria-labelledby="tab-payment" className="space-y-8">
                <div className="text-center">
                  <h2 className="heading-2 mb-2">Make Payment</h2>
                  <p className="body-base text-muted">
                    Scan a QR code to pay a merchant
                  </p>
                </div>
                <PaymentScanner walletAddress={walletState.address!} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div id="tabpanel-analytics" role="tabpanel" aria-labelledby="tab-analytics" className="space-y-8">
                <div className="text-center">
                  <h2 className="heading-2 mb-2">Platform Analytics</h2>
                  <p className="body-base text-muted">
                    View transaction statistics and platform metrics
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <PlatformStats />
                  <RecentTransactions />
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <p className="body-small text-slate-400">
                © 2024 StarkPay. Built on Starknet.
              </p>
              <div className="hidden sm:block h-4 w-px bg-slate-600"></div>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-500/20 text-xs">
                Demo Version - For testing purposes only
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                Platform Fee: 2%
              </span>
              <div className="hidden sm:block h-4 w-px bg-slate-600"></div>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                Network: {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Sepolia'}
              </span>
              <div className="hidden sm:block h-4 w-px bg-slate-600"></div>
              <a
                href="https://starkscan.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:text-orange-400 hover:border-orange-500/30 transition-all interactive-focus"
                aria-label="View Starknet transactions on Starkscan explorer"
              >
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}