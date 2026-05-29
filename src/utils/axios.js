// axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔍 Request interceptor - log outgoing requests
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || ''}${config.url}`;
    console.log(`📤 [${config.method?.toUpperCase()}] ${fullUrl}`);
    console.log(`   ↳ Origin: ${window.location.origin}`);
    console.log(`   ↳ Headers:`, config.headers);
    if (config.data) {
      console.log(`   ↳ Body:`, typeof config.data === 'string' ? JSON.parse(config.data) : config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error.message);
    return Promise.reject(error);
  }
);

// 🔁 Response interceptor - log responses and diagnose CORS
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.status}] ${response.config.url}`);
    // Log CORS-related headers for debugging
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
    };
    const hasCors = Object.values(corsHeaders).some(v => v);
    if (hasCors) {
      console.log(`   ↳ CORS headers:`, corsHeaders);
    }
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 ═══════════════════════════════════════════');
      console.error('🌐 NETWORK/CORS ERROR DETECTED');
      console.error('🌐 ═══════════════════════════════════════════');
      console.error(`🌐 Request: [${error.config?.method?.toUpperCase()}] ${error.config?.baseURL}${error.config?.url}`);
      console.error(`🌐 Frontend origin: ${window.location.origin}`);
      console.error(`🌐 Backend target: ${error.config?.baseURL}`);
      console.error('🌐 ───────────────────────────────────────────');
      console.error('🌐 Possible causes:');
      console.error('🌐  1. Backend is not running or sleeping (Render free tier)');
      console.error('🌐  2. CORS: Backend does not allow origin:', window.location.origin);
      console.error('🌐  3. CORS: JwtFilter is blocking OPTIONS preflight requests');
      console.error('🌐  4. SSL/HTTPS mismatch between frontend and backend');
      console.error('🌐 ───────────────────────────────────────────');
      console.error('🌐 Fix: Ensure backend CorsConfig includes:', window.location.origin);
      console.error('🌐 Fix: Ensure JwtFilter skips OPTIONS method');
      console.error('🌐 ═══════════════════════════════════════════');
    } else if (error.response) {
      const status = error.response.status;
      const url = error.config?.url;
      console.error(`🚫 [${status}] ${url}:`, error.response.data);

      if (status === 403) {
        console.warn(`⚠️ 403 Forbidden - Check if:`);
        console.warn(`   ↳ Token is present: ${!!error.config?.headers?.Authorization}`);
        console.warn(`   ↳ User role has access to: ${url}`);
        console.warn(`   ↳ Endpoint is in permitAll() list`);
      }

      if (status === 401) {
        console.warn(`⚠️ 401 Unauthorized - Token may be expired or invalid`);
        console.warn(`   ↳ Token sent: ${error.config?.headers?.Authorization?.substring(0, 30)}...`);
      }
    } else if (error.request) {
      console.error('❗ No response received (request was made but no reply)');
      console.error('   ↳ This usually means the server is down or CORS blocked the preflight');
    } else {
      console.error('❗ Unexpected error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
