#[starknet::contract]
mod PaymentProcessor {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, storage::{Map, StorageMapReadAccess, StorageMapWriteAccess}};
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        treasury_address: ContractAddress,
        registered_merchants: Map<ContractAddress, bool>,
        whitelisted_tokens: Map<ContractAddress, bool>,
        platform_fee_basis_points: u256, // 200 = 2%
        reentrancy_guard: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MerchantRegistered: MerchantRegistered,
        PaymentProcessed: PaymentProcessed,
        TokenWhitelisted: TokenWhitelisted,
        FeeUpdated: FeeUpdated,
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

    #[constructor]
    fn constructor(
        ref self: ContractState,
        treasury_address: ContractAddress,
        owner: ContractAddress
    ) {
        assert(!treasury_address.is_zero(), 'Treasury cannot be zero address');
        assert(!owner.is_zero(), 'Owner cannot be zero address');
        
        self.owner.write(owner);
        self.treasury_address.write(treasury_address);
        
        let initial_fee = 200_u256; // 2%
        assert(initial_fee <= 1000, 'Initial fee too high'); // Max 10%
        self.platform_fee_basis_points.write(initial_fee);
    }

    // Internal functions for better reentrancy protection
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
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can register');
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
            // Reentrancy guard
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

            // Safe math calculations with overflow protection
            let max_fee_calculation = u256 { low: 0xffffffffffffffffffffffffffffffff, high: 0xffffffffffffffffffffffffffffffff } / fee_basis_points;
            assert(amount <= max_fee_calculation, 'Amount too large');
            
            let fee = (amount * fee_basis_points) / 10000;
            assert(fee <= amount, 'Fee calculation overflow');
            let net_amount = amount - fee;

            // Simulate token transfers (since we don't have IERC20 interface)
            // In a real implementation, you would call the token contract here
            // For now, we just validate and emit the event
            // Ensure treasury is valid for transfer
            assert(!treasury.is_zero(), 'Treasury cannot be zero');

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
