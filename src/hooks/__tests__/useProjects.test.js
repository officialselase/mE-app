import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useProjects from '../useProjects';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { id: '1', title: 'Project 1', description: 'Description 1' },
        { id: '2', title: 'Project 2', description: 'Description 2' },
      ];

      apiClient.get.mockResolvedValueOnce({ data: mockProjects });

      const { result } = renderHook(() => useProjects());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual(mockProjects);
      expect(result.current.error).toBe(null);
      expect(apiClient.get).toHaveBeenCalledWith('/api/projects', { params: { page: 1 } });
    });

    it('should fetch projects with limit parameter', async () => {
      const mockProjects = [{ id: '1', title: 'Project 1' }];
      apiClient.get.mockResolvedValueOnce({ data: mockProjects });

      const { result } = renderHook(() => useProjects({ limit: 8 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects', {
        params: { limit: 8, page: 1 },
      });
    });

    it('should fetch projects with pagination', async () => {
      const mockProjects = [{ id: '3', title: 'Project 3' }];
      apiClient.get.mockResolvedValueOnce({ data: mockProjects });

      const { result } = renderHook(() => useProjects({ page: 2, limit: 10 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects', {
        params: { page: 2, limit: 10 },
      });
    });

    it('should fetch featured projects only', async () => {
      const mockProjects = [{ id: '1', title: 'Featured Project', featured: true }];
      apiClient.get.mockResolvedValueOnce({ data: mockProjects });

      const { result } = renderHook(() => useProjects({ featured: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects', {
        params: { featured: true, page: 1 },
      });
    });

    it('should not auto-fetch when autoFetch is false', async () => {
      const { result } = renderHook(() => useProjects({ autoFetch: false }));

      expect(result.current.loading).toBe(false);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during fetch', async () => {
      apiClient.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
      );

      const { result } = renderHook(() => useProjects());

      expect(result.current.loading).toBe(true);
      expect(result.current.projects).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

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
      apiClient.get.mockRejectedValueOnce({
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
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should handle generic error', async () => {
      apiClient.get.mockRejectedValueOnce({});

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch projects');
      });
    });

    it('should clear error on successful refetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      apiClient.get.mockResolvedValueOnce({ data: [{ id: '1', title: 'Project 1' }] });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });

      expect(result.current.projects).toHaveLength(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty projects array', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.projects).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should return empty array initially', () => {
      const { result } = renderHook(() => useProjects({ autoFetch: false }));

      expect(result.current.projects).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Caching', () => {
    it('should cache fetched data', async () => {
      const mockProjects = [{ id: '1', title: 'Project 1' }];
      apiClient.get.mockResolvedValueOnce({ data: mockProjects });

      const { result, rerender } = renderHook(() => useProjects({ limit: 8 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Rerender should use cache
      rerender();

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should refetch and clear cache when refetch is called', async () => {
      const mockProjects = [{ id: '1', title: 'Project 1' }];
      apiClient.get.mockResolvedValue({ data: mockProjects });

      const { result } = renderHook(() => useProjects());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);

      result.current.refetch();

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
