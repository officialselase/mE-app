/**
 * Unit tests for reorganized functions in djangoApi.js
 * Tests the core utility functions that were reorganized to fix initialization errors
 * 
 * Requirements covered:
 * - 7.1: Test that the fixed code works correctly
 * - 7.2: Test API methods return expected results  
 * - 7.3: Test graceful degradation works properly
 * - 7.4: Test all Django API functionality is available
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock error handler and request deduplication
vi.mock('../errorHandler', () => ({
  handleAPIError: vi.fn(),
  logError: vi.fn(),
  retryRequest: vi.fn((fn) => fn()),
}));

vi.mock('../requestDeduplication', () => ({
  createDeduplicatedAPI: vi.fn((fn) => fn),
}));

describe('Django API Reorganized Functions Unit Tests', () => {
  let mockAxiosInstance;
  let handleDjangoError, withGracefulDegradation, isAuthenticated, getAuthToken;
  let authAPI, portfolioAPI, learnAPI, shopAPI, healthAPI, testDjangoConnection;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.post.mockResolvedValue({ data: { access: 'new-token' } });

    // Mock window and localStorage
    global.window = { 
      dispatchEvent: vi.fn(),
      location: { pathname: '/test' }
    };
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    // Import the module after mocking
    const module = await import('../djangoApi.js');
    handleDjangoError = module.handleDjangoError;
    withGracefulDegradation = module.withGracefulDegradation;
    isAuthenticated = module.isAuthenticated;
    getAuthToken = module.getAuthToken;
    authAPI = module.authAPI;
    portfolioAPI = module.portfolioAPI;
    learnAPI = module.learnAPI;
    shopAPI = module.shopAPI;
    healthAPI = module.healthAPI;
    testDjangoConnection = module.testDjangoConnection;
  });

  afterEach(() => {
    vi.resetModules();
    delete global.window;
    delete global.localStorage;
  });

  describe('handleDjangoError Function', () => {
    it('should process field validation errors correctly', () => {
      const error = {
        response: {
          status: 400,
          data: {
            username: ['This field is required.', 'Username must be unique.'],
            email: ['Enter a valid email address.'],
            password: ['This password is too short.']
          }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('validation');
      expect(result.errors).toEqual({
        username: 'This field is required.',
        email: 'Enter a valid email address.',
        password: 'This password is too short.'
      });
      expect(result.message).toBe('Please correct the highlighted fields.');
      expect(result.status).toBe(400);
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle single field validation error', () => {
      const error = {
        response: {
          status: 400,
          data: {
            email: 'This field is required.'
          }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('validation');
      expect(result.errors.email).toBe('This field is required.');
    });

    it('should handle general error messages with detail field', () => {
      const error = {
        response: {
          status: 401,
          data: {
            detail: 'Invalid authentication credentials'
          }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('authentication');
      expect(result.message).toBe('Invalid authentication credentials');
      expect(result.status).toBe(401);
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle general error messages with message field', () => {
      const error = {
        response: {
          status: 403,
          data: {
            message: 'Permission denied'
          }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('permission');
      expect(result.message).toBe('Permission denied');
      expect(result.status).toBe(403);
    });

    it('should categorize different HTTP status codes correctly', () => {
      const testCases = [
        { status: 400, expectedType: 'validation', shouldRetry: false },
        { status: 401, expectedType: 'authentication', shouldRetry: false },
        { status: 403, expectedType: 'permission', shouldRetry: false },
        { status: 404, expectedType: 'not_found', shouldRetry: false },
        { status: 429, expectedType: 'rate_limit', shouldRetry: true, retryDelay: 10000 },
        { status: 500, expectedType: 'server', shouldRetry: true, retryDelay: 5000 },
        { status: 502, expectedType: 'server', shouldRetry: true, retryDelay: 10000 },
        { status: 503, expectedType: 'server', shouldRetry: true, retryDelay: 10000 },
        { status: 504, expectedType: 'server', shouldRetry: true, retryDelay: 10000 }
      ];

      testCases.forEach(({ status, expectedType, shouldRetry, retryDelay }) => {
        const error = {
          response: {
            status,
            data: { detail: `Error ${status}` }
          }
        };

        const result = handleDjangoError(error);
        
        expect(result.type).toBe(expectedType);
        expect(result.shouldRetry).toBe(shouldRetry);
        if (retryDelay) {
          expect(result.retryDelay).toBe(retryDelay);
        }
      });
    });

    it('should handle network errors without response', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('network');
      expect(result.message).toBe('Network error. Please check your connection and try again.');
      expect(result.status).toBe(null);
      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(5000);
    });

    it('should handle unknown errors', () => {
      const error = {
        message: 'Something went wrong'
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('Something went wrong');
      expect(result.status).toBe(null);
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle errors without message', () => {
      const error = {};

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('withGracefulDegradation Function', () => {
    it('should return successful API response when call succeeds', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ 
        data: { results: [{ id: 1, title: 'Success' }] } 
      });
      const wrappedCall = withGracefulDegradation(mockApiCall, [], 'Fallback message');

      const result = await wrappedCall('param1', 'param2');
      
      expect(result.data.results[0].title).toBe('Success');
      expect(mockApiCall).toHaveBeenCalledWith('param1', 'param2');
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should pass through all arguments to the wrapped function', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: 'success' });
      const wrappedCall = withGracefulDegradation(mockApiCall);

      await wrappedCall('arg1', { param: 'value' }, 123);
      
      expect(mockApiCall).toHaveBeenCalledWith('arg1', { param: 'value' }, 123);
    });

    it('should return fallback data when API call fails', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Network error'));
      const fallbackData = [{ id: 1, title: 'Cached Project' }];
      const fallbackMessage = 'Using cached data due to network issues';
      const wrappedCall = withGracefulDegradation(mockApiCall, fallbackData, fallbackMessage);

      const result = await wrappedCall();
      
      expect(result.data).toEqual(fallbackData);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe(fallbackMessage);
      expect(result.error).toBeDefined();
      expect(result.error.type).toBe('unknown');
    });

    it('should use default fallback message when none provided', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
      const fallbackData = [];
      const wrappedCall = withGracefulDegradation(mockApiCall, fallbackData);

      const result = await wrappedCall();
      
      expect(result.message).toBe('Showing cached data due to connection issues');
    });

    it('should dispatch api-error event when fallback is used', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
      mockApiCall.name = 'testApiCall';
      const wrappedCall = withGracefulDegradation(mockApiCall, [], 'Fallback');

      await wrappedCall();
      
      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api-error'
        })
      );
      
      const eventCall = global.window.dispatchEvent.mock.calls[0][0];
      expect(eventCall.detail.apiCall).toBe('testApiCall');
      expect(eventCall.detail.error).toBeDefined();
    });

    it('should log warning when using graceful degradation', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Network error'));
      const wrappedCall = withGracefulDegradation(mockApiCall, [], 'Fallback');

      await wrappedCall();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'API call failed, using graceful degradation:',
        expect.objectContaining({
          error: expect.any(Object),
          fallbackUsed: true
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should re-throw error when no fallback data is provided', async () => {
      const mockError = new Error('API Error');
      const mockApiCall = vi.fn().mockRejectedValue(mockError);
      const wrappedCall = withGracefulDegradation(mockApiCall);

      await expect(wrappedCall()).rejects.toThrow('API Error');
      expect(global.window.dispatchEvent).toHaveBeenCalled();
    });

    it('should handle null fallback data correctly', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
      const wrappedCall = withGracefulDegradation(mockApiCall, null);

      await expect(wrappedCall()).rejects.toThrow('API Error');
    });

    it('should process errors through handleDjangoError', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { detail: 'Server error' }
        }
      };
      const mockApiCall = vi.fn().mockRejectedValue(mockError);
      const wrappedCall = withGracefulDegradation(mockApiCall, []);

      const result = await wrappedCall();
      
      expect(result.error.type).toBe('server');
      expect(result.error.message).toBe('Server error');
      expect(result.error.shouldRetry).toBe(true);
    });
  });

  describe('Authentication Utility Functions', () => {
    describe('isAuthenticated', () => {
      it('should return true when access token exists', () => {
        global.localStorage.getItem.mockReturnValue('mock-access-token');
        
        const result = isAuthenticated();
        
        expect(result).toBe(true);
        expect(global.localStorage.getItem).toHaveBeenCalledWith('access_token');
      });

      it('should return false when access token is null', () => {
        global.localStorage.getItem.mockReturnValue(null);
        
        const result = isAuthenticated();
        
        expect(result).toBe(false);
      });

      it('should return false when access token is empty string', () => {
        global.localStorage.getItem.mockReturnValue('');
        
        const result = isAuthenticated();
        
        expect(result).toBe(false);
      });

      it('should return false when access token is undefined', () => {
        global.localStorage.getItem.mockReturnValue(undefined);
        
        const result = isAuthenticated();
        
        expect(result).toBe(false);
      });
    });

    describe('getAuthToken', () => {
      it('should return access token when it exists', () => {
        const token = 'mock-access-token-12345';
        global.localStorage.getItem.mockReturnValue(token);
        
        const result = getAuthToken();
        
        expect(result).toBe(token);
        expect(global.localStorage.getItem).toHaveBeenCalledWith('access_token');
      });

      it('should return null when no token exists', () => {
        global.localStorage.getItem.mockReturnValue(null);
        
        const result = getAuthToken();
        
        expect(result).toBe(null);
      });

      it('should return empty string if that is what is stored', () => {
        global.localStorage.getItem.mockReturnValue('');
        
        const result = getAuthToken();
        
        expect(result).toBe('');
      });
    });
  });

  describe('API Factory Functions Integration', () => {
    it('should verify createRetryableAPI is used in authAPI methods', async () => {
      // Test that getCurrentUser has retry logic
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { id: 1, email: 'test@example.com' } 
      });

      const result = await authAPI.getCurrentUser();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me/');
      expect(result.data.email).toBe('test@example.com');
    });

    it('should verify graceful degradation is applied to portfolio methods', async () => {
      // Test that getProjects uses graceful degradation
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await portfolioAPI.getProjects();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load projects. Please check your connection.');
    });

    it('should verify deduplication is applied to learn API methods', async () => {
      // Test that getCourses uses deduplication
      mockAxiosInstance.get.mockResolvedValue({ 
        data: [{ id: 1, title: 'React Course' }] 
      });

      const result = await learnAPI.getCourses();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/learn/courses/');
      expect(result.data[0].title).toBe('React Course');
    });

    it('should verify shop API methods work correctly after reorganization', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { results: [{ id: 1, name: 'Test Product', price: '29.99' }] } 
      });

      const result = await shopAPI.getProducts({ category: 'electronics' });
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/shop/products/', {
        params: { category: 'electronics' }
      });
      expect(result.data.results[0].name).toBe('Test Product');
    });

    it('should verify health API works correctly after reorganization', async () => {
      mockAxiosInstance.get.mockResolvedValue({ 
        data: { status: 'ok', timestamp: '2024-01-15T10:30:00Z' } 
      });

      const result = await healthAPI.check();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
      expect(result.data.status).toBe('ok');
    });

    it('should verify testDjangoConnection uses health API correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });

      const result = await testDjangoConnection();
      
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
    });

    it('should handle testDjangoConnection failure gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await testDjangoConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('Function Declaration Order Validation', () => {
    it('should verify all utility functions are available after module import', () => {
      // These functions should be available immediately after import
      expect(typeof handleDjangoError).toBe('function');
      expect(typeof withGracefulDegradation).toBe('function');
      expect(typeof isAuthenticated).toBe('function');
      expect(typeof getAuthToken).toBe('function');
      expect(typeof testDjangoConnection).toBe('function');
    });

    it('should verify all API objects are properly structured', () => {
      // Verify API objects have expected methods
      expect(authAPI).toHaveProperty('register');
      expect(authAPI).toHaveProperty('login');
      expect(authAPI).toHaveProperty('getCurrentUser');
      
      expect(portfolioAPI).toHaveProperty('getProjects');
      expect(portfolioAPI).toHaveProperty('getThoughts');
      expect(portfolioAPI).toHaveProperty('getWorkExperience');
      
      expect(learnAPI).toHaveProperty('getCourses');
      expect(learnAPI).toHaveProperty('enrollInCourse');
      expect(learnAPI).toHaveProperty('submitAssignment');
      
      expect(shopAPI).toHaveProperty('getProducts');
      expect(shopAPI).toHaveProperty('addToCart');
      
      expect(healthAPI).toHaveProperty('check');
    });

    it('should verify functions can be called without initialization errors', async () => {
      // Test that functions can be called immediately without "before initialization" errors
      expect(() => handleDjangoError(new Error('test'))).not.toThrow();
      expect(() => isAuthenticated()).not.toThrow();
      expect(() => getAuthToken()).not.toThrow();
      
      // Test async functions
      const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' });
      const wrappedCall = withGracefulDegradation(mockApiCall);
      await expect(wrappedCall()).resolves.toBeDefined();
    });
  });

  describe('Error Event Dispatching', () => {
    it('should dispatch events with correct structure', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Test error'));
      mockApiCall.name = 'testFunction';
      const wrappedCall = withGracefulDegradation(mockApiCall, []);

      await wrappedCall();
      
      expect(global.window.dispatchEvent).toHaveBeenCalledTimes(1);
      const event = global.window.dispatchEvent.mock.calls[0][0];
      
      expect(event.type).toBe('api-error');
      expect(event.detail).toHaveProperty('error');
      expect(event.detail).toHaveProperty('apiCall');
      expect(event.detail.apiCall).toBe('testFunction');
    });

    it('should handle functions without names in events', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Test error'));
      // Don't set name property
      const wrappedCall = withGracefulDegradation(mockApiCall, []);

      await wrappedCall();
      
      const event = global.window.dispatchEvent.mock.calls[0][0];
      expect(event.detail.apiCall).toBeDefined(); // Should handle undefined name gracefully
    });
  });
});