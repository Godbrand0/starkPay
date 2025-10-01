import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: string | null;
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<{ address: string; chainId: string }>) => {
      state.address = action.payload.address;
      state.isConnected = true;
      state.chainId = action.payload.chainId;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.isConnected = false;
      state.chainId = null;
    },
  },
});

export const { setWallet, disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;