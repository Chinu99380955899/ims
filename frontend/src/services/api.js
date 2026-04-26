import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_URL,
});

// Automatically attach the JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const invoiceApi = {
  list: async (params) => {
    const { data } = await client.get('/invoices', { params });
    return data;
  },
  
  get: async (id) => {
    const { data } = await client.get(`/invoices/${id}`);
    return data;
  },
  
  stats: async () => {
    const { data } = await client.get('/invoices/stats');
    return data;
  },
  
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await client.post('/invoices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },
};

export const reviewApi = {
  action: async (invoiceId, payload) => {
    const { data } = await client.post(`/invoices/${invoiceId}/review`, payload);
    return data;
  }
};