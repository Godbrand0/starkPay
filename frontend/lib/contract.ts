import { Contract, RpcProvider, AccountInterface, CallData, cairo } from "starknet";
import paymentProcessorContractClass from "./abi.json";

const PAYMENT_PROCESSOR_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS!;
const MOCK_USDC_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS!;
const MOCK_USDT_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io";

export const provider = new RpcProvider({ nodeUrl: RPC_URL });

// Extract ABI from contract class
const paymentProcessorAbi = (paymentProcessorContractClass as any).abi;

export const getPaymentProcessorContract = (account?: AccountInterface) => {
  return new Contract(
    paymentProcessorAbi,
    PAYMENT_PROCESSOR_ADDRESS,
    account || provider
  );
};

export const getTokenContract = (tokenAddress: string, account?: AccountInterface) => {
  const erc20Abi = [
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        { "name": "recipient", "type": "core::starknet::contract_address::ContractAddress" },
        { "name": "amount", "type": "core::integer::u256" }
      ],
      "outputs": [{ "type": "core::bool" }],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "spender", "type": "core::starknet::contract_address::ContractAddress" },
        { "name": "amount", "type": "core::integer::u256" }
      ],
      "outputs": [{ "type": "core::bool" }],
      "state_mutability": "external"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        { "name": "owner", "type": "core::starknet::contract_address::ContractAddress" },
        { "name": "spender", "type": "core::starknet::contract_address::ContractAddress" }
      ],
      "outputs": [{ "type": "core::integer::u256" }],
      "state_mutability": "view"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [
        { "name": "account", "type": "core::starknet::contract_address::ContractAddress" }
      ],
      "outputs": [{ "type": "core::integer::u256" }],
      "state_mutability": "view"
    }
  ];

  return new Contract(erc20Abi, tokenAddress, account || provider);
};

export const checkMerchantRegistration = async (merchantAddress: string): Promise<boolean> => {
  try {
    const contract = getPaymentProcessorContract();
    const result = await contract.is_merchant_registered(merchantAddress);
    return result as boolean;
  } catch (error) {
    console.error("Error checking merchant registration:", error);
    return false;
  }
};

export const registerMerchant = async (account: AccountInterface, merchantAddress: string) => {
  try {
    const contract = getPaymentProcessorContract(account);
    const call = contract.populate("register_merchant", [merchantAddress]);
    const tx = await account.execute(call);
    await provider.waitForTransaction(tx.transaction_hash);
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error registering merchant:", error);
    throw error;
  }
};

export const processPayment = async (
  account: AccountInterface,
  merchantAddress: string,
  tokenAddress: string,
  amount: bigint
) => {
  try {
    const contract = getPaymentProcessorContract(account);

    // Convert amount to u256 format
    const u256Amount = cairo.uint256(amount);

    const call = contract.populate("process_payment", [
      merchantAddress,
      tokenAddress,
      u256Amount
    ]);

    const tx = await account.execute(call);
    await provider.waitForTransaction(tx.transaction_hash);
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export const approveToken = async (
  account: AccountInterface,
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint
) => {
  try {
    const tokenContract = getTokenContract(tokenAddress, account);
    const u256Amount = cairo.uint256(amount);

    const call = tokenContract.populate("approve", [spenderAddress, u256Amount]);
    const tx = await account.execute(call);
    await provider.waitForTransaction(tx.transaction_hash);
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error approving token:", error);
    throw error;
  }
};

export const checkTokenAllowance = async (
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
): Promise<bigint> => {
  try {
    const tokenContract = getTokenContract(tokenAddress);
    const result = await tokenContract.allowance(ownerAddress, spenderAddress);
    return result as bigint;
  } catch (error) {
    console.error("Error checking allowance:", error);
    return 0n;
  }
};

export const getTokenBalance = async (tokenAddress: string, accountAddress: string): Promise<bigint> => {
  try {
    const tokenContract = getTokenContract(tokenAddress);
    const result = await tokenContract.balanceOf(accountAddress);
    return result as bigint;
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0n;
  }
};

export const formatTokenAmount = (amount: bigint, decimals: number = 6): string => {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalStr}`;
};

export const parseTokenAmount = (amount: string, decimals: number = 6): bigint => {
  const [integerPart, fractionalPart = '0'] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const fullAmount = integerPart + paddedFractional;
  return BigInt(fullAmount);
};

export const TOKENS = {
  USDC: {
    address: MOCK_USDC_ADDRESS,
    symbol: "mUSDC",
    name: "Mock USD Coin",
    decimals: 6,
  },
  USDT: {
    address: MOCK_USDT_ADDRESS,
    symbol: "mUSDT",
    name: "Mock Tether USD",
    decimals: 6,
  },
};