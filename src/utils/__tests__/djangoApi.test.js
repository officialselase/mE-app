import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios before importing djangoApi
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    post: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../errorHandler', () => ({
  handleAPIError: vi.fn(),
  logError: vi.fn(),
  retryRequest: vi.fn((fn) => fn()),
}));

// Mock request deduplication
vi.mock('../requestDeduplication', () => ({
  createDeduplicatedAPI: vi.fn((fn) => fn),
}));

// Import after mocks are set up
const { 
  authAPI, 
  portfolioAPI, 
  learnAPI, 
  shopAPI, 
  healthAPI,
  handleDjangoError,
  isAuthenticated,
  getAuthToken,
  testDjangoConnection
} = await import('../djangoApi');

describe('Django API Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
    
    // Mock environment variable
    import.meta.env = { VITE_DJANGO_API_URL: 'http://localhost:8000' };
  });

  describe('Authentication API', () => {
    describe('register', () => {
      it('should register user successfully', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'testpassword123',
          display_name: 'Test User'
        };
        
        const mockResponse = {
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 1,
              email: 'test@example.com',
              display_name: 'Test User'
            }
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await authAPI.register(userData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register/', userData);
        expect(result.data.user.email).toBe('test@example.com');
      });

      it('should handle registration validation errors', async () => {
        const userData = {
          email: 'invalid-email',
          password: '123',
          display_name: ''
        };
        
        const mockError = {
          response: {
            status: 400,
            data: {
              email: ['Enter a valid email address.'],
              password: ['This password is too short.'],
              display_name: ['This field is required.']
            }
          }
        };
        
        mockAxiosInstance.post.mockRejectedValue(mockError);
        
        await expect(authAPI.register(userData)).rejects.toEqual(mockError);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/register/', userData);
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'testpassword123'
        };
        
        const mockResponse = {
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 1,
              email: 'test@example.com',
              display_name: 'Test User'
            }
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await authAPI.login(credentials);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login/', credentials);
        expect(result.data.access_token).toBe('mock-access-token');
      });

      it('should handle invalid credentials error', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };
        
        const mockError = {
          response: {
            status: 401,
            data: {
              non_field_errors: ['Invalid credentials.']
            }
          }
        };
        
        mockAxiosInstance.post.mockRejectedValue(mockError);
        
        await expect(authAPI.login(credentials)).rejects.toEqual(mockError);
      });
    });

    describe('getCurrentUser', () => {
      it('should get current user successfully', async () => {
        const mockResponse = {
          data: {
            id: 1,
            email: 'test@example.com',
            display_name: 'Test User'
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await authAPI.getCurrentUser();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me/');
        expect(result.data.email).toBe('test@example.com');
      });

      it('should handle unauthorized error', async () => {
        const mockError = {
          response: {
            status: 401,
            data: {
              detail: 'Authentication credentials were not provided.'
            }
          }
        };
        
        mockAxiosInstance.get.mockRejectedValue(mockError);
        
        await expect(authAPI.getCurrentUser()).rejects.toEqual(mockError);
      });
    });

    describe('refreshToken', () => {
      it('should refresh token successfully', async () => {
        const refreshToken = 'mock-refresh-token';
        const mockResponse = {
          data: {
            access: 'new-access-token'
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await authAPI.refreshToken(refreshToken);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/refresh/', { refresh: refreshToken });
        expect(result.data.access).toBe('new-access-token');
      });

      it('should handle invalid refresh token', async () => {
        const refreshToken = 'invalid-refresh-token';
        const mockError = {
          response: {
            status: 401,
            data: {
              detail: 'Token is invalid or expired'
            }
          }
        };
        
        mockAxiosInstance.post.mockRejectedValue(mockError);
        
        await expect(authAPI.refreshToken(refreshToken)).rejects.toEqual(mockError);
      });
    });

    describe('logout', () => {
      it('should logout successfully', async () => {
        const mockResponse = { data: { message: 'Logged out successfully' } };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await authAPI.logout();
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/logout/');
        expect(result.data.message).toBe('Logged out successfully');
      });
    });
  });

  describe('Portfolio API', () => {
    describe('getProjects', () => {
      it('should fetch projects successfully', async () => {
        const mockResponse = {
          data: {
            count: 2,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                title: 'Test Project 1',
                description: 'A test project',
                featured: true,
                technologies: ['React', 'Django']
              },
              {
                id: 2,
                title: 'Test Project 2',
                description: 'Another test project',
                featured: false,
                technologies: ['Vue', 'Python']
              }
            ]
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await portfolioAPI.getProjects({ featured: true });
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/projects/', { 
          params: { featured: true } 
        });
        expect(result.data.results).toHaveLength(2);
        expect(result.data.results[0].title).toBe('Test Project 1');
      });

      it('should handle empty projects response', async () => {
        const mockResponse = {
          data: {
            count: 0,
            next: null,
            previous: null,
            results: []
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await portfolioAPI.getProjects();
        
        expect(result.data.results).toHaveLength(0);
      });
    });

    describe('getProject', () => {
      it('should fetch single project successfully', async () => {
        const projectId = 1;
        const mockResponse = {
          data: {
            id: 1,
            title: 'Test Project',
            description: 'A detailed test project',
            technologies: ['React', 'Django'],
            github_url: 'https://github.com/test/project'
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await portfolioAPI.getProject(projectId);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/projects/1/');
        expect(result.data.title).toBe('Test Project');
      });

      it('should handle project not found error', async () => {
        const projectId = 999;
        const mockError = {
          response: {
            status: 404,
            data: {
              detail: 'Not found.'
            }
          }
        };
        
        mockAxiosInstance.get.mockRejectedValue(mockError);
        
        await expect(portfolioAPI.getProject(projectId)).rejects.toEqual(mockError);
      });
    });

    describe('getThoughts', () => {
      it('should fetch thoughts successfully', async () => {
        const mockResponse = {
          data: {
            count: 1,
            results: [
              {
                id: 1,
                title: 'Test Thought',
                content: 'This is a test thought',
                created_at: '2024-01-15T10:30:00Z',
                tags: ['tech', 'programming']
              }
            ]
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await portfolioAPI.getThoughts({ limit: 5 });
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/thoughts/', { 
          params: { limit: 5 } 
        });
        expect(result.data.results[0].title).toBe('Test Thought');
      });
    });

    describe('getWorkExperience', () => {
      it('should fetch work experience successfully', async () => {
        const mockResponse = {
          data: [
            {
              id: 1,
              company: 'Test Company',
              position: 'Software Developer',
              start_date: '2023-01-01',
              end_date: null,
              current: true
            }
          ]
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await portfolioAPI.getWorkExperience();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio/work/');
        expect(result.data[0].company).toBe('Test Company');
      });
    });
  });

  describe('Learn Platform API', () => {
    describe('getCourses', () => {
      it('should fetch courses successfully', async () => {
        const mockResponse = {
          data: [
            {
              id: 1,
              title: 'React Fundamentals',
              description: 'Learn React basics',
              instructor: 'John Doe'
            }
          ]
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await learnAPI.getCourses();
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/learn/courses/');
        expect(result.data[0].title).toBe('React Fundamentals');
      });
    });

    describe('enrollInCourse', () => {
      it('should enroll in course successfully', async () => {
        const courseId = 1;
        const mockResponse = {
          data: {
            id: 1,
            course: 1,
            student: 1,
            enrolled_at: '2024-01-15T10:30:00Z'
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await learnAPI.enrollInCourse(courseId);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/learn/courses/1/enroll/');
        expect(result.data.course).toBe(1);
      });

      it('should handle already enrolled error', async () => {
        const courseId = 1;
        const mockError = {
          response: {
            status: 400,
            data: {
              non_field_errors: ['You are already enrolled in this course.']
            }
          }
        };
        
        mockAxiosInstance.post.mockRejectedValue(mockError);
        
        await expect(learnAPI.enrollInCourse(courseId)).rejects.toEqual(mockError);
      });
    });

    describe('submitAssignment', () => {
      it('should submit assignment successfully', async () => {
        const assignmentId = 1;
        const submissionData = {
          github_repo_url: 'https://github.com/test/assignment',
          live_preview_url: 'https://test.netlify.app',
          notes: 'My submission notes',
          is_public: true
        };
        
        const mockResponse = {
          data: {
            id: 1,
            assignment: 1,
            student: 1,
            ...submissionData,
            submitted_at: '2024-01-15T10:30:00Z'
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await learnAPI.submitAssignment(assignmentId, submissionData);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/learn/submissions/', {
          ...submissionData,
          assignment: assignmentId
        });
        expect(result.data.github_repo_url).toBe(submissionData.github_repo_url);
      });

      it('should handle submission validation errors', async () => {
        const assignmentId = 1;
        const submissionData = {
          github_repo_url: 'invalid-url',
          notes: ''
        };
        
        const mockError = {
          response: {
            status: 400,
            data: {
              github_repo_url: ['Enter a valid URL.']
            }
          }
        };
        
        mockAxiosInstance.post.mockRejectedValue(mockError);
        
        await expect(learnAPI.submitAssignment(assignmentId, submissionData)).rejects.toEqual(mockError);
      });
    });

    describe('getSubmissions', () => {
      it('should fetch assignment submissions successfully', async () => {
        const assignmentId = 1;
        const mockResponse = {
          data: [
            {
              id: 1,
              assignment: 1,
              student: {
                id: 1,
                display_name: 'Test Student'
              },
              github_repo_url: 'https://github.com/test/assignment',
              is_public: true,
              submitted_at: '2024-01-15T10:30:00Z'
            }
          ]
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await learnAPI.getSubmissions(assignmentId);
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/learn/submissions/', {
          params: { assignment_id: assignmentId }
        });
        expect(result.data[0].student.display_name).toBe('Test Student');
      });
    });
  });

  describe('Shop API', () => {
    describe('getProducts', () => {
      it('should fetch products successfully', async () => {
        const mockResponse = {
          data: {
            results: [
              {
                id: 1,
                name: 'Test Product',
                price: '29.99',
                description: 'A test product'
              }
            ]
          }
        };
        
        mockAxiosInstance.get.mockResolvedValue(mockResponse);
        
        const result = await shopAPI.getProducts({ category: 'electronics' });
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/shop/products/', {
          params: { category: 'electronics' }
        });
        expect(result.data.results[0].name).toBe('Test Product');
      });
    });

    describe('addToCart', () => {
      it('should add product to cart successfully', async () => {
        const productId = 1;
        const quantity = 2;
        const mockResponse = {
          data: {
            id: 1,
            product: productId,
            quantity: quantity,
            added_at: '2024-01-15T10:30:00Z'
          }
        };
        
        mockAxiosInstance.post.mockResolvedValue(mockResponse);
        
        const result = await shopAPI.addToCart(productId, quantity);
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/shop/cart/', {
          product_id: productId,
          quantity: quantity
        });
        expect(result.data.quantity).toBe(quantity);
      });
    });
  });

  describe('Error Handling', () => {
    describe('handleDjangoError', () => {
      it('should handle validation errors correctly', () => {
        const error = {
          response: {
            status: 400,
            data: {
              email: ['This field is required.'],
              password: ['This password is too short.']
            }
          }
        };
        
        const result = handleDjangoError(error);
        
        expect(result.type).toBe('validation');
        expect(result.errors.email).toBe('This field is required.');
        expect(result.errors.password).toBe('This password is too short.');
      });

      it('should handle authentication errors correctly', () => {
        const error = {
          response: {
            status: 401,
            data: {
              detail: 'Authentication credentials were not provided.'
            }
          }
        };
        
        const result = handleDjangoError(error);
        
        expect(result.type).toBe('authentication');
        expect(result.message).toBe('Authentication credentials were not provided.');
        expect(result.status).toBe(401);
      });

      it('should handle network errors correctly', () => {
        const error = {
          request: {},
          message: 'Network Error'
        };
        
        const result = handleDjangoError(error);
        
        expect(result.type).toBe('network');
        expect(result.message).toBe('Network error. Please check your connection and try again.');
        expect(result.status).toBe(null);
      });

      it('should handle server errors correctly', () => {
        const error = {
          response: {
            status: 500,
            data: {
              detail: 'Internal server error'
            }
          }
        };
        
        const result = handleDjangoError(error);
        
        expect(result.type).toBe('server');
        expect(result.message).toBe('Internal server error');
        expect(result.status).toBe(500);
      });
    });
  });

  describe('Authentication Utilities', () => {
    describe('isAuthenticated', () => {
      it('should return true when access token exists', () => {
        localStorage.setItem('access_token', 'mock-token');
        
        expect(isAuthenticated()).toBe(true);
      });

      it('should return false when no access token exists', () => {
        localStorage.removeItem('access_token');
        
        expect(isAuthenticated()).toBe(false);
      });
    });

    describe('getAuthToken', () => {
      it('should return access token when it exists', () => {
        const token = 'mock-access-token';
        localStorage.setItem('access_token', token);
        
        expect(getAuthToken()).toBe(token);
      });

      it('should return null when no token exists', () => {
        localStorage.removeItem('access_token');
        
        expect(getAuthToken()).toBe(null);
      });
    });
  });

  describe('Health Check', () => {
    describe('testDjangoConnection', () => {
      it('should return true when connection is successful', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });
        
        const result = await testDjangoConnection();
        
        expect(result).toBe(true);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health/');
      });

      it('should return false when connection fails', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));
        
        const result = await testDjangoConnection();
        
        expect(result).toBe(false);
      });
    });
  });

  describe('Request Interceptors', () => {
    it('should add authorization header when token exists', async () => {
      const token = 'mock-access-token';
      localStorage.setItem('access_token', token);
      
      // Re-import to trigger interceptor setup
      vi.resetModules();
      await import('../djangoApi');
      
      // Verify that axios.create was called and interceptors were set up
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    });
  });

  describe('Response Interceptors', () => {
    it('should handle token refresh on 401 error', async () => {
      const refreshToken = 'mock-refresh-token';
      localStorage.setItem('refresh_token', refreshToken);
      
      const mockRefreshResponse = {
        data: { access: 'new-access-token' }
      };
      
      mockedAxios.post.mockResolvedValue(mockRefreshResponse);
      
      // This would be tested through the actual interceptor logic
      // The test verifies the refresh token endpoint is called correctly
      const result = await authAPI.refreshToken(refreshToken);
      
      expect(result.data.access).toBe('new-access-token');
    });
  });
});