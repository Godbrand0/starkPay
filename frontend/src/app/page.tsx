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
    <div className="min-h-screen gradient-background">
      {/* Skip Link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-[rgb(var(--color-primary))] text-white px-4 py-2 rounded-br-2xl font-medium shadow-lg"
      >
        Skip to main content
      </a>
      
      {/* Demo Mode Banner */}
      <div 
        className="bg-[rgb(var(--color-warning-light))] border-b border-[rgb(var(--color-warning))]/20 px-4 py-3" 
        role="banner" 
        aria-label="Demo mode notification"
      >
        <div className="container-fluid">
          <div className="flex items-center justify-center space-x-3 text-sm">
            <div 
              className="h-2 w-2 rounded-full bg-[rgb(var(--color-warning))] animate-pulse" 
              aria-hidden="true"
            ></div>
            <span className="text-[rgb(var(--color-warning))] font-medium">
              <strong>Demo Mode</strong> - Connect your wallet to interact with Starknet contracts
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg sticky top-0 z-30 shadow-sm">
        <div className="container-fluid py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl gradient-primary touch-target shadow-lg shadow-[rgb(var(--color-primary))]/20">
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">StarkPay</h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-tertiary))] font-medium">Secure QR Payments on Starknet</p>
              </div>
            </div>
            <WalletConnector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!walletState.isConnected && (
        <section className="relative py-16 sm:py-20 lg:py-24">
          <div className="container-fluid text-center">
            <div className="mx-auto max-w-5xl">
              <div className="animate-fadeIn">
                <h2 className="mb-6 sm:mb-8 heading-1">
                  Accept Crypto Payments
                  <span className="block text-transparent bg-clip-text gradient-primary mt-3">
                    Effortlessly
                  </span>
                </h2>
                <p className="mb-10 sm:mb-12 body-large max-w-3xl mx-auto text-[rgb(var(--color-text-secondary))]">
                  Generate secure QR codes, accept USDC/USDT payments, and track transactions
                  on Starknet with transparent 2% platform fee. Built for businesses of all sizes.
                </p>
              </div>
              
              {/* Wallet Installation Instructions */}
              <div className="mb-12 sm:mb-16 animate-slideInUp">
                <div className="card-hover p-8 sm:p-10 mobile-card max-w-2xl mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 shadow-lg shadow-[rgb(var(--color-primary))]/20">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="heading-3 mb-4 text-[rgb(var(--color-text-primary))]">Get Started</h3>
                  <p className="body-base mb-8 max-w-lg mx-auto text-[rgb(var(--color-text-secondary))]">
                    To use StarkPay, you'll need a Starknet wallet. Choose from these trusted options:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-lg mx-auto">
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-scaleIn">
                <div className="card-hover p-8 sm:p-10 mobile-card group transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(var(--color-secondary))]/10 group-hover:bg-[rgb(var(--color-secondary))]/20 transition-all duration-300 mb-6">
                    <Users className="h-7 w-7 text-[rgb(var(--color-secondary))]" aria-hidden="true" />
                  </div>
                  <h3 className="heading-4 mb-4 text-[rgb(var(--color-text-primary))]">For Merchants</h3>
                  <p className="body-base text-[rgb(var(--color-text-secondary))]">
                    Generate secure payment QR codes and manage your transactions with comprehensive analytics
                  </p>
                </div>
                <div className="card-hover p-8 sm:p-10 mobile-card group transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(var(--color-primary))]/10 group-hover:bg-[rgb(var(--color-primary))]/20 transition-all duration-300 mb-6">
                    <QrCode className="h-7 w-7 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                  </div>
                  <h3 className="heading-4 mb-4 text-[rgb(var(--color-text-primary))]">Easy Payments</h3>
                  <p className="body-base text-[rgb(var(--color-text-secondary))]">
                    Scan QR codes to pay instantly with USDC or USDT tokens on Starknet
                  </p>
                </div>
                <div className="card-hover p-8 sm:p-10 mobile-card group transform hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgb(var(--color-accent))]/10 group-hover:bg-[rgb(var(--color-accent))]/20 transition-all duration-300 mb-6">
                    <TrendingUp className="h-7 w-7 text-[rgb(var(--color-accent))]" aria-hidden="true" />
                  </div>
                  <h3 className="heading-4 mb-4 text-[rgb(var(--color-text-primary))]">Real-time Analytics</h3>
                  <p className="body-base text-[rgb(var(--color-text-secondary))]">
                    Track your earnings and transaction history with detailed insights
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
          <div className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg sticky top-[73px] sm:top-[81px] z-20 shadow-sm">
            <div className="container-fluid">
              <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Main navigation">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      className={`flex items-center space-x-2 border-b-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap touch-target interactive-focus rounded-t-xl ${
                        activeTab === tab.id
                          ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5'
                          : 'border-transparent text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-elevated))]'
                      }`}
                      title={tab.description}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.name.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <main id="main-content" className="container-fluid py-8 sm:py-12" role="main">
            {activeTab === 'merchant' && (
              <div id="tabpanel-merchant" role="tabpanel" aria-labelledby="tab-merchant" className="space-y-8 sm:space-y-12 animate-fadeIn">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="heading-2 mb-4">Merchant Dashboard</h2>
                  <p className="body-large text-[rgb(var(--color-text-secondary))]">
                    Manage your payments and generate secure QR codes for customers
                  </p>
                </div>
                
                {isCheckingRegistration ? (
                  <div className="text-center py-16" role="status" aria-live="polite">
                    <div className="loading-spinner-lg mx-auto" aria-hidden="true"></div>
                    <p className="body-base text-[rgb(var(--color-text-secondary))] mt-6">
                      Checking merchant registration<span className="loading-dots"></span>
                    </p>
                    <p className="body-small text-[rgb(var(--color-text-muted))] mt-3">
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
              <div id="tabpanel-payment" role="tabpanel" aria-labelledby="tab-payment" className="space-y-8 sm:space-y-12 animate-fadeIn">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="heading-2 mb-4">Make Payment</h2>
                  <p className="body-large text-[rgb(var(--color-text-secondary))]">
                    Scan a QR code to pay a merchant securely
                  </p>
                </div>
                <PaymentScanner walletAddress={walletState.address!} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div id="tabpanel-analytics" role="tabpanel" aria-labelledby="tab-analytics" className="space-y-8 sm:space-y-12 animate-fadeIn">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="heading-2 mb-4">Platform Analytics</h2>
                  <p className="body-large text-[rgb(var(--color-text-secondary))]">
                    View transaction statistics and platform metrics
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                  <PlatformStats />
                  <RecentTransactions />
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg mt-auto">
        <div className="container-fluid py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 gap-6">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <p className="body-small text-[rgb(var(--color-text-tertiary))]">
                © 2024 StarkPay. Built on Starknet.
              </p>
              <div className="hidden sm:block h-4 w-px bg-[rgb(var(--color-border))]"></div>
              <span className="status-info">
                Demo Version - For testing purposes only
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-tertiary))]">Platform Fee:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">2%</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-[rgb(var(--color-border))]"></div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-tertiary))]">Network:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Sepolia'}
                </span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-[rgb(var(--color-border))]"></div>
              <a
                href="https://starkscan.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/5 hover:border-[rgb(var(--color-primary))]/30 hover:text-[rgb(var(--color-primary))] transition-all duration-200 interactive-focus"
                aria-label="View Starknet transactions on Starkscan explorer"
              >
                <span>Explorer</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}