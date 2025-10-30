import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useProjects from '../useProjects';
import { portfolioAPI } from '../../utils/djangoApi';

// Mock the Django API client
vi.mock('../../utils/djangoApi', () => ({
  portfolioAPI: {
    getProjects: vi.fn(),
  },
}));

describe('useProjects - Django Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { id: 1, title: 'Project 1', description: 'Description 1', featured: true },
        { id: 2, title: 'Project 2', description: 'Description 2', featured: false },
      ];

      const mockResponse = {
        data: {
          count: 2,
          next: null,
          previous: null,
          results: mockProjects
        }
      };

      portfolioAPI.getProjects.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProjects());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual(mockProjects);
      expect(result.current.error).toBe(null);
      expect(portfolioAPI.getProjects).toHaveBeenCalledWith({});
    });

    it('should fetch projects with limit parameter', async () => {
      const mockProjects = [{ id: 1, title: 'Project 1', featured: true }];
      const mockResponse = {
        data: {
          count: 1,
          results: mockProjects
        }
      };
      
      portfolioAPI.getProjects.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProjects(true, 8));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(portfolioAPI.getProjects).toHaveBeenCalledWith({ featured: true, limit: 8 });
    });

    it('should fetch featured projects only', async () => {
      const mockProjects = [{ id: 1, title: 'Featured Project', featured: true }];
      const mockResponse = {
        data: {
          count: 1,
          results: mockProjects
        }
      };
      
      portfolioAPI.getProjects.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProjects(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(portfolioAPI.getProjects).toHaveBeenCalledWith({ featured: true });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during fetch', async () => {
      portfolioAPI.getProjects.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ 
          data: { count: 0, results: [] } 
        }), 100))
      );

      const { result } = renderHook(() => useProjects());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      portfolioAPI.getProjects.mockResolvedValueOnce({ 
        data: { count: 0, results: [] } 
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      portfolioAPI.getProjects.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error States', () => {
    it('should handle API error with response message', async () => {
      const errorMessage = 'Failed to load projects';
      portfolioAPI.getProjects.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle API error without response', async () => {
      portfolioAPI.getProjects.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should handle Django validation error format', async () => {
      portfolioAPI.getProjects.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            detail: 'Invalid parameters provided'
          }
        }
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid parameters provided');
      });
    });

    it('should clear error on successful refetch', async () => {
      portfolioAPI.getProjects.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      const mockProjects = [{ id: 1, title: 'Project 1' }];
      portfolioAPI.getProjects.mockResolvedValueOnce({ 
        data: { count: 1, results: mockProjects } 
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });

      expect(result.current.projects).toHaveLength(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty projects array', async () => {
      portfolioAPI.getProjects.mockResolvedValueOnce({ 
        data: { count: 0, results: [] } 
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should return empty array initially', () => {
      const { result } = renderHook(() => useProjects(false, null, false));

      expect(result.current.projects).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Caching', () => {
    it('should handle Django pagination format', async () => {
      const mockProjects = [{ id: 1, title: 'Project 1' }];
      const mockResponse = {
        data: {
          count: 10,
          next: 'http://localhost:8000/api/portfolio/projects/?page=2',
          previous: null,
          results: mockProjects
        }
      };
      
      portfolioAPI.getProjects.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProjects(false, 8));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual(mockProjects);
      expect(portfolioAPI.getProjects).toHaveBeenCalledWith({ limit: 8 });
    });

    it('should refetch when refetch is called', async () => {
      const mockProjects = [{ id: 1, title: 'Project 1' }];
      portfolioAPI.getProjects.mockResolvedValue({ 
        data: { count: 1, results: mockProjects } 
      });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(portfolioAPI.getProjects).toHaveBeenCalledTimes(1);

      result.current.refetch();

      await waitFor(() => {
        expect(portfolioAPI.getProjects).toHaveBeenCalledTimes(2);
      });
    });
  });
});
