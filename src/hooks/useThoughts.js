import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { cacheConfig } from '../utils/queryClient';

/**
 * Fetch thoughts from API
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response data
 */
const fetchThoughts = async ({ limit, page = 1, featured }) => {
  const params = {};
  if (limit) params.limit = limit;
  if (page) params.page = page;
  if (featured !== undefined) params.featured = featured;

  const response = await apiClient.get('/api/thoughts', { params });
  return response.data;
};

/**
 * Custom hook for fetching thoughts/blog posts data with React Query caching
 * @param {Object} options - Configuration options
 * @param {number} options.limit - Number of thoughts to fetch
 * @param {number} options.page - Page number for pagination
 * @param {boolean} options.featured - Filter for featured thoughts only
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { thoughts, loading, error, refetch }
 */
const useThoughts = ({ limit, page = 1, featured, enabled = true } = {}) => {
  const queryKey = ['thoughts', { limit, page, featured }];

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchThoughts({ limit, page, featured }),
    enabled,
    ...cacheConfig.thoughts,
    onError: (err) => {
      console.error('Error fetching thoughts:', err);
    },
  });

  return {
    thoughts: data?.thoughts || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
  };
};

export default useThoughts;
