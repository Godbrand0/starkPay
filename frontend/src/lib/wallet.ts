import { Account, Contract, Provider, constants, RpcProvider } from 'starknet';
import { connect, disconnect } from '@starknet-io/get-starknet';

export interface WalletState {
  account: Account | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  provider: Provider | null;
}

export class WalletManager {
  private state: WalletState = {
    account: null,
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    provider: null,
  };

  private listeners: Array<(state: WalletState) => void> = [];
  private walletInstance: any = null;

  public getState(): WalletState {
    return { ...this.state };
  }

  public getAccount(): Account | null {
    if (!this.walletInstance || !this.state.address || !this.state.provider) {
      return null;
    }

    // Create account instance on demand
    try {
      return new Account(
        this.state.provider,
        this.state.address,
        this.walletInstance,
        undefined,
        constants.TRANSACTION_VERSION.V3
      );
    } catch (error) {
      console.error('Error creating account:', error);
      return null;
    }
  }

  public subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  public async connectWallet(): Promise<void> {
    try {
      this.state.isConnecting = true;
      this.notifyListeners();

      // Connect to Starknet wallet
      const starknet = await connect({
        modalMode: 'canAsk',
        modalTheme: 'dark'
      });

      if (!starknet) {
        throw new Error('No Starknet wallet found. Please install ArgentX or Braavos wallet.');
      }

      // Request wallet connection
      const accounts = await starknet.request({
        type: 'wallet_requestAccounts'
      });

      // Get the first account address
      const accountAddress = accounts?.[0];
      if (!accountAddress) {
        throw new Error('No account address available. Please unlock your wallet and select an account.');
      }

      // Get the current chain ID
      const chainId = await starknet.request({ type: 'wallet_requestChainId' });
      
      // Determine the network and create provider
      const isMainnet = chainId === constants.StarknetChainId.SN_MAIN;
      const provider = new RpcProvider({
        nodeUrl: isMainnet 
          ? 'https://starknet-mainnet.public.blastapi.io'
          : 'https://starknet-sepolia.public.blastapi.io'
      });

      this.walletInstance = starknet;
      this.state = {
        account: null, // We'll set this when we need to make transactions
        address: accountAddress,
        isConnected: true,
        isConnecting: false,
        chainId: chainId,
        provider,
      };

      this.notifyListeners();

      // Listen for account changes
      if (starknet.on) {
        starknet.on('accountsChanged', (accounts: string[] | undefined) => {
          if (!accounts || accounts.length === 0) {
            this.disconnectWallet();
          } else {
            this.state.address = accounts[0];
            this.state.account = null;
            this.notifyListeners();
          }
        });

        // Listen for network changes
        starknet.on('networkChanged', (chainId?: string) => {
          if (chainId) {
            this.state.chainId = chainId;
            this.notifyListeners();
            // Optionally reconnect with new network
            window.location.reload();
          }
        });
      }

    } catch (error) {
      this.state.isConnecting = false;
      this.notifyListeners();
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('Connection was rejected by user. Please try again.');
        } else if (error.message.includes('No wallet found')) {
          throw new Error('No Starknet wallet found. Please install ArgentX or Braavos wallet extension.');
        } else if (error.message.includes('wallet not installed')) {
          throw new Error('Starknet wallet not installed. Please install ArgentX or Braavos wallet.');
        } else if (error.message.includes('Network not supported')) {
          throw new Error('Network not supported. Please switch to Mainnet or Sepolia in your wallet.');
        } else {
          throw new Error(`Failed to connect wallet: ${error.message}`);
        }
      } else {
        throw new Error('An unexpected error occurred while connecting to your wallet.');
      }
    }
  }

  public async disconnectWallet(): Promise<void> {
    try {
      if (this.walletInstance && this.walletInstance.off) {
        // Remove event listeners
        this.walletInstance.off('accountsChanged');
        this.walletInstance.off('networkChanged');
      }
      
      await disconnect();
    } catch (error) {
      console.warn('Error disconnecting wallet:', error);
    }

    this.walletInstance = null;
    this.state = {
      account: null,
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      provider: null,
    };

    this.notifyListeners();
  }

  public async getTokenBalance(tokenAddress: string): Promise<string> {
    if (!this.state.address || !this.state.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const erc20Contract = new Contract(
        [
          {
            name: 'balanceOf',
            type: 'function',
            inputs: [{ name: 'account', type: 'felt252' }],
            outputs: [{ name: 'balance', type: 'core::integer::u256' }],
            state_mutability: 'view',
          }
        ],
        tokenAddress,
        this.state.provider!
      );

      const result = await erc20Contract.balanceOf(this.state.address);
      return result.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Contract not found')) {
          throw new Error('Token contract not found. Please verify the token address.');
        } else if (error.message.includes('Invalid address')) {
          throw new Error('Invalid token address format.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(`Failed to get token balance: ${error.message}`);
        }
      } else {
        throw new Error('Failed to get token balance. Please check if the token contract exists.');
      }
    }
  }

  public async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    const account = this.getAccount();
    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const erc20Contract = new Contract(
        [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'felt252' },
              { name: 'amount', type: 'core::integer::u256' }
            ],
            outputs: [{ name: 'success', type: 'core::bool' }],
            state_mutability: 'external',
          }
        ],
        tokenAddress,
        account
      );

      const call = erc20Contract.populate('approve', [spenderAddress, amount]);
      const response = await account.execute(call);
      
      return response.transaction_hash;
    } catch (error) {
      console.error('Error approving token:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          throw new Error('Token approval was rejected by user.');
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient ETH for transaction fees.');
        } else if (error.message.includes('Invalid amount')) {
          throw new Error('Invalid approval amount.');
        } else if (error.message.includes('Contract not found')) {
          throw new Error('Token contract not found. Please verify the token address.');
        } else {
          throw new Error(`Token approval failed: ${error.message}`);
        }
      } else {
        throw new Error('Failed to approve token. Please try again.');
      }
    }
  }

  public async processPayment(
    contractAddress: string,
    merchantAddress: string,
    tokenAddress: string,
    amount: string
  ): Promise<string> {
    const account = this.getAccount();
    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const paymentContract = new Contract(
        [
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
          }
        ],
        contractAddress,
        account
      );

      const call = paymentContract.populate('process_payment', [
        merchantAddress,
        tokenAddress,
        amount
      ]);
      
      const response = await account.execute(call);
      return response.transaction_hash;
    } catch (error) {
      console.error('Error processing payment:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          throw new Error('Payment was rejected by user.');
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient ETH for transaction fees.');
        } else if (error.message.includes('insufficient balance')) {
          throw new Error('Insufficient token balance for payment.');
        } else if (error.message.includes('allowance')) {
          throw new Error('Insufficient token allowance. Please approve more tokens.');
        } else if (error.message.includes('Contract not found')) {
          throw new Error('Payment processor contract not found.');
        } else if (error.message.includes('Merchant not registered')) {
          throw new Error('Merchant is not registered on the platform.');
        } else {
          throw new Error(`Payment failed: ${error.message}`);
        }
      } else {
        throw new Error('Payment failed. Please check your balance and allowances.');
      }
    }
  }

  public async waitForTransaction(txHash: string): Promise<any> {
    if (!this.state.provider) {
      throw new Error('Provider not available');
    }

    try {
      const receipt = await this.state.provider.waitForTransaction(txHash, {
        retryInterval: 1000,
        successStates: ['ACCEPTED_ON_L2', 'ACCEPTED_ON_L1']
      });
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Transaction is taking longer than expected. Please check the transaction status manually.');
        } else if (error.message.includes('rejected')) {
          throw new Error('Transaction was rejected by the network.');
        } else if (error.message.includes('reverted')) {
          throw new Error('Transaction was reverted. Please check your transaction parameters.');
        } else if (error.message.includes('nonce')) {
          throw new Error('Nonce error. Please try again or reset your wallet.');
        } else {
          throw new Error(`Transaction error: ${error.message}`);
        }
      } else {
        throw new Error('Transaction failed or timed out. Please check the transaction hash.');
      }
    }
  }

  public async estimateFee(contractAddress: string, calls: any[]): Promise<any> {
    const account = this.getAccount();
    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const feeEstimate = await account.estimateFee(calls);
      return feeEstimate;
    } catch (error) {
      console.error('Error estimating fee:', error);
      throw new Error('Failed to estimate transaction fee.');
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
}

export const walletManager = new WalletManager();