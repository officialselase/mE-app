// ============================================================================
// IMPORTS AND CONSTANTS
// ============================================================================

import axios from 'axios';
import { handleAPIError, logError, retryRequest } from './errorHandler';
import { createDeduplicatedAPI } from './requestDeduplication';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

/**
 * Enhanced error handling utility for Django-specific error formats
 * Processes Django API errors and returns standardized error information
 * @param {Error} error - The error object from axios
 * @returns {Object} Standardized error information object
 */
export const handleDjangoError = (error) => {
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Handle field-specific validation errors
    if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
      const fieldErrors = {};
      Object.keys(errorData).forEach(field => {
        if (Array.isArray(errorData[field])) {
          fieldErrors[field] = errorData[field][0]; // Take first error message
        } else {
          fieldErrors[field] = errorData[field];
        }
      });
      return { 
        type: 'validation', 
        errors: fieldErrors,
        message: 'Please correct the highlighted fields.',
        status: error.response.status,
        shouldRetry: false
      };
    }
    
    // Handle general error messages
    const message = errorData.detail || errorData.message || 'An error occurred';
    
    // Determine error type based on status code
    const status = error.response.status;
    let type = 'unknown';
    let shouldRetry = false;
    let retryDelay = 3000;
    
    switch (status) {
      case 400:
        type = 'validation';
        break;
      case 401:
        type = 'authentication';
        break;
      case 403:
        type = 'permission';
        break;
      case 404:
        type = 'not_found';
        break;
      case 429:
        type = 'rate_limit';
        shouldRetry = true;
        retryDelay = 10000;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = 'server';
        shouldRetry = true;
        retryDelay = status === 500 ? 5000 : 10000;
        break;
      default:
        type = 'unknown';
        shouldRetry = status >= 500;
    }
    
    return { 
      type, 
      message, 
      status,
      shouldRetry,
      retryDelay,
      details: errorData
    };
  }
  
  // Handle network errors
  if (error.request) {
    return { 
      type: 'network', 
      message: 'Network error. Please check your connection and try again.',
      status: null,
      shouldRetry: true,
      retryDelay: 5000
    };
  }
  
  // Handle other errors
  return { 
    type: 'unknown', 
    message: error.message || 'An unexpected error occurred',
    status: null,
    shouldRetry: false
  };
};

/**
 * Graceful degradation utility wrapper
 * Wraps API calls to provide fallback data when requests fail
 * @param {Function} apiCall - The API function to wrap
 * @param {*} fallbackData - Data to return if API call fails
 * @param {string} fallbackMessage - Message to display with fallback data
 * @returns {Function} Wrapped API function with graceful degradation
 */
export const withGracefulDegradation = (apiCall, fallbackData = null, fallbackMessage = null) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      const errorInfo = handleDjangoError(error);
      
      // Log the error for monitoring
      console.warn('API call failed, using graceful degradation:', {
        error: errorInfo,
        fallbackUsed: fallbackData !== null
      });
      
      // Dispatch event for error boundaries to catch
      window.dispatchEvent(new CustomEvent('api-error', { 
        detail: { error: errorInfo, apiCall: apiCall.name } 
      }));
      
      // Return fallback data if available
      if (fallbackData !== null) {
        return {
          data: fallbackData,
          isFromCache: true,
          error: errorInfo,
          message: fallbackMessage || 'Showing cached data due to connection issues'
        };
      }
      
      // Re-throw if no fallback available
      throw error;
    }
  };
};

// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has a valid access token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

/**
 * Get current user's authentication token
 * @returns {string|null} The access token or null if not authenticated
 */
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

/**
 * Create axios instance with Django-specific configuration
 * Includes base URL, headers, and timeout settings
 */
const djangoApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// ============================================================================
// REQUEST/RESPONSE INTERCEPTORS
// ============================================================================

// Request interceptor to add authentication token
djangoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for authentication and error handling
djangoApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Process error through our error handler
    const errorInfo = handleAPIError(error);
    
    // Log error for monitoring
    logError(errorInfo, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      timestamp: new Date().toISOString()
    });

    // Handle 401 errors (unauthorized) - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access_token, access } = response.data;
          const newAccessToken = access_token || access;
          localStorage.setItem('access_token', newAccessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return djangoApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Dispatch event for other components to handle logout
        window.dispatchEvent(new CustomEvent('auth-token-expired'));
        
        // Only redirect if we're not already on login/register pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Dispatch network events for offline detection
    if (errorInfo.type === 'network' || errorInfo.type === 'connection' || errorInfo.type === 'timeout') {
      window.dispatchEvent(new CustomEvent('django-connection-lost'));
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API FACTORY FUNCTIONS
// ============================================================================

/**
 * Create API methods with retry logic for critical operations
 * @param {Function} apiFunction - The API function to add retry logic to
 * @param {Object} retryOptions - Configuration options for retry behavior
 * @returns {Function} API function with retry capabilities
 */
const createRetryableAPI = (apiFunction, retryOptions = {}) => {
  return (...args) => retryRequest(() => apiFunction(...args), retryOptions);
};

// ============================================================================
// API METHOD GROUPS
// ============================================================================

/**
 * Authentication API methods
 * Handles user registration, login, logout, and token management
 */
export const authAPI = {
  register: (userData) => djangoApi.post('/api/auth/register/', userData),
  login: (credentials) => djangoApi.post('/api/auth/login/', credentials),
  logout: () => djangoApi.post('/api/auth/logout/'),
  getCurrentUser: createRetryableAPI(() => djangoApi.get('/api/auth/me/'), { maxRetries: 2 }),
  refreshToken: (refreshToken) => djangoApi.post('/api/auth/refresh/', { refresh: refreshToken }),
};

/**
 * Portfolio API methods with retry logic, deduplication, and graceful degradation
 * Handles projects, thoughts, and work experience data with fallback support
 */
export const portfolioAPI = {
  getProjects: createDeduplicatedAPI(
    withGracefulDegradation(
      createRetryableAPI((params = {}) => djangoApi.get('/api/portfolio/projects/', { params }), { maxRetries: 2 }),
      [], // Fallback to empty array
      'Unable to load projects. Please check your connection.'
    ),
    (params = {}) => `projects_${JSON.stringify(params)}`
  ),
  getProject: createDeduplicatedAPI(
    createRetryableAPI((id) => djangoApi.get(`/api/portfolio/projects/${id}/`), { maxRetries: 2 }),
    (id) => `project_${id}`
  ),
  getThoughts: createDeduplicatedAPI(
    withGracefulDegradation(
      createRetryableAPI((params = {}) => djangoApi.get('/api/portfolio/thoughts/', { params }), { maxRetries: 2 }),
      [], // Fallback to empty array
      'Unable to load thoughts. Please check your connection.'
    ),
    (params = {}) => `thoughts_${JSON.stringify(params)}`
  ),
  getThought: createDeduplicatedAPI(
    createRetryableAPI((id) => djangoApi.get(`/api/portfolio/thoughts/${id}/`), { maxRetries: 2 }),
    (id) => `thought_${id}`
  ),
  getWorkExperience: createDeduplicatedAPI(
    withGracefulDegradation(
      createRetryableAPI(() => djangoApi.get('/api/portfolio/work/'), { maxRetries: 2 }),
      [], // Fallback to empty array
      'Unable to load work experience. Please check your connection.'
    ),
    () => 'work_experience'
  ),
};

/**
 * Learn platform API methods with deduplication for read operations
 * Handles courses, lessons, assignments, and submissions for the learning platform
 */
export const learnAPI = {
  // Course management
  getCourses: createDeduplicatedAPI(
    () => djangoApi.get('/api/learn/courses/'),
    () => 'courses'
  ),
  getCourse: createDeduplicatedAPI(
    (id) => djangoApi.get(`/api/learn/courses/${id}/`),
    (id) => `course_${id}`
  ),
  enrollInCourse: (id) => djangoApi.post(`/api/learn/courses/${id}/enroll/`),
  
  // Enrollment management
  getEnrollments: createDeduplicatedAPI(
    () => djangoApi.get('/api/learn/enrollments/'),
    () => 'enrollments'
  ),
  // Lesson management
  getLesson: createDeduplicatedAPI(
    (id) => djangoApi.get(`/api/learn/lessons/${id}/`),
    (id) => `lesson_${id}`
  ),
  getLessons: createDeduplicatedAPI(
    (courseId) => djangoApi.get('/api/learn/lessons/', { params: { course_id: courseId } }),
    (courseId) => `lessons_course_${courseId}`
  ),
  completeLesson: (id) => djangoApi.post(`/api/learn/lessons/${id}/complete/`),
  // Assignment management
  getAssignment: createDeduplicatedAPI(
    (id) => djangoApi.get(`/api/learn/assignments/${id}/`),
    (id) => `assignment_${id}`
  ),
  getAssignments: createDeduplicatedAPI(
    (lessonId) => djangoApi.get('/api/learn/assignments/', { params: { lesson_id: lessonId } }),
    (lessonId) => `assignments_lesson_${lessonId}`
  ),
  // Submission management
  submitAssignment: (id, data) => djangoApi.post(`/api/learn/submissions/`, { ...data, assignment: id }),
  updateSubmission: (submissionId, data) => djangoApi.patch(`/api/learn/submissions/${submissionId}/`, data),
  getSubmissions: createDeduplicatedAPI(
    (assignmentId) => {
      if (assignmentId) {
        return djangoApi.get('/api/learn/submissions/', { params: { assignment_id: assignmentId } });
      } else {
        // Get all user's submissions
        return djangoApi.get('/api/learn/submissions/');
      }
    },
    (assignmentId) => assignmentId ? `submissions_assignment_${assignmentId}` : 'submissions_all'
  ),
  getSubmission: createDeduplicatedAPI(
    (assignmentId, studentId) => djangoApi.get(`/api/learn/submissions/`, { params: { assignment_id: assignmentId, student_id: studentId } }),
    (assignmentId, studentId) => `submission_${assignmentId}_${studentId}`
  ),
  
  // Comment management
  addComment: (submissionId, comment) => djangoApi.post(`/api/learn/submissions/${submissionId}/comments/`, comment),
  getComments: createDeduplicatedAPI(
    (submissionId) => djangoApi.get(`/api/learn/submissions/${submissionId}/comments/`),
    (submissionId) => `comments_${submissionId}`
  ),
  
  // Learning program inquiry
  submitInquiry: (inquiryData) => djangoApi.post('/api/learn/inquiry/', inquiryData),
};

/**
 * Shop API methods
 * Handles e-commerce functionality including products, cart, orders, and payments
 */
export const shopAPI = {
  // Product management
  getProducts: (params = {}) => djangoApi.get('/api/shop/products/', { params }),
  getProduct: (id) => djangoApi.get(`/api/shop/products/${id}/`),
  
  // Cart operations - Django CartView handles cart operations at /api/shop/cart/
  getCart: () => djangoApi.get('/api/shop/cart/'),
  addToCart: (productId, quantity = 1) => djangoApi.post('/api/shop/cart/', { product_id: productId, quantity }),
  updateCartItem: (itemId, quantity) => {
    return djangoApi.patch('/api/shop/cart/', { item_id: itemId, quantity });
  },
  removeFromCart: (itemId) => {
    return djangoApi.delete('/api/shop/cart/', { data: { item_id: itemId } });
  },
  
  // Order operations
  createOrder: (orderData) => djangoApi.post('/api/shop/orders/', orderData),
  getOrders: () => djangoApi.get('/api/shop/orders/'),
  getOrder: (id) => djangoApi.get(`/api/shop/orders/${id}/`),
  
  // Payment operations
  initializePayment: (paymentData) => djangoApi.post('/api/shop/payment/initialize/', paymentData),
  verifyPayment: (paymentData) => djangoApi.post('/api/shop/payment/verify/', paymentData),
};

// ============================================================================
// HEALTH CHECK AND CONNECTION TESTING
// ============================================================================

/**
 * Health check endpoint for connection testing
 * Used to verify Django API connectivity and server status
 */
export const healthAPI = {
  check: () => djangoApi.get('/api/health/'),
};

/**
 * Utility function to test Django API connectivity
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
export const testDjangoConnection = async () => {
  try {
    await healthAPI.check();
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Export the configured axios instance for direct use if needed
 * This provides access to the underlying axios instance with all interceptors
 */
export default djangoApi;