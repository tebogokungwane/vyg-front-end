// axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vyg-rpth.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check CORS or backend availability');
    }
    return Promise.reject(error);
  }
);

export default api;