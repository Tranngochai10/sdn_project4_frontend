import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/api';

// Login
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const res = await authAPI.login(credentials);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

// Signup
export const signupUser = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
    try {
        const res = await authAPI.signup(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Signup failed');
    }
});

// Load from localStorage – discard expired tokens
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; // treat malformed token as expired
    }
};

const rawToken = localStorage.getItem('token');
const tokenValid = rawToken && !isTokenExpired(rawToken);

if (!tokenValid) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

const tokenFromStorage = tokenValid ? rawToken : null;
const userFromStorage = tokenValid && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage,
        token: tokenFromStorage,
        isAdmin: userFromStorage?.admin || false,
        loading: false,
        error: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAdmin = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAdmin = action.payload.user?.admin || false;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Signup
        builder
            .addCase(signupUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAdmin = action.payload.user?.admin || false;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
