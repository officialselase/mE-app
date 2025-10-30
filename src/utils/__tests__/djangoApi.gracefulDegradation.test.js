/**
 * Tests for graceful degradation and retry logic in djangoApi.js
 * Validates that error handling and fallback mechanisms work correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Django API Graceful Degradation and Retry Logic', () => {
  let portfolioAPI, withGracefulDegradation, handleDjangoError, testDjangoConnection;
  let mockAxiosInstance;

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

    // Mock window.dispatchEvent
    global.window = { dispatchEvent: vi.fn() };

    // Import the module after mocking
    const module = await import('../djangoApi.js');
    portfolioAPI = module.portfolioAPI;
    withGracefulDegradation = module.withGracefulDegradation;
    handleDjangoError = module.handleDjangoError;
    testDjangoConnection = module.testDjangoConnection;
  });

  afterEach(() => {
    vi.resetModules();
    delete global.window;
  });

  describe('handleDjangoError Function', () => {
    it('should handle validation errors correctly', () => {
      const error = {
        response: {
          status: 400,
          data: {
            username: ['This field is required.'],
            email: ['Enter a valid email address.']
          }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('validation');
      expect(result.errors).toEqual({
        username: 'This field is required.',
        email: 'Enter a valid email address.'
      });
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle authentication errors correctly', () => {
      const error = {
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('authentication');
      expect(result.message).toBe('Invalid credentials');
      expect(result.shouldRetry).toBe(false);
    });

    it('should handle server errors with retry logic', () => {
      const error = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('server');
      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(5000);
    });

    it('should handle network errors correctly', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('network');
      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(5000);
    });

    it('should handle rate limiting errors', () => {
      const error = {
        response: {
          status: 429,
          data: { detail: 'Too many requests' }
        }
      };

      const result = handleDjangoError(error);
      
      expect(result.type).toBe('rate_limit');
      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(10000);
    });
  });

  describe('withGracefulDegradation Function', () => {
    it('should return successful API response when call succeeds', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: 'success' });
      const wrappedCall = withGracefulDegradation(mockApiCall, [], 'Fallback message');

      const result = await wrappedCall();
      
      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalledOnce();
    });

    it('should return fallback data when API call fails', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Network error'));
      const fallbackData = [{ id: 1, title: 'Cached Project' }];
      const wrappedCall = withGracefulDegradation(mockApiCall, fallbackData, 'Using cached data');

      const result = await wrappedCall();
      
      expect(result.data).toEqual(fallbackData);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Using cached data');
      expect(result.error).toBeDefined();
    });

    it('should dispatch error event when fallback is used', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('API Error'));
      const wrappedCall = withGracefulDegradation(mockApiCall, [], 'Fallback');

      await wrappedCall();
      
      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api-error',
          detail: expect.objectContaining({
            error: expect.any(Object),
            apiCall: expect.any(String)
          })
        })
      );
    });

    it('should re-throw error when no fallback data is provided', async () => {
      const mockError = new Error('API Error');
      const mockApiCall = vi.fn().mockRejectedValue(mockError);
      const wrappedCall = withGracefulDegradation(mockApiCall);

      await expect(wrappedCall()).rejects.toThrow('API Error');
    });
  });

  describe('Portfolio API Graceful Degradation', () => {
    it('should use graceful degradation for getProjects', async () => {
      // Mock the axios instance to reject
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await portfolioAPI.getProjects();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load projects. Please check your connection.');
    });

    it('should use graceful degradation for getThoughts', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Server error'));

      const result = await portfolioAPI.getThoughts();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load thoughts. Please check your connection.');
    });

    it('should use graceful degradation for getWorkExperience', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await portfolioAPI.getWorkExperience();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load work experience. Please check your connection.');
    });
  });

  describe('Connection Testing', () => {
    it('should return true when health check succeeds', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });

      const result = await testDjangoConnection();
      
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
    });

    it('should return false when health check fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await testDjangoConnection();
      
      expect(result).toBe(false);
    });
  });
});