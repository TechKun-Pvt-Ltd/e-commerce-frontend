import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authServices from "@/services/auth";
import { LoginPayload, UserEssentials } from '@/types/domains/auth';

interface AuthState {
    user: UserEssentials | null;
    authenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    authenticated: false,
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginPayload, { rejectWithValue }) => {
        try {
            const response = await authServices.login(credentials);
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error) {
            return rejectWithValue((error as { error: string }).error || 'Login failed');
        }
    }
);

export const getMyInformation = createAsyncThunk(
    'auth/getMyInformation',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authServices.me();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch(error) {
            return rejectWithValue((error as { error: string }).error);
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authServices.logout();
            if (response.success)
                return response.data;

            return rejectWithValue(response.error);
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.authenticated = true;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.authenticated = false;
                state.error = action.payload as string;
            })
            .addCase(getMyInformation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyInformation.fulfilled, (state, action) => {
                state.loading = false;
                state.authenticated = true;
                state.user = action.payload;
            })
            .addCase(getMyInformation.rejected, (state, action) => {
                state.loading = false;
                state.authenticated = false;
                state.error = action.payload as string;
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.authenticated = false;
                state.user = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 