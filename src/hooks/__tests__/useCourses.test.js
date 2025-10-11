import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCourses } from '../useCourses';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useCourses', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Learn the basics of React',
      instructor_name: 'John Doe',
      is_enrolled: false,
    },
    {
      id: '2',
      title: 'Advanced JavaScript',
      description: 'Deep dive into JavaScript concepts',
      instructor_name: 'Jane Smith',
      is_enrolled: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state and data fetching', () => {
    it('should start with loading state', () => {
      apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useCourses());

      expect(result.current.loading).toBe(true);
      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should fetch courses on mount', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual(mockCourses);
      expect(result.current.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/api/courses');
    });

    it('should handle empty courses response', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: { courses: [] }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle missing courses in response', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: {}
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors with error message', async () => {
      const errorMessage = 'Failed to fetch courses';
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: errorMessage } }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      apiClient.get.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle errors without specific message', async () => {
      apiClient.get.mockRejectedValueOnce({});

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch courses');
    });
  });

  describe('Course enrollment', () => {
    it('should enroll in course successfully', async () => {
      // Initial fetch
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      // Enrollment response
      const enrollmentResponse = { data: { enrollment: { id: '1' } } };
      apiClient.post.mockResolvedValueOnce(enrollmentResponse);

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let enrollmentResult;
      await act(async () => {
        enrollmentResult = await result.current.enrollInCourse('1');
      });

      expect(enrollmentResult).toEqual(enrollmentResponse.data);
      expect(apiClient.post).toHaveBeenCalledWith('/api/courses/1/enroll');

      // Should update the course enrollment status
      const updatedCourse = result.current.courses.find(c => c.id === '1');
      expect(updatedCourse.is_enrolled).toBe(true);
    });

    it('should handle enrollment errors', async () => {
      // Initial fetch
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      const errorMessage = 'Enrollment failed';
      apiClient.post.mockRejectedValueOnce({
        response: { data: { error: errorMessage } }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.enrollInCourse('1');
        });
      }).rejects.toThrow(errorMessage);

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      // Should not update course enrollment status
      const course = result.current.courses.find(c => c.id === '1');
      expect(course.is_enrolled).toBe(false);
    });

    it('should handle enrollment network errors', async () => {
      // Initial fetch
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      const networkError = new Error('Network error');
      apiClient.post.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.enrollInCourse('1');
        });
      }).rejects.toThrow('Network error');
    });

    it('should handle enrollment errors without specific message', async () => {
      // Initial fetch
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      apiClient.post.mockRejectedValueOnce({});

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.enrollInCourse('1');
        });
      }).rejects.toThrow('Failed to enroll in course');
    });

    it('should clear error before enrollment attempt', async () => {
      // Initial fetch with error
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: 'Initial error' } }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      // Successful enrollment
      apiClient.post.mockResolvedValueOnce({
        data: { enrollment: { id: '1' } }
      });

      await act(async () => {
        await result.current.enrollInCourse('1');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Course progress', () => {
    it('should get course progress successfully', async () => {
      const progressData = {
        course_id: '1',
        completed_lessons: ['lesson1', 'lesson2'],
        progress_percentage: 40,
      };

      apiClient.get
        .mockResolvedValueOnce({ data: { courses: mockCourses } }) // Initial fetch
        .mockResolvedValueOnce({ data: progressData }); // Progress fetch

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let progressResult;
      await act(async () => {
        progressResult = await result.current.getCourseProgress('1');
      });

      expect(progressResult).toEqual(progressData);
      expect(apiClient.get).toHaveBeenCalledWith('/api/courses/1/progress');
    });

    it('should handle progress fetch errors', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { courses: mockCourses } });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const errorMessage = 'Failed to fetch progress';
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: errorMessage } }
      });

      await expect(async () => {
        await act(async () => {
          await result.current.getCourseProgress('1');
        });
      }).rejects.toThrow(errorMessage);
    });

    it('should handle progress fetch network errors', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { courses: mockCourses } });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const networkError = new Error('Network error');
      apiClient.get.mockRejectedValueOnce(networkError);

      await expect(async () => {
        await act(async () => {
          await result.current.getCourseProgress('1');
        });
      }).rejects.toThrow('Network error');
    });

    it('should handle progress fetch errors without specific message', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { courses: mockCourses } });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      apiClient.get.mockRejectedValueOnce({});

      await expect(async () => {
        await act(async () => {
          await result.current.getCourseProgress('1');
        });
      }).rejects.toThrow('Failed to fetch course progress');
    });
  });

  describe('Retry functionality', () => {
    it('should retry fetching courses', async () => {
      // Initial error
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: 'Network error' } }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Successful retry
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      await act(async () => {
        result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual(mockCourses);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during retry', async () => {
      // Initial error
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: 'Network error' } }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Retry with delayed response
      apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      act(() => {
        result.current.retry();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Refetch functionality', () => {
    it('should refetch courses', async () => {
      // Initial fetch
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Refetch with updated data
      const updatedCourses = [...mockCourses, {
        id: '3',
        title: 'New Course',
        description: 'A new course',
        instructor_name: 'New Instructor',
        is_enrolled: false,
      }];

      apiClient.get.mockResolvedValueOnce({
        data: { courses: updatedCourses }
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual(updatedCourses);
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Hook return values', () => {
    it('should provide all expected functions and values', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: { courses: mockCourses }
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('courses');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('enrollInCourse');
      expect(result.current).toHaveProperty('getCourseProgress');
      expect(result.current).toHaveProperty('retry');
      expect(result.current).toHaveProperty('refetch');

      expect(typeof result.current.enrollInCourse).toBe('function');
      expect(typeof result.current.getCourseProgress).toBe('function');
      expect(typeof result.current.retry).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});