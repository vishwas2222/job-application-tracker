import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchApplications = createAsyncThunk('applications/fetchApplications', async (_, { getState }) => {
  const token = getState().auth.user?.token;
  const response = await axios.get(`${API_BASE}/applications`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

export const applyToJob = createAsyncThunk('applications/applyToJob', async (jobId, { getState }) => {
  const token = getState().auth.user?.token;
  const response = await axios.post(`${API_BASE}/jobs/${jobId}/apply`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchApplications.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchApplications.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(applyToJob.fulfilled, (state, action) => { state.list.push(action.payload); });
  },
});

export default applicationsSlice.reducer;
