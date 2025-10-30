import { useState, useCallback } from 'react';
import { useCache, useCacheWithMutation, CacheManager } from './useCache';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

/**
 * Fetch courses from Django API
 * @returns {Promise} - API response data
 */
const fetchCourses = async () => {
  const response = await learnAPI.getCourses();
  return response.data.results || response.data;
};

/**
 * Enroll in a course
 * @param {string} courseId - Course ID to enroll in
 * @returns {Promise} - API response data
 */
const enrollInCourse = async (courseId) => {
  const response = await learnAPI.enrollInCourse(courseId);
  return response.data;
};

/**
 * Get user's enrollments
 * @returns {Promise} - API response data
 */
const fetchEnrollments = async () => {
  const response = await learnAPI.getEnrollments();
  return response.data.results || response.data;
};

export const useCourses = ({ enabled = true } = {}) => {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  // Fetch courses with caching
  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
    isStale: coursesStale,
    refetch: refetchCourses,
    mutate: mutateCourses,
  } = useCacheWithMutation(
    'courses',
    fetchCourses,
    {
      cacheType: 'courses',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching courses:', err);
      },
    }
  );

  // Fetch enrollments with caching
  const {
    data: enrollmentsData,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    isStale: enrollmentsStale,
    refetch: refetchEnrollments,
  } = useCache(
    'enrollments',
    () => fetchEnrollments().catch(() => []), // Don't fail if enrollments fail
    {
      cacheType: 'courses',
      enabled,
      staleWhileRevalidate: true,
    }
  );

  // Combine courses and enrollments data
  const courses = coursesData ? coursesData.map(course => {
    const enrolledCourseIds = new Set((enrollmentsData || []).map(e => e.course));
    return {
      ...course,
      is_enrolled: enrolledCourseIds.has(course.id),
      enrollment: (enrollmentsData || []).find(e => e.course === course.id) || null
    };
  }) : [];

  // Enroll in course function with cache mutation
  const handleEnrollInCourse = useCallback(async (courseId) => {
    try {
      setEnrolling(true);
      setEnrollError(null);
      
      // Optimistic update
      const optimisticCourses = courses.map(course =>
        course.id === courseId
          ? { ...course, is_enrolled: true }
          : course
      );
      
      const response = await mutateCourses(
        () => enrollInCourse(courseId),
        optimisticCourses
      );
      
      // Also refresh enrollments
      await refetchEnrollments();
      
      return response;
    } catch (err) {
      console.error('Error enrolling in course:', err);
      const djangoError = handleDjangoError(err);
      setEnrollError(djangoError.message);
      throw new Error(djangoError.message);
    } finally {
      setEnrolling(false);
    }
  }, [courses, mutateCourses, refetchEnrollments]);

  // Helper function to invalidate all course-related cache
  const invalidateAllCourses = useCallback(() => {
    CacheManager.invalidateByType('courses');
  }, []);

  const loading = coursesLoading || enrollmentsLoading;
  const error = coursesError || enrollmentsError;
  const isStale = coursesStale || enrollmentsStale;

  const refetch = useCallback(async () => {
    await Promise.all([refetchCourses(), refetchEnrollments()]);
  }, [refetchCourses, refetchEnrollments]);

  return {
    courses,
    enrollments: enrollmentsData || [],
    loading,
    error: error?.message || null,
    isStale,
    enrollInCourse: handleEnrollInCourse,
    isEnrolling: enrolling,
    enrollError,
    retry: refetch,
    refetch,
    invalidateAllCourses,
  };
};

export default useCourses;