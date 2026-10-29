import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/lib/store/auth-slice';
import { toastReducer } from '@/lib/store/toast-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
