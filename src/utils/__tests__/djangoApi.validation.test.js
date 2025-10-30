/**
 * Validation tests for the fixed djangoApi.js module
 * Tests module loading, function availability, and core functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Django API Module Validation', () => {
  let djangoApi, authAPI, portfolioAPI, learnAPI, shopAPI, healthAPI;
  let withGracefulDegradation, handleDjangoError, testDjangoConnection;

  beforeEach(async () => {
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
    mockedAxios.post.mockResolvedValue({ data: { access: 'new-token' } });

    // Import the module after mocking
    const module = await import('../djangoApi.js');
    djangoApi = module.default;
    authAPI = module.authAPI;
    portfolioAPI = module.portfolioAPI;
    learnAPI = module.learnAPI;
    shopAPI = module.shopAPI;
    healthAPI = module.healthAPI;
    withGracefulDegradation = module.withGracefulDegradation;
    handleDjangoError = module.handleDjangoError;
    testDjangoConnection = module.testDjangoConnection;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Module Loading and Initialization', () => {
    it('should load the module without initialization errors', () => {
      expect(() => {
        // The module should have loaded successfully if we reach this point
        expect(djangoApi).toBeDefined();
      }).not.toThrow();
    });

    it('should have all utility functions available', () => {
      expect(withGracefulDegradation).toBeDefined();
      expect(typeof withGracefulDegradation).toBe('function');
      expect(handleDjangoError).toBeDefined();
      expect(typeof handleDjangoError).toBe('function');
    });

    it('should have all API groups defined', () => {
      expect(authAPI).toBeDefined();
      expect(portfolioAPI).toBeDefined();
      expect(learnAPI).toBeDefined();
      expect(shopAPI).toBeDefined();
      expect(healthAPI).toBeDefined();
    });

    it('should have testDjangoConnection function available', () => {
      expect(testDjangoConnection).toBeDefined();
      expect(typeof testDjangoConnection).toBe('function');
    });
  });

  describe('Function Declaration Order Validation', () => {
    it('should allow withGracefulDegradation to be used in API definitions', () => {
      // This test verifies that withGracefulDegradation is properly declared
      // before it's used in the portfolioAPI definitions
      expect(() => {
        const wrappedFunction = withGracefulDegradation(
          () => Promise.resolve({ data: 'test' }),
          [],
          'Test fallback'
        );
        expect(typeof wrappedFunction).toBe('function');
      }).not.toThrow();
    });

    it('should allow handleDjangoError to be used throughout the module', () => {
      // Test that handleDjangoError is available and functional
      const mockError = {
        response: {
          status: 400,
          data: { detail: 'Test error' }
        }
      };

      expect(() => {
        const errorInfo = handleDjangoError(mockError);
        expect(errorInfo).toBeDefined();
        expect(errorInfo.type).toBe('validation');
        expect(errorInfo.message).toBe('Test error');
      }).not.toThrow();
    });
  });

  describe('API Method Availability', () => {
    it('should have all authentication API methods', () => {
      expect(authAPI.register).toBeDefined();
      expect(authAPI.login).toBeDefined();
      expect(authAPI.logout).toBeDefined();
      expect(authAPI.getCurrentUser).toBeDefined();
      expect(authAPI.refreshToken).toBeDefined();
    });

    it('should have all portfolio API methods', () => {
      expect(portfolioAPI.getProjects).toBeDefined();
      expect(portfolioAPI.getProject).toBeDefined();
      expect(portfolioAPI.getThoughts).toBeDefined();
      expect(portfolioAPI.getThought).toBeDefined();
      expect(portfolioAPI.getWorkExperience).toBeDefined();
    });

    it('should have all learn API methods', () => {
      expect(learnAPI.getCourses).toBeDefined();
      expect(learnAPI.getCourse).toBeDefined();
      expect(learnAPI.enrollInCourse).toBeDefined();
      expect(learnAPI.getLesson).toBeDefined();
      expect(learnAPI.getLessons).toBeDefined();
      expect(learnAPI.completeLesson).toBeDefined();
      expect(learnAPI.getAssignment).toBeDefined();
      expect(learnAPI.getAssignments).toBeDefined();
      expect(learnAPI.submitAssignment).toBeDefined();
      expect(learnAPI.updateSubmission).toBeDefined();
      expect(learnAPI.getSubmissions).toBeDefined();
      expect(learnAPI.getSubmission).toBeDefined();
      expect(learnAPI.addComment).toBeDefined();
      expect(learnAPI.getComments).toBeDefined();
    });

    it('should have all shop API methods', () => {
      expect(shopAPI.getProducts).toBeDefined();
      expect(shopAPI.getProduct).toBeDefined();
      expect(shopAPI.getCart).toBeDefined();
      expect(shopAPI.addToCart).toBeDefined();
      expect(shopAPI.updateCartItem).toBeDefined();
      expect(shopAPI.removeFromCart).toBeDefined();
      expect(shopAPI.createOrder).toBeDefined();
      expect(shopAPI.getOrders).toBeDefined();
      expect(shopAPI.getOrder).toBeDefined();
      expect(shopAPI.initializePayment).toBeDefined();
      expect(shopAPI.verifyPayment).toBeDefined();
    });

    it('should have health API methods', () => {
      expect(healthAPI.check).toBeDefined();
    });
  });
});