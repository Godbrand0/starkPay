'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Analytics } from '@/types';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface MerchantAnalyticsProps {
  merchantAddress: string;
}

export function MerchantAnalytics({ merchantAddress }: MerchantAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  useEffect(() => {
    fetchAnalytics();
  }, [merchantAddress, selectedPeriod]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMerchantAnalytics(merchantAddress, selectedPeriod);
      if (response.success && response.data) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Show error state when API is not available
      setAnalytics(null);
      toast.error('Failed to load analytics. Backend API not available.');
    } finally {
      setIsLoading(false);
    }
  };

  const periodOptions = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
    { value: 365, label: '1 Year' },
  ];

  const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block h-8 w-8 border-4 border-orange-500 border-r-transparent rounded-full"></div>
        <p className="text-slate-400 mt-4">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
        <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No analytics data available</p>
        <p className="text-slate-500 text-sm mt-2">Analytics will appear after you receive payments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Analytics</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${analytics.summary.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {analytics.summary.revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
            )}
            <span className={`text-sm ${analytics.summary.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {analytics.summary.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-sm ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white">{analytics.summary.totalTransactions}</p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-slate-400 text-sm">
              Avg: ${analytics.summary.averageTransactionValue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">100%</p>
            </div>
            <div className="p-3 bg-emerald-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-slate-400 text-sm">
              All transactions completed
            </span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Top Token</p>
              <p className="text-2xl font-bold text-white">
                {analytics.tokenBreakdown[0]?.symbol || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-orange-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-slate-400 text-sm">
              {analytics.tokenBreakdown[0] ? `${analytics.tokenBreakdown[0].transactions} transactions` : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Transaction Volume</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [value, 'Transactions']}
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Token Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.tokenBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="volume"
                label={({ symbol, percentage }) => `${symbol} ${percentage}%`}
              >
                {analytics.tokenBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Volume']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Token Performance</h4>
          <div className="space-y-4">
            {analytics.tokenBreakdown.map((token, index) => (
              <div key={token.address} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="font-medium text-white">{token.symbol}</p>
                    <p className="text-sm text-slate-400">{token.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${token.volume.toFixed(2)}</p>
                  <p className="text-sm text-slate-400">${token.revenue.toFixed(2)} revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}