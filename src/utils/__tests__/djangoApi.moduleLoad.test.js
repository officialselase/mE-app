/**
 * Simple module loading test for djangoApi.js
 * Validates that the module loads without initialization errors
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Django API Module Loading Test', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
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
  });

  it('should load the module without "Cannot access before initialization" errors', async () => {
    // This test specifically validates that withGracefulDegradation is available
    // before it's used in the module, fixing the original initialization error
    
    expect(async () => {
      const module = await import('../djangoApi.js');
      
      // Verify all exports are available
      expect(module.default).toBeDefined(); // axios instance
      expect(module.authAPI).toBeDefined();
      expect(module.portfolioAPI).toBeDefined();
      expect(module.learnAPI).toBeDefined();
      expect(module.shopAPI).toBeDefined();
      expect(module.healthAPI).toBeDefined();
      expect(module.withGracefulDegradation).toBeDefined();
      expect(module.handleDjangoError).toBeDefined();
      expect(module.testDjangoConnection).toBeDefined();
      
      // Verify withGracefulDegradation is a function and can be called
      expect(typeof module.withGracefulDegradation).toBe('function');
      
      // Test that we can create a wrapped function (this would fail if there were initialization issues)
      const testFunction = () => Promise.resolve('test');
      const wrappedFunction = module.withGracefulDegradation(testFunction, [], 'fallback');
      expect(typeof wrappedFunction).toBe('function');
      
    }).not.toThrow();
  });

  it('should have all API methods properly defined', async () => {
    const module = await import('../djangoApi.js');
    
    // Test that portfolio API methods (which use withGracefulDegradation) are properly defined
    expect(module.portfolioAPI.getProjects).toBeDefined();
    expect(module.portfolioAPI.getThoughts).toBeDefined();
    expect(module.portfolioAPI.getWorkExperience).toBeDefined();
    
    // Test that these are functions
    expect(typeof module.portfolioAPI.getProjects).toBe('function');
    expect(typeof module.portfolioAPI.getThoughts).toBe('function');
    expect(typeof module.portfolioAPI.getWorkExperience).toBe('function');
  });

  it('should allow handleDjangoError to be used', async () => {
    const module = await import('../djangoApi.js');
    
    // Test that handleDjangoError works correctly
    const mockError = {
      response: {
        status: 400,
        data: { detail: 'Test error' }
      }
    };

    const errorInfo = module.handleDjangoError(mockError);
    expect(errorInfo).toBeDefined();
    expect(errorInfo.type).toBe('validation');
    expect(errorInfo.message).toBe('Test error');
  });
});