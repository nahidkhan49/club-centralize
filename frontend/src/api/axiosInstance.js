import axios from 'axios';

// Create an Axios instance with base URL from Vite env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://club-centralize-1.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
