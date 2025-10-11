import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useWorkExperience from '../useWorkExperience';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useWorkExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch work experience successfully', async () => {
      const mockWorkExperience = [
        {
          id: '1',
          company: 'Company A',
          position: 'Developer',
          startDate: '2023-01-01',
          endDate: '2024-01-01',
        },
        {
          id: '2',
          company: 'Company B',
          position: 'Senior Developer',
          startDate: '2024-01-01',
          endDate: null,
        },
      ];

      apiClient.get.mockResolvedValueOnce({ data: mockWorkExperience });

      const { result } = renderHook(() => useWorkExperience());

      expect(result.current.loading).toBe(true);
      expect(result.current.workExperience).toEqual([]);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workExperience).toHaveLength(2);
      expect(result.current.error).toBe(null);
      expect(apiClient.get).toHaveBeenCalledWith('/api/work');
    });

    it('should sort work experience by start date (most recent first)', async () => {
      const mockWorkExperience = [
        {
          id: '1',
          company: 'Company A',
          startDate: '2020-01-01',
        },
        {
          id: '2',
          company: 'Company B',
          startDate: '2023-01-01',
        },
        {
          id: '3',
          company: 'Company C',
          startDate: '2021-06-01',
        },
      ];

      apiClient.get.mockResolvedValueOnce({ data: mockWorkExperience });

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workExperience[0].company).toBe('Company B');
      expect(result.current.workExperience[1].company).toBe('Company C');
      expect(result.current.workExperience[2].company).toBe('Company A');
    });

    it('should not auto-fetch when autoFetch is false', async () => {
      const { result } = renderHook(() => useWorkExperience({ autoFetch: false }));

      expect(result.current.loading).toBe(false);
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during fetch', async () => {
      apiClient.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
      );

      const { result } = renderHook(() => useWorkExperience());

      expect(result.current.loading).toBe(true);
      expect(result.current.workExperience).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error States', () => {
    it('should handle API error with response message', async () => {
      const errorMessage = 'Failed to load work experience';
      apiClient.get.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.workExperience).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it('should handle API error without response', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should handle generic error', async () => {
      apiClient.get.mockRejectedValueOnce({});

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch work experience');
      });
    });

    it('should clear error on successful refetch', async () => {
      apiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      apiClient.get.mockResolvedValueOnce({
        data: [{ id: '1', company: 'Company A', startDate: '2023-01-01' }],
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });

      expect(result.current.workExperience).toHaveLength(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty work experience array', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workExperience).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should return empty array initially', () => {
      const { result } = renderHook(() => useWorkExperience({ autoFetch: false }));

      expect(result.current.workExperience).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Caching', () => {
    it('should cache fetched data', async () => {
      const mockWorkExperience = [
        { id: '1', company: 'Company A', startDate: '2023-01-01' },
      ];
      apiClient.get.mockResolvedValueOnce({ data: mockWorkExperience });

      const { result, rerender } = renderHook(() => useWorkExperience());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Rerender should use cache
      rerender();

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should refetch and clear cache when refetch is called', async () => {
      const mockWorkExperience = [
        { id: '1', company: 'Company A', startDate: '2023-01-01' },
      ];
      apiClient.get.mockResolvedValue({ data: mockWorkExperience });

      const { result } = renderHook(() => useWorkExperience());

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
