import axios from 'axios';

const IS_DEV = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach token, minimal logging in dev only
api.interceptors.request.use(
  (config) => {
    // Auto-attach token from localStorage if not already set
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (IS_DEV) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — lightweight error handling, verbose only in dev
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      if (IS_DEV) {
        console.error(`Network error: [${error.config?.method?.toUpperCase()}] ${error.config?.url}`);
        console.error('Backend may be down or CORS is blocking the request.');
      }
    } else if (error.response) {
      const { status } = error.response;

      // Auto-logout on 401 (expired/invalid token)
      if (status === 401) {
        const currentPath = window.location.pathname;
        // Don't redirect if already on login page or if this IS the login request
        if (currentPath !== "/" && !error.config?.url?.includes("/login")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      }

      if (IS_DEV) {
        console.error(`[${status}] ${error.config?.url}:`, error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
