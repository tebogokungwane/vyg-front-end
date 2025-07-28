import axios from 'axios';

const instance = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:2025',
  baseURL: process.env.REACT_APP_API_BASE_URL,

  withCredentials: true
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.warn("403 Forbidden error");
    }
    return Promise.reject(error);
  }
);

export default instance;