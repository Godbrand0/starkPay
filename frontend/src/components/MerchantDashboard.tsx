'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import { contractService } from '@/lib/contracts';
import { walletManager } from '@/lib/wallet';
import { QRCodeGenerator } from './QRCodeGenerator';
import { TransactionHistory } from './TransactionHistory';
import { MerchantAnalytics } from './MerchantAnalytics';
import type { Merchant, Transaction } from '@/types';
import { Store, Plus, BarChart3, History, Settings, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface MerchantDashboardProps {
  walletAddress: string;
  isRegistered: boolean;
  onRegistrationChange: (registered: boolean) => void;
}

interface MerchantRegistrationForm {
  name: string;
  description: string;
  email: string;
}

export function MerchantDashboard({ 
  walletAddress, 
  isRegistered, 
  onRegistrationChange 
}: MerchantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'transactions' | 'analytics'>('overview');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<MerchantRegistrationForm>();

  useEffect(() => {
    if (isRegistered) {
      fetchMerchantData();
    }
  }, [isRegistered, walletAddress]);

  const fetchMerchantData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMerchant(walletAddress);
      if (response.success && response.data) {
        setMerchant(response.data.merchant);
      }

      const transactionsResponse = await apiClient.getMerchantTransactions(walletAddress, {
        page: 1,
        limit: 5,
      });
      if (transactionsResponse.success && transactionsResponse.data) {
        setRecentTransactions(transactionsResponse.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load merchant data:', error);
      
      // Show error state when API is not available
      setMerchant(null);
      setRecentTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantRegistration = async (data: MerchantRegistrationForm) => {
    setIsRegistering(true);
    try {
      // First register on-chain
      const account = walletManager.getAccount();
      if (!account) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      toast.success('Submitting merchant registration to blockchain...');
      
      // Register merchant on-chain using the contract service
      const transactionHash = await contractService.registerMerchant(walletAddress, account);
      
      toast.success('Transaction submitted! Waiting for confirmation...');
      
      // Wait for transaction confirmation
      await walletManager.waitForTransaction(transactionHash);
      
      toast.success('Blockchain registration confirmed! Registering with backend...');
      
      // Then register in backend
      const response = await apiClient.registerMerchant({
        address: walletAddress,
        name: data.name,
        description: data.description,
        email: data.email,
      });

      if (response.success) {
        toast.success('Merchant registered successfully!');
        onRegistrationChange(true);
        await fetchMerchantData();
      } else {
        throw new Error(response.error || 'Backend registration failed');
      }
    } catch (error) {
      console.error('Error registering merchant:', error);
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          toast.error('Transaction was rejected. Please try again.');
        } else if (error.message.includes('insufficient')) {
          toast.error('Insufficient funds for transaction. Please add ETH to your wallet.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const tabs = [
    {
      id: 'overview' as const,
      name: 'Overview',
      icon: Store,
    },
    {
      id: 'qr' as const,
      name: 'Generate QR',
      icon: Plus,
    },
    {
      id: 'transactions' as const,
      name: 'Transactions',
      icon: History,
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      icon: BarChart3,
    },
  ];

  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 sm:p-12 mobile-card animate-fadeIn">
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 shadow-lg shadow-[rgb(var(--color-primary))]/20">
              <Store className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
            <h3 className="heading-2 mb-4 text-[rgb(var(--color-text-primary))]">
              Register as Merchant
            </h3>
            <p className="body-large text-[rgb(var(--color-text-secondary))] max-w-md mx-auto">
              Complete your merchant registration to start accepting secure payments on Starknet
            </p>
          </div>

          <form onSubmit={handleSubmit(handleMerchantRegistration)} className="mobile-form-spacing">
            <div>
              <label htmlFor="business-name" className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                Business Name *
              </label>
              <input
                {...register('name', { required: 'Business name is required' })}
                id="business-name"
                type="text"
                className={`input-primary ${errors.name ? 'error-border' : ''}`}
                placeholder="Enter your business name"
                aria-describedby={errors.name ? "business-name-error" : undefined}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p id="business-name-error" className="error-state text-sm mt-2" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="business-description" className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                Description
              </label>
              <textarea
                {...register('description')}
                id="business-description"
                rows={4}
                className="input-primary resize-none"
                placeholder="Describe your business (optional)"
              />
            </div>

            <div>
              <label htmlFor="business-email" className="block text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                Email
              </label>
              <input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                id="business-email"
                type="email"
                className={`input-primary ${errors.email ? 'error-border' : ''}`}
                placeholder="your@email.com (optional)"
                aria-describedby={errors.email ? "business-email-error" : undefined}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p id="business-email-error" className="error-state text-sm mt-2" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="btn-primary w-full mobile-button interactive-focus"
              aria-label={isRegistering ? 'Registering merchant account...' : 'Register as merchant'}
            >
              {isRegistering ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="loading-spinner" aria-hidden="true"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                'Register Merchant'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 animate-fadeIn">
      {/* Merchant Info Header */}
      {merchant && (
        <div className="card-elevated p-8 sm:p-10 animate-slideInUp">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-secondary shadow-lg shadow-[rgb(var(--color-secondary))]/20">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="heading-3 mb-2 text-[rgb(var(--color-text-primary))]">{merchant.name}</h3>
                  <p className="body-base text-[rgb(var(--color-text-secondary))] mb-4">{merchant.description}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="body-small text-[rgb(var(--color-text-tertiary))]">Total Earnings:</span>
                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">{merchant.formattedEarnings}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="body-small text-[rgb(var(--color-text-tertiary))]">Transactions:</span>
                      <span className="font-semibold text-[rgb(var(--color-text-primary))]">{merchant.transactionCount}</span>
                    </div>
                    <span className={merchant.isActive ? 'status-success' : 'status-error'}>
                      {merchant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-right bg-[rgb(var(--color-surface))] rounded-2xl p-6 lg:bg-transparent lg:p-0">
              <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
                {merchant.formattedEarnings}
              </div>
              <div className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Total Revenue</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-[rgb(var(--color-border))]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-t-xl ${
                  activeTab === tab.id
                    ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5'
                    : 'border-transparent text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-elevated))]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 animate-fadeIn">
            {/* Quick Stats */}
            <div className="card p-8 sm:p-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[rgb(var(--color-primary))]/10">
                  <BarChart3 className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                </div>
                <h4 className="heading-4 text-[rgb(var(--color-text-primary))]">Quick Stats</h4>
              </div>
              {merchant ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface-elevated))]">
                    <span className="text-[rgb(var(--color-text-secondary))] font-medium">Today's Revenue</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface-elevated))]">
                    <span className="text-[rgb(var(--color-text-secondary))] font-medium">This Month</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">{merchant.formattedEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface-elevated))]">
                    <span className="text-[rgb(var(--color-text-secondary))] font-medium">Total Transactions</span>
                    <span className="text-[rgb(var(--color-text-primary))] font-semibold">{merchant.transactionCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface-elevated))]">
                    <span className="text-[rgb(var(--color-text-secondary))] font-medium">Success Rate</span>
                    <span className="text-[rgb(var(--color-success))] font-semibold">100%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgb(var(--color-warning))]/10 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-[rgb(var(--color-warning))]" />
                  </div>
                  <p className="text-[rgb(var(--color-text-secondary))] font-medium">Unable to load merchant statistics</p>
                  <p className="text-[rgb(var(--color-text-muted))] text-sm mt-2">Backend API not available</p>
                </div>
              )}
            </div>

            {/* Recent Transactions Preview */}
            <div className="card p-8 sm:p-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10">
                    <TrendingUp className="h-6 w-6 text-[rgb(var(--color-accent))]" />
                  </div>
                  <h4 className="heading-4 text-[rgb(var(--color-text-primary))]">Recent Activity</h4>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] text-sm font-medium transition-colors duration-200"
                >
                  View All
                </button>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--color-surface-elevated))] border-b border-[rgb(var(--color-border))] last:border-b-0">
                      <div className="flex-1">
                        <div className="text-[rgb(var(--color-text-primary))] text-sm font-semibold mb-1">
                          {transaction.formattedNetAmount}
                        </div>
                        <div className="text-[rgb(var(--color-text-muted))] text-xs">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'status-success'
                          : transaction.status === 'pending'
                          ? 'status-warning'
                          : 'status-error'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-[rgb(var(--color-accent))]" />
                  </div>
                  <p className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">No transactions yet</p>
                  <p className="text-[rgb(var(--color-text-muted))] text-xs mt-1">Start generating QR codes to accept payments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <QRCodeGenerator merchantAddress={walletAddress} />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory merchantAddress={walletAddress} />
        )}

        {activeTab === 'analytics' && (
          <MerchantAnalytics merchantAddress={walletAddress} />
        )}
      </div>
    </div>
  );
}