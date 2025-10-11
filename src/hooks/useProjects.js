import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { cacheConfig } from '../utils/queryClient';

/**
 * Fetch projects from API
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response data
 */
const fetchProjects = async ({ limit, page = 1, featured }) => {
  const params = {};
  if (limit) params.limit = limit;
  if (page) params.page = page;
  if (featured !== undefined) params.featured = featured;

  const response = await apiClient.get('/api/projects', { params });
  return response.data;
};

/**
 * Custom hook for fetching projects data with React Query caching
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Number of projects to fetch
 * @param {number} options.page - Page number for pagination
 * @param {boolean} options.featured - Filter for featured projects only
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { projects, loading, error, refetch }
 */
const useProjects = ({ limit, page = 1, featured, enabled = true } = {}) => {
  const queryKey = ['projects', { limit, page, featured }];

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchProjects({ limit, page, featured }),
    enabled,
    ...cacheConfig.projects,
    onError: (err) => {
      console.error('Error fetching projects:', err);
    },
  });

  return {
    projects: data?.projects || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
  };
};

export default useProjects;
