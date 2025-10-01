#[starknet::contract]
mod MockUSDT {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.name.write("Mock Tether USD");
        self.symbol.write("mUSDT");
        self.decimals.write(6_u8);
        self.total_supply.write(0);
        self.owner.write(owner);
    }

    #[abi(embed_v0)]
    impl MockTokenImpl of crate::interfaces::IMockToken<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }

        fn allowance(self: @ContractState, owner: ContractAddress, spender: ContractAddress) -> u256 {
            self.allowances.read((owner, spender))
        }

        fn transfer(ref self: ContractState, to: ContractAddress, amount: u256) -> bool {
            let caller = get_caller_address();
            self._transfer(caller, to, amount);
            true
        }

        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, amount: u256
        ) -> bool {
            let caller = get_caller_address();
            let current_allowance = self.allowances.read((from, caller));
            assert(current_allowance >= amount, 'Insufficient allowance');
            self.allowances.write((from, caller), current_allowance - amount);
            self._transfer(from, to, amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let caller = get_caller_address();
            self.allowances.write((caller, spender), amount);
            self.emit(Approval { owner: caller, spender, value: amount });
            true
        }

        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can mint');
            let new_total_supply = self.total_supply.read() + amount;
            self.total_supply.write(new_total_supply);
            let new_balance = self.balances.read(to) + amount;
            self.balances.write(to, new_balance);
            self.emit(Transfer { from: Zero::zero(), to, value: amount });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _transfer(ref self: ContractState, from: ContractAddress, to: ContractAddress, amount: u256) {
            assert(!from.is_zero(), 'Transfer from zero address');
            assert(!to.is_zero(), 'Transfer to zero address');
            let from_balance = self.balances.read(from);
            assert(from_balance >= amount, 'Insufficient balance');
            self.balances.write(from, from_balance - amount);
            let to_balance = self.balances.read(to);
            self.balances.write(to, to_balance + amount);
            self.emit(Transfer { from, to, value: amount });
        }
    }
}
