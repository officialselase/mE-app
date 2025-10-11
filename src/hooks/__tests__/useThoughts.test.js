import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useThoughts from '../useThoughts';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useThoughts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch thoughts successfully', async () => {
      const mockThoughts = [
        { id: '1', title: 'Thought 1', snippet: 'Snippet 1', content: 'Content 1' },
        { id: '2', title: 'Thought 2', snippet: 'Snippet 2', content: 'Content 2' },
      ];

      apiClient.get.mockResolvedValueOnce({ data: mockThoughts });

      const { result } = renderHook(() => useThoughts());

      expect(result.current.loading).toBe(true);
      expect(result.current.thoughts).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.thoughts).toEqual(mockThoughts);
      expect(result.current.error).toBe(null);
      expect(apiClient.get).toHaveBeenCalledWith('/api/thoughts', { params: { page: 1 } });
    });

    it('should fetch thoughts with limit parameter', async () => {
      const mockThoughts = [{ id: '1', title: 'Thought 1' }];
      apiClient.get.mockResolvedValueOnce({ data: mockThoughts });

      const { result } = renderHook(() => useThoughts({ limit: 7 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/thoughts', {
        params: { limit: 7, page: 1 },
      });
    });

    it('should fetch thoughts with pagination', async () => {
      const mockThoughts = [{ id: '3', title: 'Thought 3' }];
      apiClient.get.mockResolvedValueOnce({ data: mockThoughts });

      const { result } = renderHook(() => useThoughts({ page: 2, limit: 10 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/thoughts', {
        params: { page: 2, limit: 10 },
      });
    });

    it('should fetch featured thoughts only', async () => {
      const mockThoughts = [{ id: '1', title: 'Featured Thought', featured: true }];
      apiClient.get.mockResolvedValueOnce({ data: mockThoughts });

      const { result } = renderHook(() => useThoughts({ featured: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/thoughts', {
        params: { featured: true, page: 1 },
      });
    });

    it('should not auto-fetch when autoFetch is false', async () => {
      const { result } = renderHook(() => useThoughts({ autoFetch: false }));

      expect(result.current.loading).toBe(false);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during fetch', async () => {
      apiClient.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
      );

      const { result } = renderHook(() => useThoughts());

      expect(result.current.loading).toBe(true);
      expect(result.current.thoughts).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error States', () => {
    it('should handle API error with response message', async () => {
      const errorMessage = 'Failed to load thoughts';
      apiClient.get.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.thoughts).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle API error without response', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should handle generic error', async () => {
      apiClient.get.mockRejectedValueOnce({});

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch thoughts');
      });
    });

    it('should clear error on successful refetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      apiClient.get.mockResolvedValueOnce({ data: [{ id: '1', title: 'Thought 1' }] });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });

      expect(result.current.thoughts).toHaveLength(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty thoughts array', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useThoughts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.thoughts).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should return empty array initially', () => {
      const { result } = renderHook(() => useThoughts({ autoFetch: false }));

      expect(result.current.thoughts).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Caching', () => {
    it('should cache fetched data', async () => {
      const mockThoughts = [{ id: '1', title: 'Thought 1' }];
      apiClient.get.mockResolvedValueOnce({ data: mockThoughts });

      const { result, rerender } = renderHook(() => useThoughts({ limit: 7 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Rerender should use cache
      rerender();

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should refetch and clear cache when refetch is called', async () => {
      const mockThoughts = [{ id: '1', title: 'Thought 1' }];
      apiClient.get.mockResolvedValue({ data: mockThoughts });

      const { result } = renderHook(() => useThoughts());

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
