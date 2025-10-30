/**
 * Django-specific error handling utilities
 * Handles Django REST framework error formats and provides consistent error responses
 */

/**
 * Handle Django API errors with specific error type classification
 * @param {Error} error - The error object from axios or fetch
 * @returns {Object} Formatted error object with type, message, and details
 */
export const handleAPIError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return handleValidationError(data);
      case 401:
        return {
          type: 'auth',
          message: 'Authentication required. Please log in to continue.',
          status: 401,
          details: data,
          shouldRedirect: true,
          redirectTo: '/login'
        };
      case 403:
        return {
          type: 'permission',
          message: 'You do not have permission to perform this action.',
          status: 403,
          details: data,
          shouldRetry: false
        };
      case 404:
        return {
          type: 'notfound',
          message: 'The requested resource was not found.',
          status: 404,
          details: data,
          shouldRetry: false
        };
      case 500:
        return {
          type: 'server',
          message: 'Server error occurred. Please try again later.',
          status: 500,
          details: data,
          shouldRetry: true,
          retryDelay: 5000
        };
      case 502:
      case 503:
      case 504:
        return {
          type: 'server',
          message: 'Service temporarily unavailable. Please try again in a moment.',
          status,
          details: data,
          shouldRetry: true,
          retryDelay: 10000
        };
      default:
        return {
          type: 'unknown',
          message: `An unexpected error occurred (${status}).`,
          status,
          details: data,
          shouldRetry: status >= 500
        };
    }
  }
  
  if (error.request) {
    return handleNetworkError(error);
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.',
    shouldRetry: false,
    details: error
  };
};

/**
 * Handle Django validation errors (400 status)
 * @param {Object} data - Django validation error response
 * @returns {Object} Formatted validation error
 */
const handleValidationError = (data) => {
  const fieldErrors = {};
  let generalMessage = 'Please check your input and try again.';
  
  if (typeof data === 'object' && data !== null) {
    // Handle field-specific errors
    Object.keys(data).forEach(field => {
      if (field === 'non_field_errors') {
        generalMessage = Array.isArray(data[field]) ? data[field][0] : data[field];
      } else {
        fieldErrors[field] = Array.isArray(data[field]) ? data[field][0] : data[field];
      }
    });
    
    // If we have field errors, use a more specific message
    if (Object.keys(fieldErrors).length > 0) {
      generalMessage = 'Please correct the highlighted fields.';
    }
  } else if (typeof data === 'string') {
    generalMessage = data;
  }
  
  return {
    type: 'validation',
    message: generalMessage,
    status: 400,
    fieldErrors,
    details: data,
    shouldRetry: false
  };
};

/**
 * Handle network errors (no response received)
 * @param {Error} error - Network error object
 * @returns {Object} Formatted network error
 */
const handleNetworkError = (error) => {
  // Check if it's a timeout
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return {
      type: 'timeout',
      message: 'Request timed out. Please check your connection and try again.',
      shouldRetry: true,
      retryDelay: 3000,
      details: error
    };
  }
  
  // Check if it's a connection error
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      type: 'connection',
      message: 'Unable to connect to the server. Please check your internet connection.',
      shouldRetry: true,
      retryDelay: 5000,
      details: error
    };
  }
  
  return {
    type: 'network',
    message: 'Network error occurred. Please check your connection and try again.',
    shouldRetry: true,
    retryDelay: 3000,
    details: error
  };
};

/**
 * Retry logic for failed requests
 * @param {Function} requestFunction - The function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves with the request result
 */
export const retryRequest = async (requestFunction, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      const errorInfo = handleAPIError(error);
      return errorInfo.shouldRetry;
    }
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError;
};

/**
 * Create a retry wrapper for API functions
 * @param {Function} apiFunction - The API function to wrap
 * @param {Object} retryOptions - Retry configuration
 * @returns {Function} Wrapped function with retry logic
 */
export const withRetry = (apiFunction, retryOptions = {}) => {
  return async (...args) => {
    return retryRequest(() => apiFunction(...args), retryOptions);
  };
};

/**
 * Format error message for display to users
 * @param {Object} errorInfo - Error info from handleAPIError
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (errorInfo) => {
  if (!errorInfo) {return 'An unexpected error occurred.';}
  
  switch (errorInfo.type) {
    case 'validation':
      if (errorInfo.fieldErrors && Object.keys(errorInfo.fieldErrors).length > 0) {
        return errorInfo.message;
      }
      return errorInfo.message || 'Please check your input and try again.';
    
    case 'auth':
      return 'Please log in to continue.';
    
    case 'permission':
      return 'You do not have permission to perform this action.';
    
    case 'notfound':
      return 'The requested item was not found.';
    
    case 'server':
      return 'Server error occurred. Please try again later.';
    
    case 'network':
    case 'connection':
    case 'timeout':
      return 'Connection error. Please check your internet connection and try again.';
    
    default:
      return errorInfo.message || 'An unexpected error occurred.';
  }
};

/**
 * Check if an error should trigger a logout
 * @param {Object} errorInfo - Error info from handleAPIError
 * @returns {boolean} Whether to logout the user
 */
export const shouldLogout = (errorInfo) => {
  return errorInfo?.type === 'auth' && errorInfo?.status === 401;
};

/**
 * Check if an error should trigger a redirect
 * @param {Object} errorInfo - Error info from handleAPIError
 * @returns {Object|null} Redirect info or null
 */
export const getRedirectInfo = (errorInfo) => {
  if (errorInfo?.shouldRedirect) {
    return {
      to: errorInfo.redirectTo,
      replace: true,
      state: { from: window.location.pathname }
    };
  }
  return null;
};

/**
 * Log error for debugging and monitoring
 * @param {Object} errorInfo - Error info from handleAPIError
 * @param {Object} context - Additional context about where the error occurred
 */
export const logError = (errorInfo, context = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: errorInfo,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('API Error:', logData);
  }
  
  // In production, you might want to send to a logging service
  // Example: Sentry, LogRocket, etc.
  if (window.Sentry) {
    window.Sentry.captureException(new Error(errorInfo.message), {
      tags: {
        errorType: errorInfo.type,
        statusCode: errorInfo.status
      },
      extra: logData
    });
  }
};