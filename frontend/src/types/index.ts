export interface Merchant {
  id: string;
  address: string;
  name: string;
  description?: string;
  email?: string;
  isActive: boolean;
  totalEarnings: number;
  transactionCount: number;
  lastTransactionAt?: string;
  createdAt: string;
  updatedAt: string;
  formattedEarnings: string;
}

export interface Transaction {
  id: string;
  transactionHash: string;
  merchantAddress: string;
  payerAddress: string;
  tokenAddress: string;
  grossAmount: string;
  netAmount: string;
  feeAmount: string;
  status: 'pending' | 'completed' | 'failed';
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: string;
  paymentId?: string;
  timestamp: string;
  formattedGrossAmount: string;
  formattedNetAmount: string;
  formattedFeeAmount: string;
  feePercentage: string;
}

export interface PaymentDetails {
  paymentId: string;
  merchantAddress: string;
  merchantName: string;
  merchantDescription?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  platformFeePercentage: number;
  description?: string;
  expiresAt: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface QRCodeData {
  paymentId: string;
  paymentUrl: string;
  qrCodeDataURL: string;
  paymentData: {
    merchantAddress: string;
    tokenAddress: string;
    amount: string;
    paymentId: string;
    description: string;
    timestamp: number;
  };
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface Analytics {
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    revenueGrowth: number;
  };
  dailyStats: Array<{
    date: string;
    revenue: number;
    transactions: number;
    volume: number;
  }>;
  tokenBreakdown: Array<{
    address: string;
    symbol: string;
    volume: number;
    transactions: number;
    revenue: number;
  }>;
}

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: string;
  account?: any;
}

export interface FormState {
  isSubmitting: boolean;
  error?: string;
  success?: string;
}
