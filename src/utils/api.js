import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3010',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication tokens
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3010'}/api/auth/refresh`,
            { refreshToken }
          );

          const { token: newToken } = response.data;
          localStorage.setItem('token', newToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// Retry logic for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
    if (
      error.response?.status >= 400 &&
      error.response?.status < 500 &&
      error.response?.status !== 408 &&
      error.response?.status !== 429
    ) {
      throw error;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Exponential backoff
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// API methods with retry logic
export const apiClient = {
  get: (url, config) => retryRequest(() => api.get(url, config)),
  post: (url, data, config) => retryRequest(() => api.post(url, data, config)),
  put: (url, data, config) => retryRequest(() => api.put(url, data, config)),
  delete: (url, config) => retryRequest(() => api.delete(url, config)),
  patch: (url, data, config) => retryRequest(() => api.patch(url, data, config)),
};

export default api;
