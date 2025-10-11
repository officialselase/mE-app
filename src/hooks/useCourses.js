import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { cacheConfig } from '../utils/queryClient';

/**
 * Fetch courses from API
 * @returns {Promise} - API response data
 */
const fetchCourses = async () => {
  const response = await apiClient.get('/api/courses');
  return response.data.courses || [];
};

/**
 * Enroll in a course
 * @param {string} courseId - Course ID to enroll in
 * @returns {Promise} - API response data
 */
const enrollInCourse = async (courseId) => {
  const response = await apiClient.post(`/api/courses/${courseId}/enroll`);
  return response.data;
};

/**
 * Get course progress
 * @param {string} courseId - Course ID
 * @returns {Promise} - API response data
 */
const getCourseProgress = async (courseId) => {
  const response = await apiClient.get(`/api/courses/${courseId}/progress`);
  return response.data;
};

export const useCourses = ({ enabled = true } = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['courses'];

  const {
    data: courses = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchCourses,
    enabled,
    ...cacheConfig.courses,
    onError: (err) => {
      console.error('Error fetching courses:', err);
    },
  });

  const enrollMutation = useMutation({
    mutationFn: enrollInCourse,
    onSuccess: (data, courseId) => {
      // Update the courses cache to reflect enrollment
      queryClient.setQueryData(queryKey, (oldCourses) =>
        oldCourses?.map(course =>
          course.id === courseId
            ? { ...course, is_enrolled: true }
            : course
        ) || []
      );
    },
    onError: (err) => {
      console.error('Error enrolling in course:', err);
    },
  });

  const progressQuery = (courseId) => ({
    queryKey: ['courseProgress', courseId],
    queryFn: () => getCourseProgress(courseId),
    enabled: !!courseId,
    ...cacheConfig.courses,
  });

  return {
    courses,
    loading,
    error,
    enrollInCourse: enrollMutation.mutate,
    enrollInCourseAsync: enrollMutation.mutateAsync,
    isEnrolling: enrollMutation.isLoading,
    enrollError: enrollMutation.error,
    getCourseProgress: (courseId) => useQuery(progressQuery(courseId)),
    retry: refetch,
    refetch,
  };
};

export default useCourses;