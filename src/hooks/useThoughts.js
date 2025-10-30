import { useCache, CacheManager } from './useCache';
import { portfolioAPI, handleDjangoError } from '../utils/djangoApi';

/**
 * Fetch thoughts from Django API
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response data
 */
const fetchThoughts = async ({ limit, page = 1, featured }) => {
  const params = {};
  if (limit) {params.limit = limit;}
  if (page) {params.page = page;}
  if (featured !== undefined) {params.featured = featured;}

  try {
    const response = await portfolioAPI.getThoughts(params);
    
    // Handle Django REST framework pagination format
    if (response.data.results) {
      return {
        thoughts: response.data.results,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          totalPages: Math.ceil(response.data.count / (limit || 10)),
          currentPage: page,
          hasNext: !!response.data.next,
          hasPrevious: !!response.data.previous,
        },
      };
    }
    
    // Handle non-paginated response
    return {
      thoughts: Array.isArray(response.data) ? response.data : [],
      pagination: null,
    };
  } catch (error) {
    const djangoError = handleDjangoError(error);
    throw new Error(djangoError.message || 'Failed to fetch thoughts');
  }
};

/**
 * Custom hook for fetching thoughts/blog posts data from Django API with intelligent caching
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Number of thoughts to fetch
 * @param {number} options.page - Page number for pagination
 * @param {boolean} options.featured - Filter for featured thoughts only
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { thoughts, pagination, loading, error, isStale, refetch, invalidate }
 */
const useThoughts = ({ limit, page = 1, featured, enabled = true } = {}) => {
  const cacheKey = `thoughts_${limit || 'all'}_${page}_${featured || 'all'}`;

  const {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  } = useCache(
    cacheKey,
    () => fetchThoughts({ limit, page, featured }),
    {
      dependencies: [limit, page, featured],
      cacheType: 'thoughts',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching thoughts from Django API:', err);
      },
    }
  );

  // Helper function to invalidate all thoughts-related cache
  const invalidateAllThoughts = () => {
    CacheManager.invalidateByType('thoughts');
  };

  return {
    thoughts: data?.thoughts || [],
    pagination: data?.pagination,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    invalidateAllThoughts,
  };
};

export default useThoughts;
