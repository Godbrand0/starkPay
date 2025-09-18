import { Contract, Provider, constants, RpcProvider } from 'starknet';

// Contract addresses - these should be environment variables in production
export const CONTRACT_ADDRESSES = {
  PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS || '',
  MOCK_USDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS || '',
  MOCK_USDT: process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS || '',
};

// Contract ABIs (Cairo 1.0 format)
export const PAYMENT_PROCESSOR_ABI = [
  {
    name: 'register_merchant',
    type: 'function',
    inputs: [{ name: 'merchant_address', type: 'felt252' }],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'process_payment',
    type: 'function',
    inputs: [
      { name: 'merchant_address', type: 'felt252' },
      { name: 'token_address', type: 'felt252' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'whitelist_token',
    type: 'function',
    inputs: [
      { name: 'token_address', type: 'felt252' },
      { name: 'whitelisted', type: 'core::bool' }
    ],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'update_platform_fee',
    type: 'function',
    inputs: [{ name: 'new_fee_basis_points', type: 'core::integer::u256' }],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'is_merchant_registered',
    type: 'function',
    inputs: [{ name: 'merchant_address', type: 'felt252' }],
    outputs: [{ name: 'is_registered', type: 'core::bool' }],
    state_mutability: 'view',
  },
  {
    name: 'is_token_whitelisted',
    type: 'function',
    inputs: [{ name: 'token_address', type: 'felt252' }],
    outputs: [{ name: 'is_whitelisted', type: 'core::bool' }],
    state_mutability: 'view',
  },
  {
    name: 'get_treasury_address',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'treasury', type: 'felt252' }],
    state_mutability: 'view',
  },
  {
    name: 'get_platform_fee_basis_points',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'fee', type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
];

export const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'name', type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view',
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'symbol', type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'core::integer::u8' }],
    state_mutability: 'view',
  },
  {
    name: 'total_supply',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'total_supply', type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    name: 'balance_of',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt252' }],
    outputs: [{ name: 'balance', type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'felt252' },
      { name: 'spender', type: 'felt252' }
    ],
    outputs: [{ name: 'remaining', type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'felt252' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ name: 'success', type: 'core::bool' }],
    state_mutability: 'external',
  },
  {
    name: 'transfer_from',
    type: 'function',
    inputs: [
      { name: 'from', type: 'felt252' },
      { name: 'to', type: 'felt252' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ name: 'success', type: 'core::bool' }],
    state_mutability: 'external',
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'felt252' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ name: 'success', type: 'core::bool' }],
    state_mutability: 'external',
  },
];

export class ContractService {
  private provider: Provider;

  constructor() {
    const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
    this.provider = new RpcProvider({
      nodeUrl: isMainnet 
        ? 'https://starknet-mainnet.public.blastapi.io'
        : 'https://starknet-sepolia.public.blastapi.io'
    });
  }

  public getPaymentProcessorContract(account?: any): Contract {
    if (!CONTRACT_ADDRESSES.PAYMENT_PROCESSOR) {
      throw new Error('Payment processor contract address not configured');
    }
    
    return new Contract(
      PAYMENT_PROCESSOR_ABI,
      CONTRACT_ADDRESSES.PAYMENT_PROCESSOR,
      account || this.provider
    );
  }

  public getTokenContract(tokenAddress: string, account?: any): Contract {
    if (!tokenAddress) {
      throw new Error('Token address is required');
    }
    
    return new Contract(
      ERC20_ABI,
      tokenAddress,
      account || this.provider
    );
  }

  public async getMerchantRegistrationStatus(merchantAddress: string): Promise<boolean> {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.is_merchant_registered(merchantAddress);
      return Boolean(result);
    } catch (error) {
      console.error('Error checking merchant registration:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Contract not found')) {
          console.warn('Payment processor contract not deployed or address incorrect');
        } else if (error.message.includes('network')) {
          console.warn('Network connection issue while checking merchant registration');
        }
      }
      
      // Return false if contract doesn't exist or call fails
      return false;
    }
  }

  public async getTokenWhitelistStatus(tokenAddress: string): Promise<boolean> {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.is_token_whitelisted(tokenAddress);
      return Boolean(result);
    } catch (error) {
      console.error('Error checking token whitelist:', error);
      // Return false if contract doesn't exist or call fails
      return false;
    }
  }

  public async getPlatformFee(): Promise<number> {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.get_platform_fee_basis_points();
      return Number(result);
    } catch (error) {
      console.error('Error getting platform fee:', error);
      // Return default 2% fee if contract call fails
      return 200;
    }
  }

  public async getTreasuryAddress(): Promise<string> {
    try {
      const contract = this.getPaymentProcessorContract();
      const result = await contract.get_treasury_address();
      return result.toString();
    } catch (error) {
      console.error('Error getting treasury address:', error);
      throw new Error('Failed to get treasury address from contract');
    }
  }

  public async getTokenInfo(tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    try {
      const contract = this.getTokenContract(tokenAddress);
      
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      return {
        name: this.byteArrayToString(name),
        symbol: this.byteArrayToString(symbol),
        decimals: Number(decimals),
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      // Return default values if contract call fails
      if (tokenAddress.toLowerCase().includes('usdc')) {
        return { name: 'USD Coin', symbol: 'USDC', decimals: 6 };
      } else if (tokenAddress.toLowerCase().includes('usdt')) {
        return { name: 'Tether USD', symbol: 'USDT', decimals: 6 };
      } else {
        return { name: 'Unknown Token', symbol: 'UNK', decimals: 18 };
      }
    }
  }

  public async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const contract = this.getTokenContract(tokenAddress);
      const result = await contract.balance_of(userAddress);
      return result.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  public async getAllowance(tokenAddress: string, owner: string, spender: string): Promise<string> {
    try {
      const contract = this.getTokenContract(tokenAddress);
      const result = await contract.allowance(owner, spender);
      return result.toString();
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw new Error('Failed to get token allowance');
    }
  }

  public async registerMerchant(merchantAddress: string, account: any): Promise<string> {
    try {
      const contract = this.getPaymentProcessorContract(account);
      const call = contract.populate('register_merchant', [merchantAddress]);
      const response = await account.execute(call);
      return response.transaction_hash;
    } catch (error) {
      console.error('Error registering merchant:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          throw new Error('Merchant registration was rejected by user.');
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient ETH for transaction fees.');
        } else if (error.message.includes('already registered')) {
          throw new Error('Merchant is already registered on the platform.');
        } else if (error.message.includes('Contract not found')) {
          throw new Error('Payment processor contract not found. Please contact support.');
        } else {
          throw new Error(`Merchant registration failed: ${error.message}`);
        }
      } else {
        throw new Error('Failed to register merchant on blockchain');
      }
    }
  }

  private byteArrayToString(byteArray: any): string {
    try {
      // Handle Cairo ByteArray format
      if (typeof byteArray === 'object' && byteArray.data) {
        // Convert array of felt252 values to string
        const bytes = byteArray.data.map((felt: any) => Number(felt));
        return String.fromCharCode(...bytes);
      } else if (typeof byteArray === 'string') {
        return byteArray;
      } else {
        return byteArray.toString();
      }
    } catch (error) {
      console.warn('Error converting byte array to string:', error);
      return byteArray.toString();
    }
  }

  public formatTokenAmount(amount: string, decimals: number): string {
    const divisor = Math.pow(10, decimals);
    const formatted = (parseFloat(amount) / divisor).toFixed(decimals);
    return parseFloat(formatted).toString(); // Remove trailing zeros
  }

  public parseTokenAmount(amount: string, decimals: number): string {
    const multiplier = Math.pow(10, decimals);
    return Math.floor(parseFloat(amount) * multiplier).toString();
  }

  public isValidStarknetAddress(address: string): boolean {
    return /^0x[0-9a-fA-F]{1,64}$/.test(address);
  }

  public shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  public getExplorerUrl(txHash: string): string {
    const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
    const baseUrl = isMainnet 
      ? 'https://starkscan.co' 
      : 'https://sepolia.starkscan.co';
    return `${baseUrl}/tx/${txHash}`;
  }
}

export const contractService = new ContractService();