import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const API_BASE = 'http://localhost:5000/api';

const persisted = localStorage.getItem('auth');
const initialUser = persisted ? JSON.parse(persisted) : null;

export const signup = createAsyncThunk('auth/signup', async (data) => {
  const response = await axios.post(`${API_BASE}/auth/signup`, data);
  return response.data;
});

export const login = createAsyncThunk('auth/login', async (data) => {
  const response = await axios.post(`${API_BASE}/auth/login`, data);
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.token;
        const parsed = jwtDecode(token);
        state.user = { token, email: parsed.email, role: parsed.role };
        localStorage.setItem('auth', JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
