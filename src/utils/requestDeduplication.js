/**
 * Request deduplication utility to prevent concurrent identical API calls
 */

// Store for ongoing requests
const ongoingRequests = new Map();

/**
 * Deduplicates requests by key, ensuring only one request per key is active at a time
 * @param {string} key - Unique identifier for the request
 * @param {Function} requestFn - Function that returns a Promise
 * @returns {Promise} - The deduplicated request promise
 */
export const deduplicateRequest = (key, requestFn) => {
  // Check if request is already ongoing
  if (ongoingRequests.has(key)) {
    return ongoingRequests.get(key);
  }

  // Create new request
  const requestPromise = requestFn()
    .finally(() => {
      // Clean up after request completes (success or failure)
      ongoingRequests.delete(key);
    });

  // Store the ongoing request
  ongoingRequests.set(key, requestPromise);

  return requestPromise;
};

/**
 * Creates a deduplicated version of an API function
 * @param {Function} apiFn - Original API function
 * @param {Function} keyGenerator - Function to generate cache key from arguments
 * @returns {Function} - Deduplicated API function
 */
export const createDeduplicatedAPI = (apiFn, keyGenerator) => {
  return (...args) => {
    const key = keyGenerator(...args);
    return deduplicateRequest(key, () => apiFn(...args));
  };
};

/**
 * Clears all ongoing requests (useful for cleanup)
 */
export const clearOngoingRequests = () => {
  ongoingRequests.clear();
};

/**
 * Gets statistics about ongoing requests
 */
export const getRequestStats = () => {
  return {
    ongoingCount: ongoingRequests.size,
    ongoingKeys: Array.from(ongoingRequests.keys()),
  };
};

export default deduplicateRequest;