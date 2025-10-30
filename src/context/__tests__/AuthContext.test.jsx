import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI } from '../../utils/djangoApi';

// Mock Django API
vi.mock('../../utils/djangoApi', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('AuthContext - Django Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshToken');
    });
  });

  describe('Initial state', () => {
    it('should start with null user and not authenticated', async () => {
      authAPI.getCurrentUser.mockRejectedValueOnce({
        response: { status: 401 }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should check for existing token on mount', async () => {
      const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' };
      localStorage.setItem('access_token', 'mock-token');

      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authAPI.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('login function', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' };
      const mockResponse = {
        data: {
          user: mockUser,
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        }
      };

      authAPI.login.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toEqual(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('access-token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should throw error on failed login', async () => {
      authAPI.login.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' }
        }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        });
      }).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors during login', async () => {
      authAPI.login.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@example.com', 'password123');
        });
      }).rejects.toThrow('Network error');
    });
  });

  describe('register function', () => {
    it('should successfully register a new user', async () => {
      const mockUser = { id: 1, email: 'new@example.com', display_name: 'New User' };
      const mockResponse = {
        data: {
          user: mockUser,
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        }
      };

      authAPI.register.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register('new@example.com', 'password123', 'New User');
      });

      expect(registerResult).toEqual(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('access-token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
      expect(authAPI.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        display_name: 'New User'
      });
    });

    it('should throw error on failed registration', async () => {
      authAPI.register.mockRejectedValueOnce({
        response: {
          data: { message: 'Email already exists' }
        }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.register('existing@example.com', 'password123', 'User');
        });
      }).rejects.toThrow('Email already exists');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout function', () => {
    it('should successfully logout and clear state', async () => {
      const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' };
      localStorage.setItem('access_token', 'access-token');
      localStorage.setItem('refresh_token', 'refresh-token');

      // Mock initial auth check
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout API call
      authAPI.logout.mockResolvedValueOnce({
        data: { message: 'Logged out successfully' }
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(authAPI.logout).toHaveBeenCalled();
    });

    it('should clear state even if logout API call fails', async () => {
      const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' };
      localStorage.setItem('access_token', 'access-token');
      localStorage.setItem('refresh_token', 'refresh-token');

      // Mock initial auth check
      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock failed logout API call
      authAPI.logout.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('refreshToken function', () => {
    it('should successfully refresh token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', display_name: 'Test User' };
      localStorage.setItem('refresh_token', 'refresh-token');

      authAPI.refreshToken.mockResolvedValueOnce({
        data: {
          access: 'new-access-token',
        }
      });

      authAPI.getCurrentUser.mockResolvedValueOnce({
        data: mockUser
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(authAPI.refreshToken).toHaveBeenCalledWith('refresh-token');
    });

    it('should clear tokens on failed refresh', async () => {
      localStorage.setItem('refresh_token', 'invalid-token');

      authAPI.refreshToken.mockRejectedValueOnce({
        response: { status: 401 }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });
});
