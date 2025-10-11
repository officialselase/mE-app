import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
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
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
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
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      localStorage.setItem('accessToken', 'mock-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        })
      );
    });
  });

  describe('login function', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

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
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('should throw error on failed login', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
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
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

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
      const mockUser = { id: '1', email: 'new@example.com', displayName: 'New User' };
      const mockResponse = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

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
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('should throw error on failed registration', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
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
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      localStorage.setItem('accessToken', 'access-token');
      localStorage.setItem('refreshToken', 'refresh-token');

      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout API call
      global.fetch.mockResolvedValueOnce({
        ok: true,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should clear state even if logout API call fails', async () => {
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      localStorage.setItem('accessToken', 'access-token');
      localStorage.setItem('refreshToken', 'refresh-token');

      // Mock initial auth check
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock failed logout API call
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('refreshToken function', () => {
    it('should successfully refresh token', async () => {
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User' };
      localStorage.setItem('refreshToken', 'refresh-token');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'new-access-token',
          user: mockUser,
        }),
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
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });

    it('should clear tokens on failed refresh', async () => {
      localStorage.setItem('refreshToken', 'invalid-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
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
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
