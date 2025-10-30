/**
 * Integration tests for djangoApi.js
 * Tests that all API methods work correctly after the code reorganization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing djangoApi
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Django API Integration Tests', () => {
  let authAPI, portfolioAPI, learnAPI, shopAPI, healthAPI;
  let mockAxiosInstance;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock localStorage - use Object.defineProperty to avoid read-only issues
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    // Mock window
    global.window = { 
      dispatchEvent: vi.fn(),
      location: { pathname: '/test', href: '' }
    };
    
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

    // Import the module after mocking
    const module = await import('../djangoApi.js');
    authAPI = module.authAPI;
    portfolioAPI = module.portfolioAPI;
    learnAPI = module.learnAPI;
    shopAPI = module.shopAPI;
    healthAPI = module.healthAPI;
  });

  afterEach(() => {
    vi.resetModules();
    // Don't delete localStorage and window as they're defined in setup.js
  });

  describe('Authentication API', () => {
    it('should handle user registration', async () => {
      const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      const expectedResponse = { data: { id: 1, username: 'testuser' } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await authAPI.register(userData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register/', userData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle user login', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const expectedResponse = { data: { access: 'token123', refresh: 'refresh123' } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await authAPI.login(credentials);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login/', credentials);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle getting current user with retry logic', async () => {
      const expectedResponse = { data: { id: 1, username: 'testuser' } };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await authAPI.getCurrentUser();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me/');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Portfolio API', () => {
    it('should get projects with graceful degradation', async () => {
      const expectedResponse = { data: [{ id: 1, title: 'Test Project' }] };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await portfolioAPI.getProjects();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/projects/', { params: {} });
      expect(result).toEqual(expectedResponse);
    });

    it('should get specific project', async () => {
      const projectId = 1;
      const expectedResponse = { data: { id: 1, title: 'Test Project' } };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await portfolioAPI.getProject(projectId);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/projects/1/');
      expect(result).toEqual(expectedResponse);
    });

    it('should get thoughts with graceful degradation', async () => {
      const expectedResponse = { data: [{ id: 1, title: 'Test Thought' }] };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await portfolioAPI.getThoughts();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/thoughts/', { params: {} });
      expect(result).toEqual(expectedResponse);
    });

    it('should get work experience with graceful degradation', async () => {
      const expectedResponse = { data: [{ id: 1, company: 'Test Company' }] };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await portfolioAPI.getWorkExperience();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/work/');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Learn API', () => {
    it('should get courses', async () => {
      const expectedResponse = { data: [{ id: 1, title: 'Test Course' }] };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await learnAPI.getCourses();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/learn/courses/');
      expect(result).toEqual(expectedResponse);
    });

    it('should enroll in course', async () => {
      const courseId = 1;
      const expectedResponse = { data: { success: true } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await learnAPI.enrollInCourse(courseId);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/learn/courses/1/enroll/');
      expect(result).toEqual(expectedResponse);
    });

    it('should submit assignment', async () => {
      const assignmentId = 1;
      const submissionData = { content: 'My submission' };
      const expectedResponse = { data: { id: 1, assignment: 1 } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await learnAPI.submitAssignment(assignmentId, submissionData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/learn/submissions/', {
        ...submissionData,
        assignment: assignmentId
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Shop API', () => {
    it('should get products', async () => {
      const expectedResponse = { data: [{ id: 1, name: 'Test Product' }] };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await shopAPI.getProducts();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/shop/products/', { params: {} });
      expect(result).toEqual(expectedResponse);
    });

    it('should add item to cart', async () => {
      const productId = 1;
      const quantity = 2;
      const expectedResponse = { data: { success: true } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await shopAPI.addToCart(productId, quantity);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/shop/cart/', {
        product_id: productId,
        quantity: quantity
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should create order', async () => {
      const orderData = { items: [{ product: 1, quantity: 2 }] };
      const expectedResponse = { data: { id: 1, status: 'pending' } };
      
      mockAxiosInstance.post.mockResolvedValue(expectedResponse);

      const result = await shopAPI.createOrder(orderData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/shop/orders/', orderData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Health API', () => {
    it('should perform health check', async () => {
      const expectedResponse = { data: { status: 'ok' } };
      
      mockAxiosInstance.get.mockResolvedValue(expectedResponse);

      const result = await healthAPI.check();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors through interceptors', async () => {
      const error = new Error('API Error');
      error.response = { status: 500, data: { detail: 'Server error' } };
      
      mockAxiosInstance.get.mockRejectedValue(error);

      // Test that portfolio API with graceful degradation handles the error
      const result = await portfolioAPI.getProjects();
      
      expect(result.isFromCache).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.request = {};
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      const result = await portfolioAPI.getWorkExperience();
      
      expect(result.isFromCache).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});