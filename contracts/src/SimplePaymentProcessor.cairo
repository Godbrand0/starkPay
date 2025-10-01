#[starknet::contract]
mod SimplePaymentProcessor {
    use crate::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp,
        storage::{Map, StorageMapReadAccess, StorageMapWriteAccess,
                  StoragePointerReadAccess, StoragePointerWriteAccess}
    };
    use core::num::traits::Zero;
    
    #[storage]
    struct Storage {
        owner: ContractAddress,                         // Admin
        treasury_address: ContractAddress,              // Treasury (receives fees)
        registered_merchants: Map<ContractAddress, bool>, // Merchants
        whitelisted_tokens: Map<ContractAddress, bool>,   // Allowed tokens
        platform_fee_basis_points: u256,               // 200 = 2%
        reentrancy_guard: bool,
        token_prices: Map<ContractAddress, u256>,      // Token prices in ETH (wei per token with decimals)
        eth_token_address: ContractAddress,             // ETH token address on Starknet
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MerchantRegistered: MerchantRegistered,
        PaymentProcessed: PaymentProcessed,
        TokenWhitelisted: TokenWhitelisted,
        FeeUpdated: FeeUpdated,
        TokensPurchased: TokensPurchased,
        TokenPriceUpdated: TokenPriceUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct MerchantRegistered {
        #[key]
        merchant: ContractAddress,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentProcessed {
        #[key]
        merchant: ContractAddress,
        #[key]
        payer: ContractAddress,
        token: ContractAddress,
        gross_amount: u256,
        net_amount: u256,
        fee: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct TokenWhitelisted {
        #[key]
        token: ContractAddress,
        whitelisted: bool
    }

    #[derive(Drop, starknet::Event)]
    struct FeeUpdated {
        old_fee: u256,
        new_fee: u256
    }

    #[derive(Drop, starknet::Event)]
    struct TokensPurchased {
        #[key]
        buyer: ContractAddress,
        token: ContractAddress,
        eth_amount: u256,
        token_amount: u256,
        timestamp: u64
    }

    #[derive(Drop, starknet::Event)]
    struct TokenPriceUpdated {
        #[key]
        token: ContractAddress,
        old_price: u256,
        new_price: u256
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        treasury_address: ContractAddress,
        eth_token_address: ContractAddress
    ) {
        assert(!owner.is_zero(), 'Owner cannot be zero address');
        assert(!treasury_address.is_zero(), 'Treasury cannot be zero address');
        assert(!eth_token_address.is_zero(), 'ETH address cannot be zero');

        self.owner.write(owner);
        self.treasury_address.write(treasury_address);
        self.eth_token_address.write(eth_token_address);

        let initial_fee = 200_u256; // 2%
        assert(initial_fee <= 1000, 'Initial fee too high'); // Max 10%
        self.platform_fee_basis_points.write(initial_fee);
        self.reentrancy_guard.write(false);
    }

    // Internal functions for reentrancy protection
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _nonreentrant_start(ref self: ContractState) {
            assert(!self.reentrancy_guard.read(), 'Reentrant call');
            self.reentrancy_guard.write(true);
        }
        
        fn _nonreentrant_end(ref self: ContractState) {
            self.reentrancy_guard.write(false);
        }
    }

    #[abi(embed_v0)]
    impl PaymentProcessorImpl of crate::interfaces::IPaymentProcessor<ContractState> {
        fn register_merchant(ref self: ContractState, merchant_address: ContractAddress) {
            assert(!merchant_address.is_zero(), 'Merchant cannot be zero address');
            assert(!self.registered_merchants.read(merchant_address), 'Merchant already registered');

            self.registered_merchants.write(merchant_address, true);

            self.emit(MerchantRegistered {
                merchant: merchant_address,
                timestamp: get_block_timestamp()
            });
        }

        fn process_payment(
            ref self: ContractState,
            merchant_address: ContractAddress,
            token_address: ContractAddress,
            amount: u256
        ) {
            self._nonreentrant_start();
            
            // Input validations
            assert(!merchant_address.is_zero(), 'Merchant cannot be zero address');
            assert(!token_address.is_zero(), 'Token cannot be zero address');
            assert(self.registered_merchants.read(merchant_address), 'Merchant not registered');
            assert(self.whitelisted_tokens.read(token_address), 'Token not whitelisted');
            assert(amount > 0, 'Amount must be positive');

            let caller = get_caller_address();
            let treasury = self.treasury_address.read();
            let fee_basis_points = self.platform_fee_basis_points.read();

            let token = IERC20Dispatcher { contract_address: token_address };
            
            // CRITICAL: Check payer has sufficient balance
            let balance = token.balance_of(caller);
            assert(balance >= amount, 'Insufficient balance');
            
            // CRITICAL: Check allowance before attempting transfer_from
            let allowance = token.allowance(caller, starknet::get_contract_address());
            assert(allowance >= amount, 'Insufficient allowance');

            // Calculate fees
            let fee = (amount * fee_basis_points) / 10000;
            let net_amount = amount - fee;
            
            // Transfer fee to treasury
            if fee > 0 {
                let success = token.transfer_from(caller, treasury, fee);
                assert(success, 'Fee transfer failed');
            }
            
            // Transfer net amount to merchant
            let success = token.transfer_from(caller, merchant_address, net_amount);
            assert(success, 'Payment transfer failed');
            
            self.emit(PaymentProcessed {
                merchant: merchant_address,
                payer: caller,
                token: token_address,
                gross_amount: amount,
                net_amount: net_amount,
                fee: fee,
                timestamp: get_block_timestamp()
            });

            self._nonreentrant_end();
        }

        fn buy_tokens_with_eth(
            ref self: ContractState,
            token_address: ContractAddress,
            min_tokens: u256
        ) {
            self._nonreentrant_start();

            assert(!token_address.is_zero(), 'Token cannot be zero address');
            assert(self.whitelisted_tokens.read(token_address), 'Token not whitelisted');

            let caller = get_caller_address();
            let contract_address = starknet::get_contract_address();
            let eth_token_addr = self.eth_token_address.read();

            // Get ETH token contract
            let eth_token = IERC20Dispatcher { contract_address: eth_token_addr };

            // Check ETH allowance
            let eth_allowance = eth_token.allowance(caller, contract_address);
            assert(eth_allowance > 0, 'No ETH allowance');

            // Get token price (wei per token)
            let token_price = self.token_prices.read(token_address);
            assert(token_price > 0, 'Token price not set');

            // Calculate how many tokens can be bought
            let token_amount = (eth_allowance * 1000000) / token_price; // Assuming 6 decimals for tokens
            assert(token_amount >= min_tokens, 'Insufficient ETH for min tokens');

            // Calculate actual ETH needed
            let eth_needed = (token_amount * token_price) / 1000000;

            // Transfer ETH from buyer to treasury
            let success = eth_token.transfer_from(caller, self.treasury_address.read(), eth_needed);
            assert(success, 'ETH transfer failed');

            // Transfer tokens to buyer (from treasury or contract)
            let token = IERC20Dispatcher { contract_address: token_address };
            let token_success = token.transfer(caller, token_amount);
            assert(token_success, 'Token transfer failed');

            self.emit(TokensPurchased {
                buyer: caller,
                token: token_address,
                eth_amount: eth_needed,
                token_amount: token_amount,
                timestamp: get_block_timestamp()
            });

            self._nonreentrant_end();
        }

        // ---- ADMIN FUNCTIONS ----
        fn whitelist_token(ref self: ContractState, token_address: ContractAddress, whitelisted: bool) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can whitelist');
            assert(!token_address.is_zero(), 'Token cannot be zero address');
            
            self.whitelisted_tokens.write(token_address, whitelisted);
            
            self.emit(TokenWhitelisted {
                token: token_address,
                whitelisted: whitelisted
            });
        }

        fn update_platform_fee(ref self: ContractState, new_fee_basis_points: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can update fee');
            assert(new_fee_basis_points <= 1000, 'Fee too high'); // Max 10%
            
            let old_fee = self.platform_fee_basis_points.read();
            self.platform_fee_basis_points.write(new_fee_basis_points);
            
            self.emit(FeeUpdated {
                old_fee: old_fee,
                new_fee: new_fee_basis_points
            });
        }

        fn set_token_price(ref self: ContractState, token_address: ContractAddress, eth_price: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can set price');
            assert(!token_address.is_zero(), 'Token cannot be zero address');
            assert(eth_price > 0, 'Price must be positive');

            let old_price = self.token_prices.read(token_address);
            self.token_prices.write(token_address, eth_price);

            self.emit(TokenPriceUpdated {
                token: token_address,
                old_price: old_price,
                new_price: eth_price
            });
        }

        // ---- VIEWS ----
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

        fn get_token_price(self: @ContractState, token_address: ContractAddress) -> u256 {
            self.token_prices.read(token_address)
        }
    }
}