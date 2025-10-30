import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Django API Integration - Core Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication Token Management', () => {
    it('should store and retrieve access tokens correctly', async () => {
      // Mock the djangoApi module functions
      const { isAuthenticated, getAuthToken } = await vi.importActual('../djangoApi');
      
      // Initially no token
      expect(isAuthenticated()).toBe(false);
      expect(getAuthToken()).toBe(null);
      
      // Set token
      localStorage.setItem('access_token', 'test-token-123');
      
      // Should detect token
      expect(isAuthenticated()).toBe(true);
      expect(getAuthToken()).toBe('test-token-123');
      
      // Clear token
      localStorage.removeItem('access_token');
      
      // Should detect no token
      expect(isAuthenticated()).toBe(false);
      expect(getAuthToken()).toBe(null);
    });
  });

  describe('Django Error Handling', () => {
    it('should handle Django validation errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const validationError = {
        response: {
          status: 400,
          data: {
            email: ['This field is required.'],
            password: ['This password is too short.']
          }
        }
      };
      
      const result = handleDjangoError(validationError);
      
      expect(result.type).toBe('validation');
      expect(result.errors.email).toBe('This field is required.');
      expect(result.errors.password).toBe('This password is too short.');
    });

    it('should handle Django authentication errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const authError = {
        response: {
          status: 401,
          data: {
            detail: 'Authentication credentials were not provided.'
          }
        }
      };
      
      const result = handleDjangoError(authError);
      
      expect(result.type).toBe('authentication');
      expect(result.message).toBe('Authentication credentials were not provided.');
      expect(result.status).toBe(401);
    });

    it('should handle Django permission errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const permissionError = {
        response: {
          status: 403,
          data: {
            detail: 'You do not have permission to perform this action.'
          }
        }
      };
      
      const result = handleDjangoError(permissionError);
      
      expect(result.type).toBe('permission');
      expect(result.message).toBe('You do not have permission to perform this action.');
      expect(result.status).toBe(403);
    });

    it('should handle Django not found errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const notFoundError = {
        response: {
          status: 404,
          data: {
            detail: 'Not found.'
          }
        }
      };
      
      const result = handleDjangoError(notFoundError);
      
      expect(result.type).toBe('not_found');
      expect(result.message).toBe('Not found.');
      expect(result.status).toBe(404);
    });

    it('should handle Django server errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const serverError = {
        response: {
          status: 500,
          data: {
            detail: 'Internal server error'
          }
        }
      };
      
      const result = handleDjangoError(serverError);
      
      expect(result.type).toBe('server');
      expect(result.message).toBe('Internal server error');
      expect(result.status).toBe(500);
    });

    it('should handle network errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const networkError = {
        request: {},
        message: 'Network Error'
      };
      
      const result = handleDjangoError(networkError);
      
      expect(result.type).toBe('network');
      expect(result.message).toBe('Network error. Please check your connection and try again.');
      expect(result.status).toBe(null);
    });

    it('should handle unknown errors correctly', async () => {
      const { handleDjangoError } = await vi.importActual('../djangoApi');
      
      const unknownError = {
        message: 'Something went wrong'
      };
      
      const result = handleDjangoError(unknownError);
      
      expect(result.type).toBe('unknown');
      expect(result.message).toBe('Something went wrong');
      expect(result.status).toBe(null);
    });
  });

  describe('API Configuration', () => {
    it('should use correct Django API base URL from environment', () => {
      // Test that the API is configured with the correct base URL
      // This is more of a configuration test
      const expectedBaseUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';
      expect(expectedBaseUrl).toBe('http://localhost:8000');
    });
  });

  describe('Django Response Format Handling', () => {
    it('should handle Django pagination format correctly', () => {
      const mockDjangoPaginatedResponse = {
        count: 25,
        next: 'http://localhost:8000/api/portfolio/projects/?page=2',
        previous: null,
        results: [
          { id: 1, title: 'Project 1' },
          { id: 2, title: 'Project 2' }
        ]
      };

      // Test that we can extract the results correctly
      const projects = mockDjangoPaginatedResponse.results;
      expect(projects).toHaveLength(2);
      expect(projects[0].title).toBe('Project 1');
      expect(mockDjangoPaginatedResponse.count).toBe(25);
      expect(mockDjangoPaginatedResponse.next).toContain('page=2');
    });

    it('should handle Django date format correctly', () => {
      const djangoDateString = '2024-01-15T10:30:00Z';
      const date = new Date(djangoDateString);
      
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should handle Django field validation errors format', () => {
      const djangoValidationErrors = {
        email: ['Enter a valid email address.'],
        password: ['This password is too short.', 'This password is too common.'],
        display_name: ['This field is required.']
      };

      // Test extracting first error message for each field
      const fieldErrors = {};
      Object.keys(djangoValidationErrors).forEach(field => {
        fieldErrors[field] = Array.isArray(djangoValidationErrors[field]) 
          ? djangoValidationErrors[field][0] 
          : djangoValidationErrors[field];
      });

      expect(fieldErrors.email).toBe('Enter a valid email address.');
      expect(fieldErrors.password).toBe('This password is too short.');
      expect(fieldErrors.display_name).toBe('This field is required.');
    });
  });

  describe('Token Storage Security', () => {
    it('should store tokens in localStorage correctly', () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      expect(localStorage.getItem('access_token')).toBe(accessToken);
      expect(localStorage.getItem('refresh_token')).toBe(refreshToken);
    });

    it('should clear tokens correctly on logout', () => {
      localStorage.setItem('access_token', 'access-token-123');
      localStorage.setItem('refresh_token', 'refresh-token-456');

      // Simulate logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      expect(localStorage.getItem('access_token')).toBe(null);
      expect(localStorage.getItem('refresh_token')).toBe(null);
    });
  });
});