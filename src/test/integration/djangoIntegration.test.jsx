import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { AuthProvider } from '../../context/AuthContext';
import { authAPI, portfolioAPI, learnAPI } from '../../utils/djangoApi';

// Mock Django API
vi.mock('../../utils/djangoApi', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
  portfolioAPI: {
    getProjects: vi.fn(),
    getThoughts: vi.fn(),
    getWorkExperience: vi.fn(),
  },
  learnAPI: {
    getCourses: vi.fn(),
    getCourse: vi.fn(),
    enrollInCourse: vi.fn(),
    getSubmissions: vi.fn(),
    submitAssignment: vi.fn(),
  },
}));

// Mock React Router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Django Integration - End-to-End Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full registration flow with Django backend', async () => {
      const user = userEvent.setup();
      
      // Mock successful registration
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        display_name: 'New User'
      };
      
      authAPI.register.mockResolvedValueOnce({
        data: {
          user: mockUser,
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        }
      });

      // Mock initial auth check (no existing user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to register page
      const registerLink = screen.getByText(/register/i);
      await user.click(registerLink);

      // Fill out registration form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const displayNameInput = screen.getByLabelText(/display name/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'securepassword123');
      await user.type(displayNameInput, 'New User');

      // Submit registration
      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      // Verify Django API was called correctly
      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'securepassword123',
          display_name: 'New User'
        });
      });

      // Verify tokens are stored
      expect(localStorage.getItem('access_token')).toBe('access-token-123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-123');

      // Verify user is redirected after successful registration
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should complete full login flow with Django backend', async () => {
      const user = userEvent.setup();
      
      // Mock successful login
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        display_name: 'Test User'
      };
      
      authAPI.login.mockResolvedValueOnce({
        data: {
          user: mockUser,
          access_token: 'access-token-456',
          refresh_token: 'refresh-token-456'
        }
      });

      // Mock initial auth check (no existing user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to login page
      const loginLink = screen.getByText(/login/i);
      await user.click(loginLink);

      // Fill out login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'password123');

      // Submit login
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify Django API was called correctly
      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123'
        });
      });

      // Verify tokens are stored
      expect(localStorage.getItem('access_token')).toBe('access-token-456');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456');

      // Verify user is redirected after successful login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle Django authentication errors correctly', async () => {
      const user = userEvent.setup();
      
      // Mock failed login with Django error format
      authAPI.login.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            non_field_errors: ['Invalid credentials provided.']
          }
        }
      });

      // Mock initial auth check (no existing user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to login page
      const loginLink = screen.getByText(/login/i);
      await user.click(loginLink);

      // Fill out login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'wrongpassword');

      // Submit login
      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Verify no tokens are stored
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should handle token refresh automatically', async () => {
      // Set up expired token scenario
      localStorage.setItem('access_token', 'expired-token');
      localStorage.setItem('refresh_token', 'valid-refresh-token');

      const mockUser = {
        id: 1,
        email: 'user@example.com',
        display_name: 'Test User'
      };

      // Mock initial auth check failure (expired token)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      // Mock successful token refresh
      authAPI.refreshToken.mockResolvedValueOnce({
        data: {
          access: 'new-access-token'
        }
      });

      // Mock successful user fetch with new token
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify token refresh was attempted
      await waitFor(() => {
        expect(authAPI.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      });

      // Verify new token is stored
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
    });
  });

  describe('Portfolio Content Integration', () => {
    it('should fetch and display projects from Django API', async () => {
      // Mock projects data in Django format
      const mockProjects = [
        {
          id: 1,
          title: 'Django Portfolio',
          description: 'A portfolio built with Django and React',
          technologies: ['Django', 'React', 'PostgreSQL'],
          featured: true,
          github_url: 'https://github.com/user/portfolio',
          live_url: 'https://portfolio.example.com',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          title: 'E-commerce App',
          description: 'Full-stack e-commerce application',
          technologies: ['Django', 'Vue.js', 'Stripe'],
          featured: true,
          github_url: 'https://github.com/user/ecommerce',
          live_url: 'https://shop.example.com',
          created_at: '2024-01-10T15:20:00Z'
        }
      ];

      portfolioAPI.getProjects.mockResolvedValueOnce({
        data: {
          count: 2,
          next: null,
          previous: null,
          results: mockProjects
        }
      });

      // Mock initial auth check (no user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for projects to load on home page
      await waitFor(() => {
        expect(screen.getByText('Django Portfolio')).toBeInTheDocument();
        expect(screen.getByText('E-commerce App')).toBeInTheDocument();
      });

      // Verify Django API was called with correct parameters
      expect(portfolioAPI.getProjects).toHaveBeenCalledWith({
        featured: true,
        limit: 8
      });

      // Verify project details are displayed
      expect(screen.getByText('A portfolio built with Django and React')).toBeInTheDocument();
      expect(screen.getByText('Django')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should fetch and display thoughts from Django API', async () => {
      // Mock thoughts data in Django format
      const mockThoughts = [
        {
          id: 1,
          title: 'Django vs Express: A Comparison',
          content: 'After working with both frameworks...',
          tags: ['django', 'express', 'backend'],
          featured: true,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        }
      ];

      portfolioAPI.getThoughts.mockResolvedValueOnce({
        data: {
          count: 1,
          next: null,
          previous: null,
          results: mockThoughts
        }
      });

      // Mock projects (empty for this test)
      portfolioAPI.getProjects.mockResolvedValueOnce({
        data: {
          count: 0,
          results: []
        }
      });

      // Mock initial auth check (no user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for thoughts to load on home page
      await waitFor(() => {
        expect(screen.getByText('Django vs Express: A Comparison')).toBeInTheDocument();
      });

      // Verify Django API was called with correct parameters
      expect(portfolioAPI.getThoughts).toHaveBeenCalledWith({
        featured: true,
        limit: 7
      });
    });

    it('should handle Django API errors gracefully', async () => {
      // Mock API error
      portfolioAPI.getProjects.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            detail: 'Internal server error'
          }
        }
      });

      portfolioAPI.getThoughts.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            detail: 'Internal server error'
          }
        }
      });

      // Mock initial auth check (no user)
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for error states to appear
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });
  });

  describe('Learn Platform Integration', () => {
    it('should complete course enrollment flow with Django backend', async () => {
      const user = userEvent.setup();

      // Mock authenticated user
      const mockUser = {
        id: 1,
        email: 'student@example.com',
        display_name: 'Student User'
      };

      localStorage.setItem('access_token', 'valid-token');
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      // Mock courses data
      const mockCourses = [
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn the basics of React',
          instructor: 'John Doe',
          duration: '4 weeks',
          level: 'Beginner'
        }
      ];

      learnAPI.getCourses.mockResolvedValueOnce({
        data: mockCourses
      });

      // Mock successful enrollment
      learnAPI.enrollInCourse.mockResolvedValueOnce({
        data: {
          id: 1,
          course: 1,
          student: 1,
          enrolled_at: '2024-01-15T10:30:00Z'
        }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to learn page
      const learnLink = screen.getByText(/learn/i);
      await user.click(learnLink);

      // Wait for courses to load
      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click enroll button
      const enrollButton = screen.getByText(/enroll/i);
      await user.click(enrollButton);

      // Verify enrollment API was called
      await waitFor(() => {
        expect(learnAPI.enrollInCourse).toHaveBeenCalledWith(1);
      });

      // Verify success message or state change
      await waitFor(() => {
        expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
      });
    });

    it('should complete assignment submission flow with Django backend', async () => {
      const user = userEvent.setup();

      // Mock authenticated user
      const mockUser = {
        id: 1,
        email: 'student@example.com',
        display_name: 'Student User'
      };

      localStorage.setItem('access_token', 'valid-token');
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      // Mock assignment data
      const mockAssignment = {
        id: 1,
        title: 'Build a Todo App',
        description: 'Create a simple todo application',
        instructions: 'Use React and implement CRUD operations',
        due_date: '2024-12-31T23:59:59Z'
      };

      // Mock successful submission
      learnAPI.submitAssignment.mockResolvedValueOnce({
        data: {
          id: 1,
          assignment: 1,
          student: 1,
          github_repo_url: 'https://github.com/student/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'This was a great learning experience!',
          is_public: true,
          submitted_at: '2024-01-15T10:30:00Z'
        }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to projects repo page (assignments)
      const projectsRepoLink = screen.getByText(/projects repo/i);
      await user.click(projectsRepoLink);

      // Wait for assignment form to be available
      await waitFor(() => {
        expect(screen.getByText(/submit assignment/i)).toBeInTheDocument();
      });

      // Fill out submission form
      const githubInput = screen.getByLabelText(/github repository url/i);
      const liveUrlInput = screen.getByLabelText(/live preview url/i);
      const notesInput = screen.getByLabelText(/notes/i);
      const publicCheckbox = screen.getByLabelText(/make submission public/i);

      await user.type(githubInput, 'https://github.com/student/todo-app');
      await user.type(liveUrlInput, 'https://todo-app.netlify.app');
      await user.type(notesInput, 'This was a great learning experience!');
      await user.click(publicCheckbox);

      // Submit assignment
      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      await user.click(submitButton);

      // Verify Django API was called correctly
      await waitFor(() => {
        expect(learnAPI.submitAssignment).toHaveBeenCalledWith(1, {
          github_repo_url: 'https://github.com/student/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'This was a great learning experience!',
          is_public: true
        });
      });

      // Verify success feedback
      await waitFor(() => {
        expect(screen.getByText(/submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should display public submissions from Django API', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 1,
        email: 'student@example.com',
        display_name: 'Student User'
      };

      localStorage.setItem('access_token', 'valid-token');
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      // Mock public submissions
      const mockSubmissions = [
        {
          id: 1,
          assignment: 1,
          student: {
            id: 2,
            display_name: 'Other Student'
          },
          github_repo_url: 'https://github.com/other/todo-app',
          live_preview_url: 'https://other-todo.netlify.app',
          notes: 'Great project to work on!',
          is_public: true,
          submitted_at: '2024-01-14T15:20:00Z'
        }
      ];

      learnAPI.getSubmissions.mockResolvedValueOnce({
        data: mockSubmissions
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to projects repo page
      const projectsRepoLink = screen.getByText(/projects repo/i);
      await user.click(projectsRepoLink);

      // Wait for submissions to load
      await waitFor(() => {
        expect(screen.getByText('Other Student')).toBeInTheDocument();
        expect(screen.getByText('Great project to work on!')).toBeInTheDocument();
      });

      // Verify Django API was called
      expect(learnAPI.getSubmissions).toHaveBeenCalled();

      // Verify submission links are displayed
      expect(screen.getByText(/github/i)).toBeInTheDocument();
      expect(screen.getByText(/live preview/i)).toBeInTheDocument();
    });

    it('should handle Django learn platform errors', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 1,
        email: 'student@example.com',
        display_name: 'Student User'
      };

      localStorage.setItem('access_token', 'valid-token');
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      // Mock API error
      learnAPI.getCourses.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            detail: 'You do not have permission to access this resource.'
          }
        }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to learn page
      const learnLink = screen.getByText(/learn/i);
      await user.click(learnLink);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/permission/i)).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes Integration', () => {
    it('should redirect unauthenticated users to login for protected routes', async () => {
      // Mock no authenticated user
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Try to navigate to protected route
      const learnLink = screen.getByText(/learn/i);
      await userEvent.click(learnLink);

      // Should be redirected to login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        display_name: 'Test User'
      };

      localStorage.setItem('access_token', 'valid-token');
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      // Mock courses for learn page
      learnAPI.getCourses.mockResolvedValueOnce({
        data: []
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to protected route
      const learnLink = screen.getByText(/learn/i);
      await userEvent.click(learnLink);

      // Should access the page successfully
      await waitFor(() => {
        expect(screen.getByText(/courses/i)).toBeInTheDocument();
      });

      // Should not be redirected
      expect(mockNavigate).not.toHaveBeenCalledWith('/login');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      authAPI.getCurrentUser.mockRejectedValueOnce(new Error('Network Error'));
      portfolioAPI.getProjects.mockRejectedValueOnce(new Error('Network Error'));
      portfolioAPI.getThoughts.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show error states instead of crashing
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show offline indicator when Django backend is unreachable', async () => {
      // Mock connection timeout
      const timeoutError = new Error('timeout of 15000ms exceeded');
      timeoutError.code = 'ECONNABORTED';

      authAPI.getCurrentUser.mockRejectedValueOnce(timeoutError);
      portfolioAPI.getProjects.mockRejectedValueOnce(timeoutError);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show offline/connection error state
      await waitFor(() => {
        expect(screen.getByText(/connection/i)).toBeInTheDocument();
      });
    });
  });
});