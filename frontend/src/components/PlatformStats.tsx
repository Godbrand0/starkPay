'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, CreditCard, Zap } from 'lucide-react';
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
      console.warn('API not available, using demo data:', error);
      
      // Use demo data when API is not available
      setStats({
        totalRevenue: 125432.50,
        totalFees: 2508.65,
        totalTransactions: 1247,
        totalMerchants: 89,
        averageTransaction: 100.58,
        platformFee: 2.0
      });
      
      setHealthStatus({
        status: 'demo',
        uptime: 86400,
        version: 'v1.0.0-demo'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin inline-block h-8 w-8 border-4 border-orange-500 border-r-transparent rounded-full"></div>
          <p className="text-slate-400 mt-4">Loading platform stats...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
    },
    {
      title: 'Platform Fees',
      value: stats ? `$${stats.totalFees.toFixed(2)}` : '$0.00',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
    },
    {
      title: 'Transactions',
      value: stats ? stats.totalTransactions.toString() : '0',
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
    },
    {
      title: 'Merchants',
      value: stats ? stats.totalMerchants.toString() : '0',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
    },
  ];

  const mockChartData = [
    { name: 'Mon', transactions: 12, volume: 2400 },
    { name: 'Tue', transactions: 19, volume: 1398 },
    { name: 'Wed', transactions: 8, volume: 9800 },
    { name: 'Thu', transactions: 27, volume: 3908 },
    { name: 'Fri', transactions: 15, volume: 4800 },
    { name: 'Sat', transactions: 22, volume: 3800 },
    { name: 'Sun', transactions: 10, volume: 4300 },
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Platform Overview</h3>
        {healthStatus && (
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              healthStatus.status === 'healthy' ? 'bg-green-500' : 
              healthStatus.status === 'demo' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-slate-400 capitalize">
              {healthStatus.status === 'demo' ? 'Demo Mode' : healthStatus.status}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Weekly Activity</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="transactions" fill="#f97316" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Avg Transaction</span>
          </div>
          <div className="text-lg font-bold text-white">
            ${stats ? stats.averageTransaction.toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-300">Platform Fee</span>
          </div>
          <div className="text-lg font-bold text-white">
            {stats ? stats.platformFee.toFixed(1) : '2.0'}%
          </div>
        </div>
      </div>

      {/* System Info */}
      {healthStatus && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 space-y-1">
            <div>Uptime: {Math.floor((healthStatus.uptime || 0) / 3600)}h</div>
            <div>Version: {healthStatus.version || 'v1.0.0'}</div>
          </div>
        </div>
      )}
    </div>
  );
}