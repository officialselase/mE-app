import { useCache, CacheManager } from './useCache';
import { portfolioAPI, handleDjangoError } from '../utils/djangoApi';

/**
 * Fetch work experience from Django API
 * @returns {Promise} - API response data
 */
const fetchWorkExperience = async () => {
  try {
    const response = await portfolioAPI.getWorkExperience();
    let data = response.data;
    
    // Handle both paginated and non-paginated responses
    if (data.results) {
      data = data.results;
    }
    
    // Ensure we have an array
    if (!Array.isArray(data)) {
      data = [];
    }

    // Sort by start date (most recent first)
    // Handle different date field names that might come from Django
    return data.sort((a, b) => {
      const dateA = new Date(a.start_date || a.startDate || a.date_started);
      const dateB = new Date(b.start_date || b.startDate || b.date_started);
      return dateB - dateA;
    });
  } catch (error) {
    const djangoError = handleDjangoError(error);
    throw new Error(djangoError.message || 'Failed to fetch work experience');
  }
};

/**
 * Custom hook for fetching work experience data from Django API with intelligent caching
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { workExperience, loading, error, isStale, refetch, invalidate }
 */
const useWorkExperience = ({ enabled = true } = {}) => {
  const cacheKey = 'work_experience';

  const {
    data: workExperience = [],
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  } = useCache(
    cacheKey,
    fetchWorkExperience,
    {
      dependencies: [],
      cacheType: 'work',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching work experience from Django API:', err);
      },
    }
  );

  // Helper function to invalidate work experience cache
  const invalidateWorkExperience = () => {
    CacheManager.invalidateByType('work');
  };

  return {
    workExperience,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    invalidateWorkExperience,
  };
};

export default useWorkExperience;
