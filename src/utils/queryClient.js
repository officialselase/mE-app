import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized caching strategies
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate pattern
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Cache time configurations for different data types
export const cacheConfig = {
  // Static content that changes rarely
  projects: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Blog content that changes occasionally
  thoughts: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
  },
  
  // Work experience that changes rarely
  work: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Course data that changes occasionally
  courses: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // User submissions that change frequently
  submissions: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // User profile data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },
};