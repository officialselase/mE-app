import { useCache, CacheManager } from './useCache';
import { portfolioAPI, handleDjangoError } from '../utils/djangoApi';

/**
 * Fetch projects from Django API
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response data
 */
const fetchProjects = async ({ limit, page = 1, featured }) => {
  const params = {};
  if (limit) {params.limit = limit;}
  if (page) {params.page = page;}
  if (featured !== undefined) {params.featured = featured;}

  try {
    const response = await portfolioAPI.getProjects(params);
    
    // Handle Django REST framework pagination format
    if (response.data.results) {
      return {
        projects: response.data.results,
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
      projects: Array.isArray(response.data) ? response.data : [],
      pagination: null,
    };
  } catch (error) {
    const djangoError = handleDjangoError(error);
    throw new Error(djangoError.message || 'Failed to fetch projects');
  }
};

/**
 * Custom hook for fetching projects data from Django API with intelligent caching
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Number of projects to fetch
 * @param {number} options.page - Page number for pagination
 * @param {boolean} options.featured - Filter for featured projects only
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { projects, pagination, loading, error, isStale, refetch, invalidate }
 */
const useProjects = ({ limit, page = 1, featured, enabled = true } = {}) => {
  const cacheKey = `projects_${limit || 'all'}_${page}_${featured || 'all'}`;

  const {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  } = useCache(
    cacheKey,
    () => fetchProjects({ limit, page, featured }),
    {
      dependencies: [limit, page, featured],
      cacheType: 'projects',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching projects from Django API:', err);
      },
    }
  );

  // Helper function to invalidate all project-related cache
  const invalidateAllProjects = () => {
    CacheManager.invalidateByType('projects');
  };

  return {
    projects: data?.projects || [],
    pagination: data?.pagination,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    invalidateAllProjects,
  };
};

export default useProjects;
