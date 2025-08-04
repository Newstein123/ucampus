import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LoginUser } from '@/types/auth';
import { RESET_ROOT_STATE } from '../types';

interface AuthState {
    user: LoginUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(
            state,
            action: PayloadAction<{
                user: LoginUser;
            }>,
        ) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(RESET_ROOT_STATE, () => initialState);
    },
});

export const { setUser, logout, setLoading, setError } = authSlice.actions;

// Use proper typing for selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
