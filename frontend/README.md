# StarkPay Frontend

A modern, responsive frontend for the StarkPay QR payment system built on Starknet.

## Features

- **Wallet Integration**: Connect with Starknet wallets (ArgentX, Braavos)
- **Merchant Dashboard**: Complete merchant management with registration, QR generation, and analytics
- **Payment Processing**: Scan QR codes and process payments with USDC/USDT
- **Real-time Analytics**: Transaction history, revenue tracking, and performance metrics
- **Responsive Design**: Mobile-first design with dark theme
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks + Context API
- **Wallet Integration**: Starknet.js + get-starknet
- **Charts**: Recharts for analytics visualization
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- A Starknet wallet (ArgentX or Braavos)
- Access to Starknet Sepolia testnet

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your contract addresses:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_NETWORK=sepolia
   NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=0x...
   NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
   NEXT_PUBLIC_MOCK_USDT_ADDRESS=0x...
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### For Merchants

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Register**: Complete merchant registration with business details
3. **Generate QR Codes**: Create payment QR codes with amount and description
4. **Monitor Analytics**: Track earnings, transactions, and performance metrics

### For Customers

1. **Connect Wallet**: Connect your Starknet wallet
2. **Scan QR Code**: Use the payment scanner to scan merchant QR codes
3. **Review Payment**: Confirm payment details and token amounts
4. **Complete Payment**: Approve token spending and execute payment

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── WalletConnector.tsx
│   ├── MerchantDashboard.tsx
│   ├── QRCodeGenerator.tsx
│   ├── PaymentScanner.tsx
│   ├── TransactionHistory.tsx
│   ├── MerchantAnalytics.tsx
│   ├── PlatformStats.tsx
│   └── RecentTransactions.tsx
├── lib/                   # Utility libraries
│   ├── api.ts            # API client
│   ├── wallet.ts         # Wallet management
│   └── contracts.ts      # Smart contract interactions
└── types/                 # TypeScript type definitions
    └── index.ts
```

## Smart Contract Integration

The frontend integrates with StarkPay smart contracts:

- **PaymentProcessor**: Main contract for payment processing
- **Mock Tokens**: USDC and USDT test tokens for development
- **Wallet Integration**: Direct interaction with Starknet wallets

## API Integration

The frontend communicates with the StarkPay backend API for:

- Merchant registration and management
- Payment QR code generation
- Transaction history and analytics
- Platform statistics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when configured)

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for quality assurance

## Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment**: Set environment variables in Vercel dashboard
3. **Deploy**: Automatic deployment on git push

### Custom Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_NETWORK` | Starknet network (mainnet/sepolia) | Yes |
| `NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS` | Payment processor contract address | Yes |
| `NEXT_PUBLIC_MOCK_USDC_ADDRESS` | USDC token contract address | Yes |
| `NEXT_PUBLIC_MOCK_USDT_ADDRESS` | USDT token contract address | Yes |

## Security Considerations

- **Environment Variables**: Never commit sensitive data to version control
- **Wallet Integration**: Uses secure wallet connection patterns
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error handling and user feedback

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure wallet extension is installed and unlocked
   - Check network configuration (Sepolia testnet)
   - Clear browser cache and cookies

2. **Contract Interaction Failed**
   - Verify contract addresses in environment variables
   - Ensure sufficient token balance for transactions
   - Check transaction approval status

3. **API Connection Issues**
   - Verify backend server is running
   - Check API URL configuration
   - Review network connectivity

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- GitHub Issues
- Documentation
- Community Discord