import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:2025',
  withCredentials: true
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log(`🔐 [axios] Added Authorization header to ${config.url}`);
    } else {
      console.warn(`⚠️ [axios] No token found in localStorage for request to ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ [axios] Request error:", error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.warn("🚫 [axios] 403 Forbidden received:", error.config.url);
    }
    return Promise.reject(error);
  }
);

export default instance;
