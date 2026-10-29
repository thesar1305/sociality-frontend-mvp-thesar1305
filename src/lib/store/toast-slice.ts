import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'success' | 'error';

type ToastState = {
  id: number;
  message: string;
  variant: ToastVariant;
} | null;

type ShowToastPayload = {
  message: string;
  variant?: ToastVariant;
};

let nextToastId = 1;

const toastSlice = createSlice({
  name: 'toast',
  initialState: null as ToastState,
  reducers: {
    showToast: {
      reducer: (_state, action: PayloadAction<NonNullable<ToastState>>) =>
        action.payload,
      prepare: ({ message, variant = 'success' }: ShowToastPayload) => ({
        payload: { id: nextToastId++, message, variant },
      }),
    },
    dismissToast: () => null,
  },
});

export const { showToast, dismissToast } = toastSlice.actions;

export const toastReducer = toastSlice.reducer;
