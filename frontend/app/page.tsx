'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { QrCode, Zap, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StarkPay</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6">
            Instant QR Payments on <span className="text-primary-600">Starknet</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Accept crypto payments instantly with QR codes. Simple, secure, and powered by Starknet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Link href="/merchant/dashboard" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary-100 rounded-lg p-3">
                  <QrCode className="h-8 w-8 text-primary-600" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">For Merchants</h3>
              <p className="text-gray-600">
                Generate QR codes, track payments, and manage your transactions.
              </p>
            </div>
          </Link>

          <Link href="/pay" className="block group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Make Payment</h3>
              <p className="text-gray-600">
                Scan a QR code or enter payment details to send crypto instantly.
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Register</h3>
              <p className="text-gray-600">Connect your wallet and register as a merchant on the platform.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Generate QR</h3>
              <p className="text-gray-600">Create custom QR codes with payment amounts in mUSDC or mUSDT.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Get Paid</h3>
              <p className="text-gray-600">Customers scan and pay instantly. 98% goes to you, 2% platform fee.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-xl p-12 text-white text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Secure & Transparent</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Built on Starknet with smart contract security. All transactions are verifiable on-chain.
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <div>
              <div className="font-bold text-2xl">2%</div>
              <div className="text-blue-100">Platform Fee</div>
            </div>
            <div>
              <div className="font-bold text-2xl">98%</div>
              <div className="text-blue-100">To Merchant</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2025 StarkPay. Built on Starknet Sepolia Testnet.
          </p>
        </div>
      </footer>
    </div>
  );
}