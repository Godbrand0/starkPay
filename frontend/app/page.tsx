'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { QrCode, Zap, Shield, ArrowRight, Gauge, Coins, ChevronDown, Lock, CheckCircle, Clock } from 'lucide-react';
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
        'StrkPay is a next-generation payment platform that lets merchants accept crypto instantly via QR codes. Built on Starknet for speed and low fees, it\'s the easiest way to tap into the crypto economy.'
    },
    {
      question: 'How does StrkPay make money?',
      answer:
        'We charge a transparent 2% platform fee on each transaction—lower than traditional payment processors. With millions of potential transactions on Starknet\'s scalable infrastructure, small fees create sustainable, profitable growth.'
    },
    {
      question: 'Why is this more scalable than competitors?',
      answer:
        'Built on Starknet\'s Layer 2 technology, StrkPay can handle millions of transactions per day with near-zero gas costs. No servers to scale, no downtime—just pure blockchain efficiency.'
    },
    {
      question: 'How fast are payments?',
      answer:
        'Instant. Starknet\'s zero-knowledge rollup technology confirms transactions in seconds, so merchants get paid immediately and customers don\'t wait.'
    },
    {
      question: 'What wallets work with StrkPay?',
      answer:
        'Any Starknet wallet like Braavos or Argent X. Just connect once and you\'re ready to send or receive payments.'
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
            Accept Crypto Payments in <span className="text-primary-600 dark:text-primary-400">Seconds</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The fastest, most affordable way to accept STRK payments. No terminals, no setup fees—just scan and get paid.
          </p>
          <div className="mt-8 flex gap-6 justify-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span>Instant Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span>98% Revenue Share</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span>Unlimited Scale</span>
            </div>
          </div>
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
                Start accepting crypto today. Create payment requests, track revenue, and withdraw instantly.
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">For Customers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pay anywhere in seconds. Just scan, confirm, and you're done. Track all your payments in one place.
              </p>
            </div>
          </Link>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Connect Wallet', 'Link your Starknet wallet in under 10 seconds. No forms, no verification delays.'],
              ['Create Payment', 'Generate a QR code for any amount. Share it, display it, or send it directly.'],
              ['Receive Funds', 'Customer scans and pays. Funds hit your wallet instantly—ready to use or withdraw.'],
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

      

        {/* VALUE PROPOSITION */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 rounded-2xl shadow-xl p-12 text-white">
          <div className="text-center mb-10">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Built for Scale, Designed for Profit</h2>
            <p className="text-lg max-w-3xl mx-auto text-blue-50">
              Powered by Starknet's L2 infrastructure—millions of transactions per day at a fraction of traditional payment costs.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-bold text-3xl mb-1">2%</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">Platform Fee</div>
              <div className="text-blue-200 dark:text-blue-300 text-xs mt-1">(vs. 2.9% + $0.30 industry standard)</div>
            </div>
            <div>
              <div className="font-bold text-3xl mb-1">98%</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">Revenue to Merchants</div>
              <div className="text-blue-200 dark:text-blue-300 text-xs mt-1">Highest in the industry</div>
            </div>
            <div>
              <div className="font-bold text-3xl mb-1">&lt;$0.01</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">Gas Fees</div>
              <div className="text-blue-200 dark:text-blue-300 text-xs mt-1">Starknet's L2 efficiency</div>
            </div>
            <div>
              <div className="font-bold text-3xl mb-1">∞</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm">Scalability</div>
              <div className="text-blue-200 dark:text-blue-300 text-xs mt-1">No infrastructure limits</div>
            </div>
          </div>
        </div>

        {/* COMING SOON - ESCROW SERVICE */}
        <section className="mt-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-indigo-100 dark:border-indigo-900">
          <div className="relative">
            {/* Coming Soon Badge */}
            <div className="absolute top-6 right-6 z-10">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                <Clock className="h-4 w-4" />
                Coming Soon
              </span>
            </div>

            <div className="p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br rounded-2xl mb-6 shadow-xl">
                  <Lock className="h-10 w-10" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  Escrow Service
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Hold payment securely until service or product is delivered
                </p>
              </div>

              {/* How it Works */}
              <div className="max-w-4xl mx-auto mb-10">
                <h3 className="text-xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">
                  How It Works
                </h3>
                <div className="grid md:grid-cols-5 gap-4">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">
                      1
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Customer Pays</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Funds sent to escrow</div>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">
                      2
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Held Securely</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">In smart contract</div>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">
                      3
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Delivery</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Service completed</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mt-4">
                  <div className="md:col-start-2 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">
                      4
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Approval</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Customer confirms</div>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md">
                      5
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Released</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Merchant receives funds</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-200">
                  Key Features
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4 p-4 dark:bg-white bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold dark:text-gray-900 text-white mb-1">
                        Dispute Resolution
                      </h4>
                      <p className="text-sm dark:text-gray-600 text-gray-400">
                        Time-based auto-release ensures fairness for both parties
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Milestone Payments
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Release funds in stages as work progresses
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Smart Contract Security
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Funds locked on-chain, no intermediaries needed
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 dark:bg-white bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex-shrink-0">
                      <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold dark:text-gray-900 text-white mb-1">
                        Instant Release
                      </h4>
                      <p className="text-sm dark:text-gray-600 text-gray-400">
                        Funds released immediately upon approval
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              // Alternate color pattern: odd indexes get inverted colors
              const isInverted = index % 2 === 1;

              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className={`w-full flex justify-between items-center p-5 text-left transition-colors ${
                      isInverted
                        ? 'dark:bg-white bg-gray-800 dark:hover:bg-gray-100 hover:bg-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`font-semibold ${
                      isInverted ? 'dark:text-gray-900 text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 transform transition-transform ${
                        isInverted ? 'dark:text-gray-600 text-gray-400' : 'text-gray-500'
                      } ${openIndex === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className={`p-5 border-t border-gray-200 dark:border-gray-700 ${
                      isInverted
                        ? 'dark:bg-white bg-gray-800 dark:text-gray-600 text-gray-400'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
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
