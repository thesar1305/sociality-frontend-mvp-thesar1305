import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isHydrated = true;
    },
    setSession(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
    clearSession(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { hydrateSession, setSession, clearSession } = authSlice.actions;

export const authReducer = authSlice.reducer;
