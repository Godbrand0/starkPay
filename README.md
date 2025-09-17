# 🚀 StarkPay QR - Complete Development Guide
*From Zero to Production: Build a Modern Starknet Payment System*

## 📋 Project Overview

StarkPay QR is a modern, production-ready QR code payment system built on Starknet. This guide provides everything needed to build the complete system from scratch, incorporating modern state management with Redux, enhanced UX libraries, and professional development practices.

### 🎯 What You'll Build

- **Smart Contracts**: Payment processing system with fee management on Starknet
- **Backend API**: Express.js server with MongoDB for merchant and transaction management
- **Frontend App**: Next.js application with Redux state management and modern UX
- **Mobile-First**: Responsive design with QR scanning capabilities

### ✨ Key Features

- 📱 QR code generation and scanning
- 💰 2% platform fee with automatic distribution
- 🔐 Wallet integration (ArgentX, Braavos)
- 📊 Real-time transaction tracking
- 🎨 Modern, responsive UI/UX
- 🔄 Optimistic updates and error handling
- 📈 Analytics and reporting dashboard

---

## 🛠️ Technology Stack

### Smart Contracts
- **Cairo**: Smart contract language for Starknet
- **Starkli**: CLI for contract deployment
- **OpenZeppelin**: Security-audited contract libraries

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Redis**: Caching and session management
- **Socket.io**: Real-time updates

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Hot Toast**: Notifications
- **Recharts**: Data visualization

### DevOps & Tools
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline
- **ESLint & Prettier**: Code quality
- **Husky**: Git hooks
- **Jest & Cypress**: Testing

---

## 🏗️ Project Architecture

```
starkpay/
├── contracts/              # Cairo smart contracts
│   ├── src/
│   │   ├── PaymentProcessor.cairo
│   │   ├── MockUSDC.cairo
│   │   └── MockUSDT.cairo
│   └── tests/
├── backend/                # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and configs
│   │   ├── store/         # Redux store setup
│   │   └── types/         # TypeScript definitions
│   └── __tests__/
├── shared/                 # Shared types and utilities
├── docs/                  # Documentation
└── scripts/               # Deployment and setup scripts
```

---

## 🚀 Development Setup

### Prerequisites Installation

```bash
# Install Node.js (v20.x LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Rust (for Cairo)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Cairo and Starknet tools
curl -L https://raw.githubusercontent.com/software-mansion/starkli/master/install.sh | sh
export PATH="$HOME/.starkli/bin:$PATH"

# Install MongoDB
sudo apt-get install -y mongodb

# Install Redis
sudo apt-get install -y redis-server

# Install Docker
sudo apt-get install -y docker.io docker-compose
```

### Project Initialization

```bash
# Create project structure
mkdir starkpay && cd starkpay
mkdir contracts backend frontend shared docs scripts

# Initialize Git repository
git init
echo "node_modules\n.env\n.env.local\ndist\nbuild\n*.log" > .gitignore
```

---

## 📦 Package Dependencies

### Smart Contracts (`contracts/Scarb.toml`)

```toml
[package]
name = "starkpay_contracts"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = ">=2.6.3"
openzeppelin = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v0.14.0" }

[[target.starknet-contract]]
sierra = true
casm = true
```

### Backend (`backend/package.json`)

```json
{
  "name": "starkpay-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "redis": "^4.6.12",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "compression": "^1.7.4",
    "qrcode": "^1.5.3",
    "starknet": "^6.0.0",
    "crypto": "^1.0.1",
    "winston": "^3.11.0",
    "multer": "^1.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.8"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "name": "starkpay-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "cypress run"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",
    "@tanstack/react-query": "^5.14.2",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "yup": "^1.4.0",
    "react-hot-toast": "^2.4.1",
    "framer-motion": "^10.16.16",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@tailwindcss/forms": "^0.5.7",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "@starknet-io/get-starknet": "^3.0.0",
    "starknet": "^6.0.0",
    "qr-scanner": "^1.4.2",
    "react-qr-code": "^2.0.12",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
    "@typescript-eslint/parser": "^6.15.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "prettier": "^3.1.1",
    "prettier-plugin-tailwindcss": "^0.5.9",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.6",
    "cypress": "^13.6.2",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

---

## 💾 Smart Contract Implementation

### Payment Processor Contract

```cairo
// contracts/src/PaymentProcessor.cairo
#[starknet::contract]
mod PaymentProcessor {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl ReentrancyGuardImpl = ReentrancyGuardComponent::ReentrancyGuardImpl<ContractState>;
    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        treasury_address: ContractAddress,
        registered_merchants: LegacyMap<ContractAddress, bool>,
        whitelisted_tokens: LegacyMap<ContractAddress, bool>,
        platform_fee_basis_points: u256, // 200 = 2%
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MerchantRegistered: MerchantRegistered,
        PaymentProcessed: PaymentProcessed,
        TokenWhitelisted: TokenWhitelisted,
        FeeUpdated: FeeUpdated,
        #[flat]
        ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    struct MerchantRegistered {
        merchant: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentProcessed {
        merchant: ContractAddress,
        payer: ContractAddress,
        token: ContractAddress,
        gross_amount: u256,
        net_amount: u256,
        fee: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct TokenWhitelisted {
        token: ContractAddress,
        whitelisted: bool
    }

    #[derive(Drop, starknet::Event)]
    struct FeeUpdated {
        old_fee: u256,
        new_fee: u256
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        treasury_address: ContractAddress,
        owner: ContractAddress
    ) {
        self.treasury_address.write(treasury_address);
        self.platform_fee_basis_points.write(200); // 2%
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl PaymentProcessorImpl of super::IPaymentProcessor<ContractState> {
        fn register_merchant(ref self: ContractState, merchant_address: ContractAddress) {
            assert(!self.registered_merchants.read(merchant_address), 'Merchant already registered');
            self.registered_merchants.write(merchant_address, true);
            
            self.emit(MerchantRegistered {
                merchant: merchant_address,
                timestamp: starknet::get_block_timestamp()
            });
        }

        fn process_payment(
            ref self: ContractState,
            merchant_address: ContractAddress,
            token_address: ContractAddress,
            amount: u256
        ) {
            self.reentrancy_guard.start();
            
            // Validations
            assert(self.registered_merchants.read(merchant_address), 'Merchant not registered');
            assert(self.whitelisted_tokens.read(token_address), 'Token not whitelisted');
            assert(amount > 0, 'Amount must be positive');

            let caller = get_caller_address();
            let treasury = self.treasury_address.read();
            let fee_basis_points = self.platform_fee_basis_points.read();

            // Calculate fee and net amount
            let fee = (amount * fee_basis_points) / 10000;
            let net_amount = amount - fee;

            // Process transfers
            let token = IERC20Dispatcher { contract_address: token_address };
            
            // Transfer net amount to merchant
            token.transfer_from(caller, merchant_address, net_amount);
            
            // Transfer fee to treasury
            token.transfer_from(caller, treasury, fee);

            self.emit(PaymentProcessed {
                merchant: merchant_address,
                payer: caller,
                token: token_address,
                gross_amount: amount,
                net_amount: net_amount,
                fee: fee,
                timestamp: starknet::get_block_timestamp()
            });

            self.reentrancy_guard.end();
        }

        fn whitelist_token(ref self: ContractState, token_address: ContractAddress, whitelisted: bool) {
            self.ownable.assert_only_owner();
            self.whitelisted_tokens.write(token_address, whitelisted);
            
            self.emit(TokenWhitelisted {
                token: token_address,
                whitelisted: whitelisted
            });
        }

        fn update_platform_fee(ref self: ContractState, new_fee_basis_points: u256) {
            self.ownable.assert_only_owner();
            assert(new_fee_basis_points <= 1000, 'Fee too high'); // Max 10%
            
            let old_fee = self.platform_fee_basis_points.read();
            self.platform_fee_basis_points.write(new_fee_basis_points);
            
            self.emit(FeeUpdated {
                old_fee: old_fee,
                new_fee: new_fee_basis_points
            });
        }

        // View functions
        fn is_merchant_registered(self: @ContractState, merchant_address: ContractAddress) -> bool {
            self.registered_merchants.read(merchant_address)
        }

        fn is_token_whitelisted(self: @ContractState, token_address: ContractAddress) -> bool {
            self.whitelisted_tokens.read(token_address)
        }

        fn get_treasury_address(self: @ContractState) -> ContractAddress {
            self.treasury_address.read()
        }

        fn get_platform_fee_basis_points(self: @ContractState) -> u256 {
            self.platform_fee_basis_points.read()
        }
    }
}

#[starknet::interface]
trait IPaymentProcessor<TContractState> {
    fn register_merchant(ref self: TContractState, merchant_address: ContractAddress);
    fn process_payment(
        ref self: TContractState,
        merchant_address: ContractAddress,
        token_address: ContractAddress,
        amount: u256
    );
    fn whitelist_token(ref self: TContractState, token_address: ContractAddress, whitelisted: bool);
    fn update_platform_fee(ref self: TContractState, new_fee_basis_points: u256);
    
    // View functions
    fn is_merchant_registered(self: @TContractState, merchant_address: ContractAddress) -> bool;
    fn is_token_whitelisted(self: @TContractState, token_address: ContractAddress) -> bool;
    fn get_treasury_address(self: @TContractState) -> ContractAddress;
    fn get_platform_fee_basis_points(self: @TContractState) -> u256;
}
```

---

## 🗄️ Backend Implementation

### Express Server Setup

```javascript
// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const merchantRoutes = require('./routes/merchant');
const paymentRoutes = require('./routes/payment');
const analyticsRoutes = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/merchant', merchantRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);
  
  socket.on('join_merchant_room', (merchantAddress) => {
    socket.join(`merchant_${merchantAddress}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, io };
```

### Redux Store Configuration

```typescript
// frontend/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import walletSlice from './slices/walletSlice';
import merchantSlice from './slices/merchantSlice';
import transactionSlice from './slices/transactionSlice';
import uiSlice from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['wallet', 'merchant'], // Only persist wallet and merchant data
};

const rootReducer = combineReducers({
  wallet: walletSlice,
  merchant: merchantSlice,
  transaction: transactionSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Wallet State Management

```typescript
// frontend/src/store/slices/walletSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { connect, disconnect } from 'get-starknet';
import { AccountInterface } from 'starknet';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  account: AccountInterface | null;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
  balance: {
    usdc: string;
    usdt: string;
  };
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  account: null,
  chainId: null,
  isConnecting: false,
  error: null,
  balance: {
    usdc: '0',
    usdt: '0',
  },
};

// Async thunks
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      const starknet = await connect();
      if (!starknet) {
        throw new Error('Failed to connect to wallet');
      }

      const account = await starknet.account;
      const chainId = await starknet.provider.getChainId();
      
      return {
        address: account.address,
        account,
        chainId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async () => {
    await disconnect();
    return null;
  }
);

export const fetchBalances = createAsyncThunk(
  'wallet/fetchBalances',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wallet: WalletState };
      const { account } = state.wallet;
      
      if (!account) {
        throw new Error('No account connected');
      }

      // Fetch USDC and USDT balances
      // Implementation depends on your token contract setup
      
      return {
        usdc: '1000000', // Placeholder
        usdt: '500000',  // Placeholder
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateBalance: (state, action: PayloadAction<{ token: 'usdc' | 'usdt'; balance: string }>) => {
      state.balance[action.payload.token] = action.payload.balance;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect wallet
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.account = action.payload.account;
        state.chainId = action.payload.chainId;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      })
      // Disconnect wallet
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.isConnected = false;
        state.address = null;
        state.account = null;
        state.chainId = null;
        state.balance = { usdc: '0', usdt: '0' };
      })
      // Fetch balances
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.balance = action.payload;
      });
  },
});

export const { clearError, updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
```

### Transaction State Management

```typescript
// frontend/src/store/slices/transactionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Transaction, PaymentStatus } from '../../types';

export interface TransactionState {
  currentTransaction: Transaction | null;
  history: Transaction[];
  isProcessing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: TransactionState = {
  currentTransaction: null,
  history: [],
  isProcessing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
};

export const processPayment = createAsyncThunk(
  'transaction/processPayment',
  async (paymentData: {
    merchantAddress: string;
    tokenAddress: string;
    amount: string;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { account } = state.wallet;
      
      if (!account) {
        throw new Error('No wallet connected');
      }

      // Process payment through smart contract
      // This would involve contract interaction
      
      return {
        id: Date.now().toString(),
        hash: '0x' + Math.random().toString(16),
        status: PaymentStatus.PENDING,
        ...paymentData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'transaction/fetchHistory',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions?page=${params.page || 1}&limit=${params.limit || 10}`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    updateTransactionStatus: (state, action: PayloadAction<{
      id: string;
      status: PaymentStatus;
      hash?: string;
    }>) => {
      const transaction = state.history.find(tx => tx.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
        if (action.payload.hash) {
          transaction.hash = action.payload.hash;
        }
      }
      
      if (state.currentTransaction?.id === action.payload.id) {
        state.currentTransaction.status = action.payload.status;
        if (action.payload.hash) {
          state.currentTransaction.hash = action.payload.hash;
        }
      }
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentTransaction = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })
      // Fetch history
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        const { transactions, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.history = transactions;
        } else {
          state.history.push(...transactions);
        }
        
        state.pagination = pagination;
      });
  },
});

export const { 
  updateTransactionStatus, 
  clearCurrentTransaction, 
  clearError 
} = transactionSlice.actions;

export default transactionSlice.reducer;
```

---

## 🎨 Modern UI Components

### Enhanced Payment Button

```typescript
// frontend/src/components/PaymentButton.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

import { RootState, AppDispatch } from '../store';
import { processPayment } from '../store/slices/transactionSlice';
import { connectWallet } from '../store/slices/walletSlice';
import LoadingSpinner from './LoadingSpinner';

const paymentSchema = yup.object({
  amount: yup.number()
    .required('Amount is required')
    .min(0.01, 'Amount must be at least 0.01')
    .max(10000, 'Amount cannot exceed 10,000'),
});

interface PaymentButtonProps {
  merchantAddress: string;
  tokenAddress: string;
  defaultAmount?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function PaymentButton({
  merchantAddress,
  tokenAddress,
  defaultAmount = '',
  onSuccess,
  onError,
  className = ''
}: PaymentButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, isConnecting } = useSelector((state: RootState) => state.wallet);
  const { isProcessing } = useSelector((state: RootState) => state.transaction);
  
  const [paymentStep, setPaymentStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'error'>('input');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: { amount: defaultAmount },
    mode: 'onChange'
  });

  const amount = watch('amount');

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      onError?.(error);
    }
  };

  const handlePayment = async (data: { amount: string }) => {
    if (!isConnected) {
      await handleConnectWallet();
      return;
    }

    setPaymentStep('processing');

    try {
      const result = await dispatch(processPayment({
        merchantAddress,
        tokenAddress,
        amount: data.amount
      })).unwrap();

      setPaymentStep('success');
      toast.success('Payment processed successfully!');
      onSuccess?.(result.hash);
    } catch (error) {
      setPaymentStep('error');
      toast.error('Payment failed');
      onError?.(error);
    }
  };

  const renderButtonContent = () => {
    if (!isConnected) {
      return (
        <>
          <CreditCardIcon className="w-5 h-5" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet to Pay'}
        </>
      );
    }

    switch (paymentStep) {
      case 'processing':
        return (
          <>
            <LoadingSpinner className="w-5 h-5" />
            Processing Payment...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            Payment Successful!
          </>
        );
      case 'error':
        return (
          <>
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            Payment Failed - Retry
          </>
        );
      default:
        return (
          <>
            <CreditCardIcon className="w-5 h-5" />
            Pay ${amount || '0.00'}
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:ring-4 focus:ring-opacity-50";
    
    if (!isConnected || paymentStep === 'input') {
      return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
    
    if (paymentStep === 'processing') {
      return `${baseStyles} bg-yellow-500 text-white cursor-not-allowed`;
    }
    
    if (paymentStep === 'success') {
      return `${baseStyles} bg-green-600 text-white`;
    }
    
    if (paymentStep === 'error') {
      return `${baseStyles} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
    }
    
    return baseStyles;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
    >
      <form onSubmit={handleSubmit(handlePayment)} className="space-y-4">
        {isConnected && paymentStep === 'input' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isConnecting || isProcessing || (isConnected && !isValid)}
          className={getButtonStyles()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={paymentStep === 'error' ? () => setPaymentStep('input') : undefined}
        >
          {renderButtonContent()}
        </motion.button>
      </form>

      {/* Payment progress indicator */}
      {isConnected && paymentStep !== 'input' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-sm text-gray-600"
        >
          <div className="flex space-x-1">
            {['confirm', 'processing', 'success'].map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  paymentStep === step || 
                  (['confirm', 'processing', 'success'].indexOf(paymentStep) > index)
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
```

---

## 📊 Analytics Dashboard

```typescript
// frontend/src/components/AnalyticsDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

import { formatCurrency, formatNumber } from '../lib/utils';

interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  totalMerchants: number;
  averageTransaction: number;
  revenueGrowth: number;
  transactionGrowth: number;
  dailyRevenue: Array<{ date: string; revenue: number; transactions: number }>;
  tokenDistribution: Array<{ token: string; value: number; color: string }>;
  topMerchants: Array<{ address: string; name: string; revenue: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    format = 'currency' 
  }: {
    title: string;
    value: number;
    growth?: number;
    icon: React.ComponentType<any>;
    format?: 'currency' | 'number';
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
          </p>
          {growth !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {growth >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(growth)}%
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={analytics.totalRevenue}
          growth={analytics.revenueGrowth}
          icon={CurrencyDollarIcon}
        />
        <StatCard
          title="Total Transactions"
          value={analytics.totalTransactions}
          growth={analytics.transactionGrowth}
          icon={CreditCardIcon}
          format="number"
        />
        <StatCard
          title="Active Merchants"
          value={analytics.totalMerchants}
          icon={UserGroupIcon}
          format="number"
        />
        <StatCard
          title="Avg Transaction"
          value={analytics.averageTransaction}
          icon={CurrencyDollarIcon}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Token Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.tokenDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
              >
                {analytics.tokenDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Volume']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center mt-4 space-x-4">
            {analytics.tokenDistribution.map((entry, index) => (
              <div key={entry.token} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.token}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Merchants */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topMerchants.map((merchant, index) => (
                <tr key={merchant.address} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {merchant.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-500">
                      {merchant.address.slice(0, 8)}...{merchant.address.slice(-6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(merchant.revenue)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## 🧪 Testing Strategy

### Smart Contract Tests

```cairo
// contracts/tests/test_payment_processor.cairo
#[cfg(test)]
mod tests {
    use super::PaymentProcessor;
    use starknet::testing::set_caller_address;
    use starknet::ContractAddress;

    #[test]
    fn test_merchant_registration() {
        // Test merchant registration functionality
        let contract = PaymentProcessor::deploy();
        let merchant_address = 0x123.try_into().unwrap();
        
        contract.register_merchant(merchant_address);
        assert(contract.is_merchant_registered(merchant_address), 'Merchant should be registered');
    }

    #[test]
    fn test_payment_processing() {
        // Test payment processing with fee calculation
        let contract = PaymentProcessor::deploy();
        let merchant = 0x123.try_into().unwrap();
        let token = 0x456.try_into().unwrap();
        let amount = 1000_u256;

        // Setup test conditions
        contract.register_merchant(merchant);
        contract.whitelist_token(token, true);

        // Process payment
        contract.process_payment(merchant, token, amount);

        // Verify fee calculation (2% of 1000 = 20)
        let expected_fee = 20_u256;
        let expected_net = 980_u256;
        
        // Additional verification logic here
    }
}
```

### Frontend Component Tests

```typescript
// frontend/__tests__/PaymentButton.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PaymentButton from '../src/components/PaymentButton';
import walletSlice from '../src/store/slices/walletSlice';

const mockStore = configureStore({
  reducer: {
    wallet: walletSlice,
    transaction: jest.fn(),
  },
});

describe('PaymentButton', () => {
  it('renders connect wallet button when not connected', () => {
    render(
      <Provider store={mockStore}>
        <PaymentButton
          merchantAddress="0x123"
          tokenAddress="0x456"
        />
      </Provider>
    );

    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });

  it('shows amount input when wallet is connected', async () => {
    // Mock connected state
    const connectedStore = configureStore({
      reducer: {
        wallet: walletSlice,
        transaction: jest.fn(),
      },
      preloadedState: {
        wallet: {
          isConnected: true,
          address: '0x123',
          account: {} as any,
          chainId: 'sepolia',
          isConnecting: false,
          error: null,
          balance: { usdc: '1000', usdt: '500' },
        },
      },
    });

    render(
      <Provider store={connectedStore}>
        <PaymentButton
          merchantAddress="0x123"
          tokenAddress="0x456"
        />
      </Provider>
    );

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('processes payment when form is submitted', async () => {
    // Test payment processing flow
    const mockOnSuccess = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <PaymentButton
          merchantAddress="0x123"
          tokenAddress="0x456"
          onSuccess={mockOnSuccess}
        />
      </Provider>
    );

    // Simulate user interactions
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '10.50' } });
    
    const payButton = screen.getByRole('button');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## 🚀 Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile.backend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/starkpay?authSource=admin
      - REDIS_URL=redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      
      - name: Run tests
        run: npm test
        working-directory: ./frontend
      
      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./frontend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

---

## 📖 Environment Configuration

### Backend Environment

```bash
# backend/.env
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/starkpay
REDIS_URL=redis://localhost:6379

# Starknet
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
PAYMENT_PROCESSOR_ADDRESS=0x...
MOCK_USDC_ADDRESS=0x...
MOCK_USDT_ADDRESS=0x...

# Security
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000

# External APIs
COINGECKO_API_KEY=your-api-key
INFURA_PROJECT_ID=your-project-id
```

### Frontend Environment

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=12345678
```

---

## 📋 Development Checklist

### Phase 1: Smart Contracts (Week 1-2)
- [ ] Set up Cairo development environment
- [ ] Implement PaymentProcessor contract with fee logic
- [ ] Create MockUSDC and MockUSDT contracts
- [ ] Write comprehensive contract tests
- [ ] Deploy to Starknet Sepolia testnet
- [ ] Verify contracts on Starkscan

### Phase 2: Backend API (Week 2-3)
- [ ] Set up Express server with TypeScript
- [ ] Implement MongoDB models and schemas
- [ ] Create merchant registration APIs
- [ ] Build QR code generation service
- [ ] Add transaction verification logic
- [ ] Implement real-time updates with Socket.io
- [ ] Add Redis caching layer
- [ ] Write API integration tests

### Phase 3: Frontend Application (Week 3-4)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Redux Toolkit store
- [ ] Implement wallet connection with get-starknet
- [ ] Build merchant dashboard with analytics
- [ ] Create QR payment flow
- [ ] Add React Query for server state
- [ ] Implement forms with React Hook Form
- [ ] Add toast notifications and loading states
- [ ] Write component tests

### Phase 4: Integration & Polish (Week 4-5)
- [ ] End-to-end testing with real wallets
- [ ] Mobile responsiveness testing
- [ ] Performance optimization
- [ ] Security audit and penetration testing
- [ ] Error handling and edge cases
- [ ] Documentation and user guides
- [ ] Deployment pipeline setup

### Phase 5: Production Deployment (Week 5-6)
- [ ] Production environment setup
- [ ] Database migration scripts
- [ ] SSL certificate configuration
- [ ] CDN setup for static assets
- [ ] Monitoring and alerting
- [ ] Backup and disaster recovery
- [ ] Performance monitoring
- [ ] User acceptance testing

---

## 🎯 Success Metrics

### Technical Metrics
- [ ] Contract deployment successful on testnet and mainnet
- [ ] API response time < 500ms for 95% of requests
- [ ] Frontend initial load time < 2 seconds
- [ ] 99.9% uptime SLA
- [ ] Zero critical security vulnerabilities
- [ ] Test coverage > 80% for all components

### Business Metrics
- [ ] Successful merchant registration flow
- [ ] End-to-end payment completion rate > 95%
- [ ] Transaction fee collection accuracy 100%
- [ ] Mobile user experience score > 4.5/5
- [ ] Support for ArgentX and Braavos wallets
- [ ] Real-time transaction updates working

### User Experience Metrics
- [ ] Mobile-responsive design on all screen sizes
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Error states properly handled and communicated
- [ ] Loading states provide clear feedback
- [ ] QR code scanning works reliably
- [ ] Wallet connection success rate > 98%

---

## 🔧 Additional Tools & Libraries

### Development Tools
```bash
# Code Quality
npm install -D eslint prettier husky lint-staged

# Testing
npm install -D jest @testing-library/react cypress

# Type Safety
npm install -D typescript @types/node @types/react

# Build Tools
npm install -D webpack-bundle-analyzer next-bundle-analyzer
```

### Utility Libraries
```bash
# Date/Time
npm install date-fns

# Validation
npm install yup @hookform/resolvers

# Animations
npm install framer-motion

# Icons
npm install @heroicons/react lucide-react

# Charts
npm install recharts

# Utils
npm install clsx tailwind-merge
```

---

## 📚 Resources & Documentation

### Starknet Development
- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starkli CLI Guide](https://book.starkli.rs/)

### Frontend Development
- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Backend Development
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Socket.io Documentation](https://socket.io/docs/)

---

## 🤝 Contributing Guidelines

### Code Standards
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write tests for all new features
- Document complex functions and components
- Use conventional commit messages

### Development Workflow
1. Create feature branch from `main`
2. Implement feature with tests
3. Run full test suite
4. Create pull request with description
5. Code review and approval
6. Merge to main and deploy

### Security Considerations
- Never commit private keys or secrets
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines
- Regular security audits and updates

---

## 🎉 Ready to Build!

This comprehensive guide provides everything needed to build StarkPay from scratch:

✅ **Complete Architecture**: Smart contracts, backend API, and modern frontend  
✅ **Modern Tech Stack**: Redux, React Query, Framer Motion, and more  
✅ **Production Ready**: Docker, CI/CD, monitoring, and security  
✅ **Developer Experience**: TypeScript, testing, linting, and documentation  
✅ **Mobile First**: Responsive design and progressive web app features  

**Start building your Starknet payment system today! 🚀**

---

*StarkPay QR - Empowering the future of decentralized payments on Starknet*
