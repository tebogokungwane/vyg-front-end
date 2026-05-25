// axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔁 Intercept responses to handle global errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check if backend is running and CORS is allowed');
    } else if (error.response) {
      console.error(`🚫 API Error [${error.response.status}]:`, error.response.data);
    } else {
      console.error('❗ Unexpected error:', error.message || error);
    }

    return Promise.reject(error);
  }
);

export default api;
