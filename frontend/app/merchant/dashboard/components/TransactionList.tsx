'use client';

import { useEffect, useState } from 'react';
import { getMerchantTransactions } from '@/lib/api';
import { formatTokenAmount } from '@/lib/contract';
import { History, ExternalLink, Copy, Check } from 'lucide-react';

interface Transaction {
  transactionHash: string;
  payerAddress: string;
  tokenAddress: string;
  grossAmount: string;
  netAmount: string;
  feeAmount: string;
  status: string;
  timestamp: string;
}

interface TransactionListProps {
  merchantAddress: string;
}

export function TransactionList({ merchantAddress }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getMerchantTransactions(merchantAddress, 1, 10);
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (merchantAddress) {
      fetchTransactions();
    }
  }, [merchantAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <History className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.transactionHash}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {shortenAddress(tx.transactionHash)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tx.transactionHash)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedHash === tx.transactionHash ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Net Amount</p>
                  <p className="font-semibold text-green-600">
                    {formatTokenAmount(BigInt(tx.netAmount), 18)} STRK
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fee</p>
                  <p className="font-medium text-gray-700">
                    {formatTokenAmount(BigInt(tx.feeAmount), 18)} STRK
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">From</p>
                  <p className="font-mono text-xs">{shortenAddress(tx.payerAddress)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}