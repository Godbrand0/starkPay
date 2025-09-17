import { Merchant, Transaction, PaymentDetails, QRCodeData, Analytics, Token, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Merchant API
  async registerMerchant(data: {
    address: string;
    name: string;
    description?: string;
    email?: string;
  }): Promise<ApiResponse<{ merchant: Merchant }>> {
    return this.request('/merchant/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMerchant(address: string): Promise<ApiResponse<{ 
    merchant: Merchant; 
    stats: any; 
    isRegisteredOnChain: boolean; 
  }>> {
    return this.request(`/merchant/${address}`);
  }

  async updateMerchant(address: string, data: {
    name?: string;
    description?: string;
    email?: string;
  }): Promise<ApiResponse<{ merchant: Merchant }>> {
    return this.request(`/merchant/${address}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async generatePaymentQR(merchantAddress: string, data: {
    tokenAddress: string;
    amount: string;
    description?: string;
  }): Promise<ApiResponse<QRCodeData>> {
    return this.request(`/merchant/${merchantAddress}/qr`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMerchantTransactions(merchantAddress: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{
    transactions: Transaction[];
    pagination: any;
    summary: any;
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `/merchant/${merchantAddress}/transactions${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url);
  }

  async getMerchantAnalytics(merchantAddress: string, days?: number): Promise<ApiResponse<{
    analytics: Analytics;
    period: string;
    merchant: { name: string; address: string; };
  }>> {
    const queryString = days ? `?days=${days}` : '';
    return this.request(`/merchant/${merchantAddress}/analytics${queryString}`);
  }

  // Payment API
  async getPaymentDetails(paymentId: string, params: {
    m: string;
    t: string;
    a: string;
    d?: string;
  }): Promise<ApiResponse<{ paymentDetails: PaymentDetails }>> {
    const searchParams = new URLSearchParams(params);
    return this.request(`/payment/details/${paymentId}?${searchParams.toString()}`);
  }

  async verifyTransaction(data: {
    transactionHash: string;
    paymentId?: string;
  }): Promise<ApiResponse<{ transaction: Transaction; status: string; }>> {
    return this.request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransaction(hash: string): Promise<ApiResponse<{ 
    transaction: Transaction; 
    source: string; 
  }>> {
    return this.request(`/payment/transaction/${hash}`);
  }

  async getTransactionStatus(hash: string): Promise<ApiResponse<{
    status: string;
    transaction?: any;
    onChain?: boolean;
    blockNumber?: number;
  }>> {
    return this.request(`/payment/status/${hash}`);
  }

  async getRecentTransactions(params?: {
    limit?: number;
    status?: string;
    tokenAddress?: string;
  }): Promise<ApiResponse<{
    transactions: Transaction[];
    summary: { total: number; completed: number; pending: number; };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.tokenAddress) searchParams.append('tokenAddress', params.tokenAddress);

    const queryString = searchParams.toString();
    const url = `/payment/recent${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url);
  }

  async getSupportedTokens(): Promise<ApiResponse<{
    tokens: { [key: string]: Token };
    platformFee: { percentage: number; basisPoints: number; };
  }>> {
    return this.request('/payment/tokens');
  }

  async calculatePayment(data: {
    amount: string;
    tokenAddress?: string;
  }): Promise<ApiResponse<{
    calculation: {
      grossAmount: number;
      feeAmount: number;
      netAmount: number;
      platformFeePercentage: number;
      token: Token | null;
    };
  }>> {
    return this.request('/payment/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics API
  async getPlatformAnalytics(params?: {
    days?: number;
    limit?: number;
  }): Promise<ApiResponse<{ analytics: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.append('days', params.days.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `/analytics${queryString ? `?${queryString}` : ''}`;
    
    return this.request(url);
  }

  async getAnalyticsSummary(): Promise<ApiResponse<{
    summary: {
      totalRevenue: number;
      totalFees: number;
      totalTransactions: number;
      totalMerchants: number;
      averageTransaction: number;
      platformFee: number;
    };
  }>> {
    return this.request('/analytics/summary');
  }

  async getHealthCheck(): Promise<ApiResponse<{
    health: {
      status: string;
      timestamp: string;
      uptime: number;
      recentActivity?: any;
      services?: any;
      version?: string;
    };
  }>> {
    return this.request('/analytics/health');
  }
}

export const apiClient = new ApiClient();
