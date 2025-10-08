'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { QrCode, Zap, Shield, ArrowRight, Cpu, Gauge, Coins, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const ThemeToggle = dynamic(() => import('@/components/ThemeToggle').then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-9 h-9" />
});

export default function HomePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is StrkPay?',
      answer:
        'StrkPay is a QR-based payment platform built on Starknet. It enables instant, low-fee, and secure transactions using STRK tokens — perfect for merchants and users who want on-chain simplicity.'
    },
    {
      question: 'How fast are transactions?',
      answer:
        'Thanks to Starknet’s zero-knowledge rollup technology, transactions are confirmed in seconds while maintaining Ethereum-level security.'
    },
    {
      question: 'How are fees calculated?',
      answer:
        'StrkPay charges a flat 2% platform fee per transaction. The remaining 98% goes directly to the merchant. Starknet’s gas fees are minimal and handled directly on-chain.'
    },
    {
      question: 'What is Pragma Oracle used for?',
      answer:
        'Pragma Oracle provides reliable real-time STRK/USD price data. StrkPay uses it to ensure accurate conversions when generating payment amounts or receipts.'
    },
    {
      question: 'Do I need a specific wallet?',
      answer:
        'You can connect with Starknet-compatible wallets like Braavos or Argent X. For the best experience, open StrkPay directly from the Braavos in-app browser.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">StrkPay</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* HERO */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-6xl md:text-7xl mb-6">
            Instant QR Payments on <span className="text-primary-600 dark:text-primary-400">Starknet</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Never miss a moment to make flex of your STRK tokens. Simple, secure, and powered by Starknet.
          </p>
        </div>

        {/* MERCHANT / USER CARDS */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Link href="/merchant/dashboard" className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-3">
                  <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">For Merchants</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate QR codes, track payments, and manage your transactions.
              </p>
            </div>
          </Link>

          <Link href="/user" className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                  <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment History</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your payment history and make new payments by scanning QR codes.
              </p>
            </div>
          </Link>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Register', 'Connect your wallet and register as a merchant on the platform.'],
              ['Generate QR', 'Create custom QR codes with payment amounts in STRKs.'],
              ['Get Paid', 'Customers scan and pay instantly. 98% goes to you, 2% platform fee.'],
            ].map(([title, desc], i) => (
              <div key={i} className="text-center">
                <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT SECTION */}
        <section className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">About StrkPay</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature icon={<Cpu />} title="Built on Starknet" text="StrkPay is powered by Starknet’s Layer-2 technology, leveraging zk-rollups to ensure secure and scalable on-chain payments." />
            <Feature icon={<Gauge />} title="Fast & Low Fees" text="Thanks to Starknet’s high throughput, transactions confirm in seconds with minimal gas fees — making microtransactions practical and seamless." />
            <Feature icon={<Coins />} title="Powered by Pragma Oracle" text="StrkPay integrates with Pragma Oracle to fetch the latest STRK/USD prices, ensuring accurate and up-to-date conversions for each transaction." />
          </div>
        </section>

        {/* SECURITY SECTION */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 rounded-2xl shadow-xl p-12 text-white text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Secure & Transparent</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Built on Starknet with smart contract security. All transactions are verifiable on-chain.
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <div>
              <div className="font-bold text-2xl">2%</div>
              <div className="text-blue-100 dark:text-blue-200">Platform Fee</div>
            </div>
            <div>
              <div className="font-bold text-2xl">98%</div>
              <div className="text-blue-100 dark:text-blue-200">To Merchant</div>
            </div>
          </div>
        </div>

        {/* FAQ SECTION */}
        <section className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center p-5 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="p-5 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-16 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2025 StrkPay. <br />
            Built on Starknet Sepolia Testnet.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}
