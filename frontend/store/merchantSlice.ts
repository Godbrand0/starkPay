import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MerchantState {
  isRegistered: boolean;
  merchantData: {
    address: string;
    name: string;
    description?: string;
    email?: string;
    totalEarnings: number;
    transactionCount: number;
  } | null;
  loading: boolean;
}

const initialState: MerchantState = {
  isRegistered: false,
  merchantData: null,
  loading: false,
};

const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    setMerchantRegistered: (state, action: PayloadAction<boolean>) => {
      state.isRegistered = action.payload;
    },
    setMerchantData: (state, action: PayloadAction<MerchantState['merchantData']>) => {
      state.merchantData = action.payload;
      state.isRegistered = action.payload !== null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetMerchant: (state) => {
      state.isRegistered = false;
      state.merchantData = null;
      state.loading = false;
    },
  },
});

export const { setMerchantRegistered, setMerchantData, setLoading, resetMerchant } = merchantSlice.actions;
export default merchantSlice.reducer;