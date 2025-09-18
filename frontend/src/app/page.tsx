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
import { CreditCard, QrCode, BarChart3, Users, TrendingUp, Shield, Zap, Globe, CheckCircle, Star, ArrowRight, Clock, DollarSign, Lock, Smartphone, ChevronDown } from 'lucide-react';

export default function HomePage() {
  const [walletState, setWalletState] = useState<WalletState>(walletManager.getState());
  const [activeTab, setActiveTab] = useState<'merchant' | 'payment' | 'analytics'>('merchant');
  const [isMerchantRegistered, setIsMerchantRegistered] = useState<boolean>(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    activeMerchants: 0,
    countries: 0
  });
  const [isStatsVisible, setIsStatsVisible] = useState(false);

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

  // Counter animation effect
  useEffect(() => {
    if (!walletState.isConnected) {
      const animateStats = () => {
        const targetStats = {
          totalTransactions: 125847,
          totalVolume: 2.3,
          activeMerchants: 8459,
          countries: 45
        };
        
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const easeOutProgress = 1 - Math.pow(1 - progress, 3);
          
          setStats({
            totalTransactions: Math.floor(targetStats.totalTransactions * easeOutProgress),
            totalVolume: Math.round(targetStats.totalVolume * easeOutProgress * 10) / 10,
            activeMerchants: Math.floor(targetStats.activeMerchants * easeOutProgress),
            countries: Math.floor(targetStats.countries * easeOutProgress)
          });
          
          if (step >= steps) {
            clearInterval(timer);
            setStats(targetStats);
          }
        }, interval);
        
        return () => clearInterval(timer);
      };
      
      // Start animation after a short delay
      const timeout = setTimeout(() => {
        setIsStatsVisible(true);
        animateStats();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [walletState.isConnected]);

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
      
      {/* Header */}
      <header className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg sticky top-0 z-30 shadow-sm animate-slideInUp">
        <div className="container-fluid py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-6 animate-slideInLeft">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl gradient-primary touch-target shadow-lg shadow-[rgb(var(--color-primary))]/20 group-hover:animate-float animate-glow">
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">StarkPay</h1>
                <p className="text-sm sm:text-base text-[rgb(var(--color-text-tertiary))] font-medium">Secure QR Payments on Starknet</p>
              </div>
            </div>
            <div className="animate-slideInRight animate-delay-200">
              <WalletConnector />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!walletState.isConnected && (
        <section className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/5 via-transparent to-[rgb(var(--color-secondary))]/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[rgb(var(--color-primary))]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[rgb(var(--color-secondary))]/10 rounded-full blur-3xl animate-float animate-delay-1000"></div>
          
          <div className="relative py-20 sm:py-28 lg:py-36">
            <div className="container-fluid text-center">
              <div className="mx-auto max-w-6xl">
                {/* Main Hero Content */}
                <div className="animate-fadeIn">
                  <div className="inline-flex items-center bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 rounded-full px-6 py-2 mb-8 animate-bounceIn">
                    <Zap className="h-4 w-4 text-[rgb(var(--color-primary))] mr-2" />
                    <span className="text-sm font-medium text-[rgb(var(--color-primary))]">Powered by Starknet</span>
                  </div>
                  
                  <h1 className="mb-8 sm:mb-10 text-4xl sm:text-5xl lg:text-7xl font-bold text-[rgb(var(--color-text-primary))] leading-tight tracking-tight">
                    The Future of
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-secondary))] to-[rgb(var(--color-accent))] mt-2 animate-shimmer">
                      Crypto Payments
                    </span>
                  </h1>
                  
                  <p className="mb-12 sm:mb-16 text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto text-[rgb(var(--color-text-secondary))] leading-relaxed">
                    Accept instant crypto payments with QR codes. Built on Starknet for lightning-fast,
                    secure transactions with minimal fees. Join thousands of merchants worldwide.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="mb-16 sm:mb-20 animate-slideInUp animate-delay-200">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-lg mx-auto">
                    <a
                      href="https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center bg-[rgb(var(--color-primary))] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[rgb(var(--color-primary-hover))] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[rgb(var(--color-primary))]/30 w-full sm:w-auto animate-glow"
                    >
                      <Smartphone className="h-5 w-5 mr-3" />
                      Get Started Now
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="https://chrome.google.com/webstore/detail/braavos-smart-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] font-semibold px-8 py-4 rounded-2xl border-2 border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/50 hover:bg-[rgb(var(--color-surface-elevated))] transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    >
                      <Globe className="h-5 w-5 mr-3" />
                      View Demo
                    </a>
                  </div>
                </div>
                
                {/* Live Statistics */}
                <div className={`mb-20 transition-all duration-1000 ${isStatsVisible ? 'animate-slideInUp opacity-100' : 'opacity-0'}`}>
                  <div className="bg-[rgb(var(--color-surface))]/80 backdrop-blur-lg border border-[rgb(var(--color-border))] rounded-3xl p-8 sm:p-12 shadow-2xl max-w-5xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2 text-center">
                      Trusted Worldwide
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-10 text-center">
                      Join our growing ecosystem of merchants and users
                    </p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="text-center group">
                        <div className="bg-[rgb(var(--color-primary))]/10 rounded-2xl p-6 mb-4 group-hover:bg-[rgb(var(--color-primary))]/20 transition-all duration-300">
                          <DollarSign className="h-8 w-8 text-[rgb(var(--color-primary))] mx-auto mb-3" />
                          <div className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] animate-countUp">
                            {stats.totalTransactions.toLocaleString()}
                          </div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))] font-medium">
                            Total Transactions
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-[rgb(var(--color-secondary))]/10 rounded-2xl p-6 mb-4 group-hover:bg-[rgb(var(--color-secondary))]/20 transition-all duration-300">
                          <TrendingUp className="h-8 w-8 text-[rgb(var(--color-secondary))] mx-auto mb-3" />
                          <div className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] animate-countUp">
                            ${stats.totalVolume}M
                          </div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))] font-medium">
                            Transaction Volume
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-[rgb(var(--color-accent))]/10 rounded-2xl p-6 mb-4 group-hover:bg-[rgb(var(--color-accent))]/20 transition-all duration-300">
                          <Users className="h-8 w-8 text-[rgb(var(--color-accent))] mx-auto mb-3" />
                          <div className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] animate-countUp">
                            {stats.activeMerchants.toLocaleString()}
                          </div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))] font-medium">
                            Active Merchants
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-[rgb(var(--color-warning))]/10 rounded-2xl p-6 mb-4 group-hover:bg-[rgb(var(--color-warning))]/20 transition-all duration-300">
                          <Globe className="h-8 w-8 text-[rgb(var(--color-warning))] mx-auto mb-3" />
                          <div className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] animate-countUp">
                            {stats.countries}
                          </div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))] font-medium">
                            Countries
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="space-y-24">
                  {/* Main Features Grid */}
                  <div className="animate-scaleIn animate-delay-300">
                    <h3 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-4 text-center">
                      Everything You Need for Crypto Payments
                    </h3>
                    <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-16 text-center max-w-3xl mx-auto">
                      StarkPay combines the power of Starknet with intuitive design to deliver the ultimate payment experience
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-100">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary))]/10 group-hover:bg-[rgb(var(--color-primary))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <QrCode className="h-8 w-8 text-[rgb(var(--color-primary))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Instant QR Payments</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Generate secure QR codes instantly. Customers scan and pay in seconds with USDC or USDT.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-primary))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          No setup fees
                        </div>
                      </div>

                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-200">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-secondary))]/10 group-hover:bg-[rgb(var(--color-secondary))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <Shield className="h-8 w-8 text-[rgb(var(--color-secondary))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Bank-Grade Security</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Built on Starknet's proven Layer 2 technology with cryptographic proofs and decentralized validation.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-secondary))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Zero-knowledge proofs
                        </div>
                      </div>

                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-300">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-accent))]/10 group-hover:bg-[rgb(var(--color-accent))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <Zap className="h-8 w-8 text-[rgb(var(--color-accent))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Lightning Fast</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Transactions confirm in seconds, not minutes. Powered by Starknet's high-throughput architecture.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-accent))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Sub-second confirmations
                        </div>
                      </div>

                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-400">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-warning))]/10 group-hover:bg-[rgb(var(--color-warning))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <DollarSign className="h-8 w-8 text-[rgb(var(--color-warning))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Minimal Fees</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Only 2% platform fee. No hidden charges, no monthly subscriptions, no minimum volumes.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-warning))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Transparent pricing
                        </div>
                      </div>

                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-500">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-info))]/10 group-hover:bg-[rgb(var(--color-info))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <BarChart3 className="h-8 w-8 text-[rgb(var(--color-info))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Advanced Analytics</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Real-time dashboards, transaction history, revenue tracking, and detailed merchant insights.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-info))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Live reporting
                        </div>
                      </div>

                      <div className="card-hover p-8 mobile-card group transform hover:scale-105 transition-all duration-500 animate-slideInUp animate-delay-700">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgb(var(--color-success))]/10 group-hover:bg-[rgb(var(--color-success))]/20 transition-all duration-300 mb-6 group-hover:animate-float">
                          <Globe className="h-8 w-8 text-[rgb(var(--color-success))]" />
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Global Reach</h4>
                        <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                          Accept payments from anywhere in the world. No geographical restrictions or complex compliance.
                        </p>
                        <div className="flex items-center text-sm text-[rgb(var(--color-success))] font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Worldwide coverage
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* How It Works Section */}
                  <div className="animate-fadeIn animate-delay-500">
                    <h3 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-4 text-center">
                      How StarkPay Works
                    </h3>
                    <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-16 text-center max-w-3xl mx-auto">
                      Get started in minutes with our simple three-step process
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                      <div className="text-center group animate-slideInLeft animate-delay-700">
                        <div className="relative mb-8">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(var(--color-primary))] text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                            1
                          </div>
                          <div className="absolute top-10 left-1/2 w-24 h-0.5 bg-[rgb(var(--color-border))] hidden md:block"></div>
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Connect Wallet</h4>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                          Install ArgentX or Braavos wallet, connect to StarkPay, and register as a merchant in seconds.
                        </p>
                      </div>

                      <div className="text-center group animate-slideInUp animate-delay-1000">
                        <div className="relative mb-8">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(var(--color-secondary))] text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                            2
                          </div>
                          <div className="absolute top-10 left-1/2 w-24 h-0.5 bg-[rgb(var(--color-border))] hidden md:block"></div>
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Generate QR Code</h4>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                          Create payment QR codes with custom amounts, descriptions, and supported tokens (USDC/USDT).
                        </p>
                      </div>

                      <div className="text-center group animate-slideInRight animate-delay-1000">
                        <div className="relative mb-8">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(var(--color-accent))] text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                            3
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-4">Get Paid</h4>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                          Customers scan and pay instantly. Funds appear in your wallet immediately with full transaction history.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="animate-slideInUp animate-delay-1000">
                    <div className="bg-gradient-to-r from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-secondary))]/5 rounded-3xl p-12 text-center">
                      <h3 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-8">
                        Trusted by Businesses Worldwide
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-[rgb(var(--color-primary))] mb-2">99.9%</div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))]">Uptime</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-[rgb(var(--color-secondary))] mb-2">&lt;2s</div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))]">Avg. Transaction</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-[rgb(var(--color-accent))] mb-2">24/7</div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))]">Support</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-[rgb(var(--color-warning))] mb-2">100%</div>
                          <div className="text-sm text-[rgb(var(--color-text-tertiary))]">Secure</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-center items-center gap-8 text-[rgb(var(--color-text-tertiary))]">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          <span>End-to-end encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          <span>Audited smart contracts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span>Real-time monitoring</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
          <div className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg sticky top-[73px] sm:top-[81px] z-20 shadow-sm animate-slideInUp animate-delay-300">
            <div className="container-fluid">
              <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Main navigation">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      className={`flex items-center space-x-2 border-b-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap touch-target interactive-focus rounded-t-xl transform hover:scale-105 group animate-slideInUp ${
                        activeTab === tab.id
                          ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 animate-glow'
                          : 'border-transparent text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-elevated))]'
                      }`}
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                      title={tab.description}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 ${activeTab === tab.id ? 'animate-float' : 'group-hover:scale-110'}`} aria-hidden="true" />
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
                <div className="text-center max-w-3xl mx-auto animate-slideInUp">
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
                <div className="text-center max-w-3xl mx-auto animate-slideInUp">
                  <h2 className="heading-2 mb-4">Make Payment</h2>
                  <p className="body-large text-[rgb(var(--color-text-secondary))]">
                    Scan a QR code to pay a merchant securely
                  </p>
                </div>
                <div className="animate-scaleIn animate-delay-200">
                  <PaymentScanner walletAddress={walletState.address!} />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div id="tabpanel-analytics" role="tabpanel" aria-labelledby="tab-analytics" className="space-y-8 sm:space-y-12 animate-fadeIn">
                <div className="text-center max-w-3xl mx-auto animate-slideInUp">
                  <h2 className="heading-2 mb-4">Platform Analytics</h2>
                  <p className="body-large text-[rgb(var(--color-text-secondary))]">
                    View transaction statistics and platform metrics
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                  <div className="animate-slideInLeft animate-delay-200">
                    <PlatformStats />
                  </div>
                  <div className="animate-slideInRight animate-delay-300">
                    <RecentTransactions />
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur-lg mt-auto animate-slideInUp animate-delay-500">
        <div className="container-fluid py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 gap-6">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 text-center sm:text-left animate-slideInLeft animate-delay-700">
              <p className="body-small text-[rgb(var(--color-text-tertiary))]">
                © 2024 StarkPay. Built on Starknet.
              </p>
              <div className="hidden sm:block h-4 w-px bg-[rgb(var(--color-border))]"></div>
              <span className="status-info animate-pulse-slow">
                Demo Version - For testing purposes only
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm animate-slideInRight animate-delay-1000">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))] hover:scale-105 transition-transform duration-200">
                <span className="text-[rgb(var(--color-text-tertiary))]">Platform Fee:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">2%</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-[rgb(var(--color-border))]"></div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))] hover:scale-105 transition-transform duration-200">
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
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/5 hover:border-[rgb(var(--color-primary))]/30 hover:text-[rgb(var(--color-primary))] transition-all duration-200 interactive-focus transform hover:scale-105"
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