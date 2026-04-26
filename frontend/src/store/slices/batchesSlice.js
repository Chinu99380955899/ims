/**
 * Batches slice — connected to PostgreSQL Backend!
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// We get the token directly here to make the API calls simple
const getToken = () => localStorage.getItem('token');

// 1. Fetch historical batches from PostgreSQL
export const fetchBatches = createAsyncThunk('batches/fetchAll', async () => {
  const response = await axios.get(`${API_URL}/batches`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
});

// 2. Create a new batch in PostgreSQL
export const startBatch = createAsyncThunk('batches/create', async (totalInvoices) => {
  const response = await axios.post(`${API_URL}/batches`, { total_invoices: totalInvoices }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return response.data;
});

const initialState = {
  batches: [],
  activeBatchId: null,
  status: 'idle'
};

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    // Append locally while the batch is processing for instant UI updates
    appendInvoiceToBatch(state, { payload }) {
      const b = state.batches.find((x) => x.id === payload.batchId);
      if (b) {
        // Prevent duplicates if multiple updates fire
        if (!b.invoices.find(inv => inv.id === payload.invoice.id)) {
            b.invoices.push(payload.invoice);
        }
      }
    },
    setActiveBatch(state, { payload }) {
      state.activeBatchId = payload;
    },
    clearBatches(state) {
      state.batches = [];
      state.activeBatchId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
        if (!state.activeBatchId && action.payload.length > 0) {
            state.activeBatchId = action.payload[0].id;
        }
      })
      .addCase(startBatch.fulfilled, (state, action) => {
        state.batches.unshift(action.payload);
        state.activeBatchId = action.payload.id;
      });
  }
});

export const { appendInvoiceToBatch, setActiveBatch, clearBatches } = batchesSlice.actions;

export const selectAllBatches = (s) => s.batches.batches;
export const selectActiveBatch = (s) => {
  const { batches, activeBatchId } = s.batches;
  if (!batches.length) return null;
  if (!activeBatchId) return batches[0];
  return batches.find((b) => b.id === activeBatchId) || batches[0];
};

export default batchesSlice.reducer;