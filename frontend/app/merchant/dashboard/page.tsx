'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { WalletConnect } from '@/components/WalletConnect';
import { QRGenerator } from './components/QRGenerator';
import { TransactionList } from './components/TransactionList';
import { EarningsOverview } from './components/EarningsOverview';
import { PaymentsProvider } from '@/contexts/PaymentsContext';
import { checkMerchantRegistration } from '@/lib/contract';
import { getMerchant } from '@/lib/api';
import { ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboard() {
  const router = useRouter();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const [isRegistered, setIsRegistered] = useState(false);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!address || !isConnected) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Check on-chain registration
        const registered = await checkMerchantRegistration(address);
        setIsRegistered(registered);

        if (registered) {
          // Fetch merchant data from backend
          try {
            const data = await getMerchant(address);
            setMerchantData(data);
          } catch (error) {
            console.error('Failed to fetch merchant data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to check registration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <QrCode className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the merchant dashboard.
          </p>
          <WalletConnect />
          <Link
            href="/"
            className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking registration status...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Required</h2>
          <p className="text-gray-600 mb-6">
            You need to register as a merchant before you can access the dashboard and generate QR codes.
          </p>
          <button
            onClick={() => router.push('/merchant/register')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Register as Merchant
          </button>
          <Link
            href="/"
            className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <QrCode className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">StarkPay</span>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Merchant Dashboard</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentsProvider merchantAddress={address!} autoRefreshInterval={5000}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">
              {merchantData?.merchant?.name || 'Merchant'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              💡 Payments update in real-time - watch for pending payments turning green!
            </p>
          </div>

          <EarningsOverview />

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <QRGenerator merchantAddress={address!} />
            <TransactionList />
          </div>
        </PaymentsProvider>
      </main>
    </div>
  );
}