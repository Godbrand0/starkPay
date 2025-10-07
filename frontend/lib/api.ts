import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MerchantData {
  address: string;
  name: string;
  description?: string;
  email?: string;
}

export interface QRPaymentData {
  tokenAddress: string;
  amount: string;
  description?: string;
  selectedCurrency?: string;
  originalAmount?: number;
  usdAmount?: number;
  ngnAmount?: number;
  exchangeRate?: number;
}

export const registerMerchantAPI = async (data: MerchantData) => {
  const response = await api.post('/merchant/register', data);
  return response.data;
};

export const getMerchant = async (address: string) => {
  const response = await api.get(`/merchant/${address}`);
  return response.data;
};

export const generateQRCode = async (merchantAddress: string, data: QRPaymentData) => {
  const response = await api.post(`/merchant/${merchantAddress}/qr`, data);
  return response.data;
};

export const getMerchantTransactions = async (address: string, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/merchant/${address}/transactions`, {
    params: { page, limit },
  });
  return response.data;
};

export const getPaymentDetails = async (paymentId: string) => {
  const response = await api.get(`/payment/details/${paymentId}`);
  return response.data;
};

export const verifyTransaction = async (transactionHash: string) => {
  const response = await api.post('/payment/verify', { transactionHash });
  return response.data;
};

// Price API
export const getPriceRates = async () => {
  const response = await api.get('/price/rates');
  return response.data;
};

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string) => {
  const response = await api.post('/price/convert', {
    amount,
    fromCurrency,
    toCurrency,
  });
  return response.data;
};

export const getAllConversions = async (amount: number, fromCurrency: string) => {
  const response = await api.post('/price/convert-all', {
    amount,
    fromCurrency,
  });
  return response.data;
};

export const getMerchantPayments = async (address: string, limit: number = 10) => {
  const response = await api.get(`/merchant/${address}/payments`, {
    params: { limit },
  });
  return response.data;
};

export const getUserPayments = async (address: string, page: number = 1, limit: number = 20) => {
  const response = await api.get(`/payment/user/${address}`, {
    params: { page, limit },
  });
  return response.data;
};

export default api;