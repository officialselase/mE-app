import { useState, useCallback, useMemo } from 'react';
import { useCache, CacheManager } from './useCache';

/**
 * Advanced pagination hook with intelligent caching and prefetching
 * @param {string} cacheKey - Base cache key for the data
 * @param {Function} fetchFunction - Function to fetch paginated data
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and controls
 */
export const usePagination = (cacheKey, fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    cacheType = 'default',
    enabled = true,
    prefetchNext = true,
    prefetchPrevious = false,
    maxPrefetchPages = 2,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize_, setPageSize] = useState(pageSize);

  // Generate cache key for current page
  const currentCacheKey = `${cacheKey}_page_${currentPage}_size_${pageSize_}`;

  // Fetch current page data
  const {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  } = useCache(
    currentCacheKey,
    () => fetchFunction({ page: currentPage, limit: pageSize_ }),
    {
      dependencies: [currentPage, pageSize_],
      cacheType,
      enabled,
      staleWhileRevalidate: true,
    }
  );

  // Extract pagination info from data
  const paginationInfo = useMemo(() => {
    if (!data?.pagination) {
      return {
        totalItems: data?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        currentPage: 1,
      };
    }

    return {
      totalItems: data.pagination.count,
      totalPages: data.pagination.totalPages,
      hasNext: data.pagination.hasNext,
      hasPrevious: data.pagination.hasPrevious,
      currentPage: data.pagination.currentPage,
    };
  }, [data]);

  // Prefetch adjacent pages
  const prefetchPage = useCallback(async (page) => {
    if (page < 1 || (paginationInfo.totalPages && page > paginationInfo.totalPages)) {
      return;
    }

    const prefetchCacheKey = `${cacheKey}_page_${page}_size_${pageSize_}`;
    
    try {
      // Check if already cached and fresh
      const cached = CacheManager.getEntry?.(prefetchCacheKey);
      if (cached && !cached.isStale()) {
        return;
      }

      // Prefetch in background
      await fetchFunction({ page, limit: pageSize_ });
    } catch (error) {
      // Silently fail prefetch
      console.debug('Prefetch failed for page', page, error);
    }
  }, [cacheKey, pageSize_, paginationInfo.totalPages, fetchFunction]);

  // Prefetch adjacent pages when current page changes
  useMemo(() => {
    if (!enabled || loading) {return;}

    const prefetchPromises = [];

    // Prefetch next pages
    if (prefetchNext && paginationInfo.hasNext) {
      for (let i = 1; i <= maxPrefetchPages; i++) {
        const nextPage = currentPage + i;
        if (nextPage <= paginationInfo.totalPages) {
          prefetchPromises.push(prefetchPage(nextPage));
        }
      }
    }

    // Prefetch previous pages
    if (prefetchPrevious && paginationInfo.hasPrevious) {
      for (let i = 1; i <= maxPrefetchPages; i++) {
        const prevPage = currentPage - i;
        if (prevPage >= 1) {
          prefetchPromises.push(prefetchPage(prevPage));
        }
      }
    }

    // Execute prefetches
    Promise.all(prefetchPromises).catch(() => {
      // Silently handle prefetch failures
    });
  }, [
    currentPage,
    paginationInfo.hasNext,
    paginationInfo.hasPrevious,
    paginationInfo.totalPages,
    prefetchNext,
    prefetchPrevious,
    maxPrefetchPages,
    prefetchPage,
    enabled,
    loading,
  ]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    if (page >= 1 && (!paginationInfo.totalPages || page <= paginationInfo.totalPages)) {
      setCurrentPage(page);
    }
  }, [paginationInfo.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNext]);

  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPrevious]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    if (paginationInfo.totalPages) {
      setCurrentPage(paginationInfo.totalPages);
    }
  }, [paginationInfo.totalPages]);

  // Change page size
  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Invalidate all pages for this cache key
  const invalidateAllPages = useCallback(() => {
    CacheManager.invalidateByPattern(cacheKey);
  }, [cacheKey]);

  // Get page range for pagination UI
  const getPageRange = useCallback((maxVisible = 5) => {
    const { totalPages, currentPage } = paginationInfo;
    
    if (!totalPages || totalPages <= maxVisible) {
      return Array.from({ length: totalPages || 1 }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [paginationInfo]);

  return {
    // Data
    items: data?.items || data?.projects || data?.thoughts || data || [],
    loading,
    error,
    isStale,

    // Pagination info
    currentPage,
    pageSize: pageSize_,
    totalItems: paginationInfo.totalItems,
    totalPages: paginationInfo.totalPages,
    hasNext: paginationInfo.hasNext,
    hasPrevious: paginationInfo.hasPrevious,

    // Navigation
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,

    // Utilities
    getPageRange,
    refetch,
    invalidate,
    invalidateAllPages,
  };
};

/**
 * Hook for infinite scroll pagination with caching
 * @param {string} cacheKey - Base cache key
 * @param {Function} fetchFunction - Fetch function
 * @param {Object} options - Options
 * @returns {Object} - Infinite scroll state and controls
 */
export const useInfiniteScroll = (cacheKey, fetchFunction, options = {}) => {
  const {
    pageSize = 10,
    cacheType = 'default',
    enabled = true,
  } = options;

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) {return;}

    const pageCacheKey = `${cacheKey}_infinite_page_${currentPage}_size_${pageSize}`;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction({ page: currentPage, limit: pageSize });
      
      const newItems = response.items || response.projects || response.thoughts || response || [];
      const pagination = response.pagination;

      setPages(prev => [...prev, ...newItems]);
      setCurrentPage(prev => prev + 1);
      
      // Check if there are more pages
      if (pagination) {
        setHasMore(pagination.hasNext);
      } else {
        // If no pagination info, assume no more if we got less than pageSize
        setHasMore(newItems.length === pageSize);
      }

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, currentPage, pageSize, loading, hasMore, enabled, fetchFunction]);

  // Reset infinite scroll
  const reset = useCallback(() => {
    setPages([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Load initial page
  useMemo(() => {
    if (enabled && pages.length === 0 && !loading) {
      loadMore();
    }
  }, [enabled, pages.length, loading, loadMore]);

  return {
    items: pages,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    currentPage: currentPage - 1, // Adjust for 0-based indexing
    totalLoaded: pages.length,
  };
};

export default usePagination;