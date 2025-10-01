use starknet::ContractAddress;

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, to: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, amount: u256
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
pub trait IPaymentProcessor<TContractState> {
    fn register_merchant(ref self: TContractState, merchant_address: ContractAddress);
    fn process_payment(
        ref self: TContractState,
        merchant_address: ContractAddress,
        token_address: ContractAddress,
        amount: u256
    );
    fn buy_tokens_with_eth(
        ref self: TContractState,
        token_address: ContractAddress,
        min_tokens: u256
    );
    fn whitelist_token(ref self: TContractState, token_address: ContractAddress, whitelisted: bool);
    fn update_platform_fee(ref self: TContractState, new_fee_basis_points: u256);
    fn set_token_price(ref self: TContractState, token_address: ContractAddress, eth_price: u256);

    // View functions
    fn is_merchant_registered(self: @TContractState, merchant_address: ContractAddress) -> bool;
    fn is_token_whitelisted(self: @TContractState, token_address: ContractAddress) -> bool;
    fn get_treasury_address(self: @TContractState) -> ContractAddress;
    fn get_platform_fee_basis_points(self: @TContractState) -> u256;
    fn get_token_price(self: @TContractState, token_address: ContractAddress) -> u256;
}

#[starknet::interface]
pub trait IMockToken<TContractState> {
    // ERC20 functions
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, to: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState, from: ContractAddress, to: ContractAddress, amount: u256
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    
    // Minting function for testing
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);
}
