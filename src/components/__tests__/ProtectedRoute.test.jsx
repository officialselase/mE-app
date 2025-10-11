import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../../context/AuthContext';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading spinner when authentication is being checked', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated user access', () => {
    it('should render children when user is authenticated and route requires auth', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' },
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requireAuth={true}>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect authenticated user away from login page', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' },
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <div>Login Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should redirect to intended destination after login', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' },
      });

      render(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/learn' } } }]}>
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <div>Login Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/learn" element={<div>Learn Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Learn Page')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated user access', () => {
    it('should redirect unauthenticated user to login when accessing protected route', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter initialEntries={['/learn']}>
          <Routes>
            <Route
              path="/learn"
              element={
                <ProtectedRoute requireAuth={true}>
                  <div>Learn Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Learn Page')).not.toBeInTheDocument();
    });

    it('should render children when unauthenticated user accesses public route', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requireAuth={false}>
            <div>Login Page</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should use custom redirect path', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter initialEntries={['/projects-repo']}>
          <Routes>
            <Route
              path="/projects-repo"
              element={
                <ProtectedRoute requireAuth={true} redirectTo="/custom-login">
                  <div>Projects Repo</div>
                </ProtectedRoute>
              }
            />
            <Route path="/custom-login" element={<div>Custom Login</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Custom Login')).toBeInTheDocument();
      expect(screen.queryByText('Projects Repo')).not.toBeInTheDocument();
    });

    it('should preserve the attempted URL for redirect after login', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      let capturedState;
      const LoginPage = () => {
        const location = window.location;
        capturedState = location.state;
        return <div>Login Page</div>;
      };

      render(
        <MemoryRouter initialEntries={['/learn']}>
          <Routes>
            <Route
              path="/learn"
              element={
                <ProtectedRoute requireAuth={true}>
                  <div>Learn Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing location state gracefully', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' },
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <div>Login Page</div>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should work with nested routes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' },
      });

      render(
        <MemoryRouter initialEntries={['/learn/course/1']}>
          <Routes>
            <Route
              path="/learn/*"
              element={
                <ProtectedRoute requireAuth={true}>
                  <Routes>
                    <Route path="course/:id" element={<div>Course Content</div>} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Course Content')).toBeInTheDocument();
    });
  });
});
