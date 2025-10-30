/**
 * Functional tests for djangoApi.js
 * Tests that API methods work correctly and graceful degradation functions as expected
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Django API Functional Tests', () => {
  let mockAxiosInstance;
  let portfolioAPI, authAPI, healthAPI, testDjangoConnection;

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

    // Mock window for event dispatching
    global.window = { dispatchEvent: vi.fn() };

    // Import the module after mocking
    const module = await import('../djangoApi.js');
    portfolioAPI = module.portfolioAPI;
    authAPI = module.authAPI;
    healthAPI = module.healthAPI;
    testDjangoConnection = module.testDjangoConnection;
  });

  describe('API Method Functionality', () => {
    it('should successfully call portfolio API methods', async () => {
      const mockProjects = [{ id: 1, title: 'Test Project' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });

      const result = await portfolioAPI.getProjects();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/projects/', { params: {} });
      expect(result.data).toEqual(mockProjects);
    });

    it('should successfully call authentication API methods', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const result = await authAPI.getCurrentUser();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me/');
      expect(result.data).toEqual(mockUser);
    });

    it('should successfully call health check', async () => {
      const mockHealth = { status: 'ok' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockHealth });

      const result = await healthAPI.check();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
      expect(result.data).toEqual(mockHealth);
    });
  });

  describe('Graceful Degradation Functionality', () => {
    it('should return fallback data when portfolio API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await portfolioAPI.getProjects();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load projects. Please check your connection.');
      expect(result.error).toBeDefined();
    });

    it('should return fallback data when thoughts API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Server error'));

      const result = await portfolioAPI.getThoughts();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load thoughts. Please check your connection.');
    });

    it('should return fallback data when work experience API fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await portfolioAPI.getWorkExperience();
      
      expect(result.data).toEqual([]);
      expect(result.isFromCache).toBe(true);
      expect(result.message).toBe('Unable to load work experience. Please check your connection.');
    });

    it('should dispatch error events when using fallback data', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      await portfolioAPI.getProjects();
      
      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api-error'
        })
      );
    });
  });

  describe('Connection Testing', () => {
    it('should return true when connection test succeeds', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });

      const result = await testDjangoConnection();
      
      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
    });

    it('should return false when connection test fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await testDjangoConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle different types of errors correctly', async () => {
      // Test server error
      const serverError = new Error('Server Error');
      serverError.response = { status: 500, data: { detail: 'Internal server error' } };
      
      mockAxiosInstance.get.mockRejectedValue(serverError);

      const result = await portfolioAPI.getProjects();
      
      expect(result.isFromCache).toBe(true);
      expect(result.error.type).toBe('server');
      expect(result.error.shouldRetry).toBe(true);
    });

    it('should handle network errors correctly', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {};
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      const result = await portfolioAPI.getWorkExperience();
      
      expect(result.isFromCache).toBe(true);
      expect(result.error.type).toBe('network');
      expect(result.error.shouldRetry).toBe(true);
    });
  });
});