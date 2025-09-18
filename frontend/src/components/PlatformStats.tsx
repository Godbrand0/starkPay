'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, CreditCard, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export function PlatformStats() {
  const [stats, setStats] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        apiClient.getAnalyticsSummary(),
        apiClient.getHealthCheck(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data.summary);
      }

      if (healthResponse.success && healthResponse.data) {
        setHealthStatus(healthResponse.data.health);
      }
    } catch (error) {
      console.error('Failed to load platform data:', error);
      
      // Show error state instead of demo data
      setStats(null);
      setHealthStatus({
        status: 'error',
        uptime: 0,
        version: 'v1.0.0'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="text-center py-12">
          <div className="loading-spinner-lg mx-auto"></div>
          <p className="text-[rgb(var(--color-text-secondary))] mt-6 font-medium">Loading platform stats...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'text-[rgb(var(--color-success))]',
      bgColor: 'bg-[rgb(var(--color-success))]/10',
    },
    {
      title: 'Platform Fees',
      value: stats ? `$${stats.totalFees.toFixed(2)}` : '$0.00',
      icon: TrendingUp,
      color: 'text-[rgb(var(--color-primary))]',
      bgColor: 'bg-[rgb(var(--color-primary))]/10',
    },
    {
      title: 'Transactions',
      value: stats ? stats.totalTransactions.toString() : '0',
      icon: CreditCard,
      color: 'text-[rgb(var(--color-secondary))]',
      bgColor: 'bg-[rgb(var(--color-secondary))]/10',
    },
    {
      title: 'Merchants',
      value: stats ? stats.totalMerchants.toString() : '0',
      icon: Users,
      color: 'text-[rgb(var(--color-accent))]',
      bgColor: 'bg-[rgb(var(--color-accent))]/10',
    },
  ];

  // Empty chart data when no real data is available
  const emptyChartData = [
    { name: 'Mon', transactions: 0, volume: 0 },
    { name: 'Tue', transactions: 0, volume: 0 },
    { name: 'Wed', transactions: 0, volume: 0 },
    { name: 'Thu', transactions: 0, volume: 0 },
    { name: 'Fri', transactions: 0, volume: 0 },
    { name: 'Sat', transactions: 0, volume: 0 },
    { name: 'Sun', transactions: 0, volume: 0 },
  ];

  return (
    <div className="card p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[rgb(var(--color-primary))]/10">
            <BarChart className="h-6 w-6 text-[rgb(var(--color-primary))]" />
          </div>
          <h3 className="heading-4 text-[rgb(var(--color-text-primary))]">Platform Overview</h3>
        </div>
        {healthStatus && (
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              healthStatus.status === 'healthy' ? 'bg-[rgb(var(--color-success))]' : 'bg-[rgb(var(--color-error))]'
            }`}></div>
            <span className="text-sm text-[rgb(var(--color-text-secondary))] font-medium capitalize">
              {healthStatus.status === 'error' ? 'Offline' : healthStatus.status}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[rgb(var(--color-surface-elevated))] rounded-2xl p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-1">{stat.value}</div>
              <div className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="mb-8">
        <h4 className="heading-5 text-[rgb(var(--color-text-primary))] mb-4">Weekly Activity</h4>
        <div className="bg-[rgb(var(--color-surface-elevated))] rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={emptyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
              <XAxis dataKey="name" stroke="rgb(var(--color-text-muted))" fontSize={12} />
              <YAxis stroke="rgb(var(--color-text-muted))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--color-surface))', 
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '12px',
                  color: 'rgb(var(--color-text-primary))',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="transactions" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[rgb(var(--color-surface-elevated))] rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="h-5 w-5 text-[rgb(var(--color-warning))]" />
            <span className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">Avg Transaction</span>
          </div>
          <div className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
            ${stats ? stats.averageTransaction.toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="bg-[rgb(var(--color-surface-elevated))] rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="h-5 w-5 text-[rgb(var(--color-success))]" />
            <span className="text-sm text-[rgb(var(--color-text-secondary))] font-medium">Platform Fee</span>
          </div>
          <div className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
            {stats ? stats.platformFee.toFixed(1) : '2.0'}%
          </div>
        </div>
      </div>

      {/* System Info */}
      {healthStatus && (
        <div className="pt-6 border-t border-[rgb(var(--color-border))]">
          <div className="text-sm text-[rgb(var(--color-text-muted))] space-y-2">
            <div>Uptime: {Math.floor((healthStatus.uptime || 0) / 3600)}h</div>
            <div>Version: {healthStatus.version || 'v1.0.0'}</div>
          </div>
        </div>
      )}
    </div>
  );
}