import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { cacheConfig } from '../utils/queryClient';

/**
 * Fetch work experience from API
 * @returns {Promise} - API response data
 */
const fetchWorkExperience = async () => {
  const response = await apiClient.get('/api/work');
  const data = response.data;

  // Sort by start date (most recent first)
  return data.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB - dateA;
  });
};

/**
 * Custom hook for fetching work experience data with React Query caching
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {Object} - { workExperience, loading, error, refetch }
 */
const useWorkExperience = ({ enabled = true } = {}) => {
  const queryKey = ['workExperience'];

  const {
    data: workExperience = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchWorkExperience,
    enabled,
    ...cacheConfig.work,
    onError: (err) => {
      console.error('Error fetching work experience:', err);
    },
  });

  return {
    workExperience,
    loading,
    error,
    refetch,
  };
};

export default useWorkExperience;
