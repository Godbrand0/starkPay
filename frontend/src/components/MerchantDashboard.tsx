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
      console.warn('API not available, using demo data:', error);
      
      // Use demo data when API is not available
      setMerchant({
        id: 'demo-merchant',
        address: walletAddress,
        name: 'Demo Store',
        description: 'A sample merchant store for demonstration',
        email: 'demo@example.com',
        isActive: true,
        totalEarnings: 1250.75,
        formattedEarnings: '$1,250.75',
        transactionCount: 23,
        registrationDate: new Date().toISOString(),
        lastTransactionDate: new Date().toISOString()
      });
      
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
      <div className="max-w-lg mx-auto">
        <div className="card p-6 sm:p-8 mobile-card">
          <div className="text-center mb-6 sm:mb-8">
            <div className="p-4 rounded-xl bg-orange-500/10 w-fit mx-auto mb-4">
              <Store className="h-12 w-12 text-orange-500" aria-hidden="true" />
            </div>
            <h3 className="heading-3 mb-3">
              Register as Merchant
            </h3>
            <p className="body-base text-slate-400">
              Complete your merchant registration to start accepting payments
            </p>
          </div>

          <form onSubmit={handleSubmit(handleMerchantRegistration)} className="mobile-form-spacing">
            <div>
              <label htmlFor="business-name" className="block text-sm font-medium text-slate-300 mb-2">
                Business Name *
              </label>
              <input
                {...register('name', { required: 'Business name is required' })}
                id="business-name"
                type="text"
                className="input-primary"
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
              <label htmlFor="business-description" className="block text-sm font-medium text-slate-300 mb-2">
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
              <label htmlFor="business-email" className="block text-sm font-medium text-slate-300 mb-2">
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
                className="input-primary"
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
                <div className="flex items-center justify-center space-x-2">
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
    <div className="space-y-6">
      {/* Merchant Info Header */}
      {merchant && (
        <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{merchant.name}</h3>
              <p className="text-slate-400">{merchant.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-slate-400">
                  Total Earnings: {merchant.formattedEarnings}
                </span>
                <span className="text-sm text-slate-400">
                  Transactions: {merchant.transactionCount}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  merchant.isActive 
                    ? 'bg-green-900/20 text-green-400 border border-green-500/20' 
                    : 'bg-red-900/20 text-red-400 border border-red-500/20'
                }`}>
                  {merchant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {merchant.formattedEarnings}
              </div>
              <div className="text-sm text-slate-400">Total Revenue</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Today's Revenue</span>
                  <span className="text-white font-medium">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">This Month</span>
                  <span className="text-white font-medium">{merchant?.formattedEarnings || '$0.00'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Transactions</span>
                  <span className="text-white font-medium">{merchant?.transactionCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Success Rate</span>
                  <span className="text-green-400 font-medium">100%</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview */}
            <div className="rounded-lg bg-slate-800 p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Recent Activity</h4>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {transaction.formattedNetAmount}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' 
                          ? 'bg-green-900/20 text-green-400' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No transactions yet</p>
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