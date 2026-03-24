import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { getState }) => {
  const token = getState().auth.user?.token;
  const response = await axios.get(`${API_BASE}/jobs`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData, { getState }) => {
  const token = getState().auth.user?.token;
  const response = await axios.post(`${API_BASE}/jobs`, jobData, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, ...jobData }, { getState }) => {
  const token = getState().auth.user?.token;
  const response = await axios.put(`${API_BASE}/jobs/${id}`, jobData, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id, { getState }) => {
  const token = getState().auth.user?.token;
  await axios.delete(`${API_BASE}/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return id;
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(createJob.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateJob.fulfilled, (state, action) => { const i = state.list.findIndex((j) => j.id === action.payload.id); if (i !== -1) state.list[i] = action.payload; })
      .addCase(deleteJob.fulfilled, (state, action) => { state.list = state.list.filter((j) => j.id !== action.payload); });
  },
});

export default jobsSlice.reducer;
