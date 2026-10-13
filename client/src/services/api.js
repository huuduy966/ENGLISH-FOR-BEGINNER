import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('e4b_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized and 429 rate limit exceeded
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // If token expired, clear and optionally redirect
        if (localStorage.getItem('e4b_token')) {
          localStorage.removeItem('e4b_token');
          localStorage.removeItem('e4b_user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 429) {
        // Attach friendly rate limit metadata to error object without disrupting user state
        const retryAfter = error.response.headers?.['retry-after'] || error.response.data?.retryAfter || error.response.data?.error?.retryAfter;
        error.isRateLimited = true;
        error.retryAfter = retryAfter ? parseInt(retryAfter, 10) : null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
