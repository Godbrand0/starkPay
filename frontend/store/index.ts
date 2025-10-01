import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import merchantReducer from './merchantSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    merchant: merchantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;