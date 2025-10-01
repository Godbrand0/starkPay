'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { WalletConnect } from '@/components/WalletConnect';
import { registerMerchant } from '@/lib/contract';
import { registerMerchantAPI } from '@/lib/api';
import { getConnectedWallet } from '@/lib/wallet';
import { QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MerchantRegister() {
  const router = useRouter();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'form' | 'contract' | 'backend' | 'complete'>('form');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.name) {
      alert('Please enter a merchant name');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      // Step 1: Register on-chain
      setStep('contract');
      const wallet = await getConnectedWallet();
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      const txHash = await registerMerchant(wallet.account, address);
      console.log('On-chain registration successful:', txHash);

      // Step 2: Register in backend
      setStep('backend');
      await registerMerchantAPI({
        address,
        name: formData.name,
        description: formData.description,
        email: formData.email,
      });

      // Step 3: Complete
      setStep('complete');
      setTimeout(() => {
        router.push('/merchant/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
      setStep('form');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <QrCode className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to register as a merchant.
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

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            You are now registered as a merchant. Redirecting to your dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {step === 'contract' && 'Registering on-chain...'}
            {step === 'backend' && 'Saving merchant data...'}
          </h2>
          <p className="text-gray-600">
            {step === 'contract' && 'Please confirm the transaction in your wallet.'}
            {step === 'backend' && 'Almost done! Saving your information.'}
          </p>
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
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Register as Merchant</h1>
            <p className="text-gray-600 mt-2">
              Fill in your details to start accepting payments with StarkPay.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="My Business"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your business..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@mybusiness.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Registration requires two steps:
              </p>
              <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
                <li>On-chain registration (requires wallet confirmation)</li>
                <li>Backend data storage</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isRegistering}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register Merchant
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}