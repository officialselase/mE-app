/**
 * Data freshness utilities for intelligent refetching
 */

// Freshness thresholds for different data types (in milliseconds)
const FRESHNESS_THRESHOLDS = {
  // Static content - can be cached longer
  projects: 15 * 60 * 1000, // 15 minutes
  thoughts: 15 * 60 * 1000, // 15 minutes
  work: 60 * 60 * 1000, // 1 hour
  
  // Dynamic content - shorter cache
  courses: 10 * 60 * 1000, // 10 minutes
  lessons: 20 * 60 * 1000, // 20 minutes
  assignments: 10 * 60 * 1000, // 10 minutes
  
  // Highly dynamic content - very short cache
  submissions: 2 * 60 * 1000, // 2 minutes
  comments: 1 * 60 * 1000, // 1 minute
  enrollments: 5 * 60 * 1000, // 5 minutes
  
  // User data
  user: 10 * 60 * 1000, // 10 minutes
  
  // Default
  default: 5 * 60 * 1000, // 5 minutes
};

// Priority levels for different data types
const DATA_PRIORITIES = {
  user: 'high',
  courses: 'high',
  projects: 'medium',
  thoughts: 'medium',
  work: 'low',
  lessons: 'medium',
  assignments: 'medium',
  submissions: 'high',
  comments: 'high',
  enrollments: 'high',
};

/**
 * Check if data is fresh based on type and timestamp
 * @param {string} dataType - Type of data
 * @param {number} timestamp - When data was last fetched
 * @returns {boolean} - Whether data is still fresh
 */
export const isDataFresh = (dataType, timestamp) => {
  const threshold = FRESHNESS_THRESHOLDS[dataType] || FRESHNESS_THRESHOLDS.default;
  return Date.now() - timestamp < threshold;
};

/**
 * Check if data should be refetched based on priority and user activity
 * @param {string} dataType - Type of data
 * @param {number} timestamp - When data was last fetched
 * @param {Object} options - Additional options
 * @returns {boolean} - Whether data should be refetched
 */
export const shouldRefetch = (dataType, timestamp, options = {}) => {
  const {
    userActive = true,
    networkQuality = 'good', // 'good', 'slow', 'offline'
    batteryLevel = 1, // 0-1
    isVisible = true,
  } = options;

  // Don't refetch if offline
  if (networkQuality === 'offline') {
    return false;
  }

  // Don't refetch if page is not visible (unless high priority)
  if (!isVisible && DATA_PRIORITIES[dataType] !== 'high') {
    return false;
  }

  // Don't refetch if user is inactive and data is not high priority
  if (!userActive && DATA_PRIORITIES[dataType] === 'low') {
    return false;
  }

  // Consider battery level for mobile devices
  if (batteryLevel < 0.2 && DATA_PRIORITIES[dataType] === 'low') {
    return false;
  }

  // Adjust thresholds based on network quality
  let threshold = FRESHNESS_THRESHOLDS[dataType] || FRESHNESS_THRESHOLDS.default;
  
  if (networkQuality === 'slow') {
    // Increase threshold for slow networks (cache longer)
    threshold *= 2;
  }

  return Date.now() - timestamp > threshold;
};

/**
 * Get optimal refetch interval based on data type and conditions
 * @param {string} dataType - Type of data
 * @param {Object} options - Additional options
 * @returns {number} - Refetch interval in milliseconds
 */
export const getRefetchInterval = (dataType, options = {}) => {
  const {
    userActive = true,
    networkQuality = 'good',
    batteryLevel = 1,
    isVisible = true,
  } = options;

  let baseInterval = FRESHNESS_THRESHOLDS[dataType] || FRESHNESS_THRESHOLDS.default;

  // Adjust based on conditions
  if (!isVisible) {
    baseInterval *= 4; // Refetch less frequently when not visible
  }

  if (!userActive) {
    baseInterval *= 2; // Refetch less frequently when user is inactive
  }

  if (networkQuality === 'slow') {
    baseInterval *= 1.5; // Refetch less frequently on slow networks
  }

  if (batteryLevel < 0.3) {
    baseInterval *= 1.5; // Refetch less frequently on low battery
  }

  // Ensure minimum interval
  return Math.max(baseInterval, 30 * 1000); // At least 30 seconds
};

/**
 * Determine if data should be prefetched
 * @param {string} dataType - Type of data
 * @param {Object} options - Additional options
 * @returns {boolean} - Whether to prefetch
 */
export const shouldPrefetch = (dataType, options = {}) => {
  const {
    userActive = true,
    networkQuality = 'good',
    batteryLevel = 1,
    isVisible = true,
    dataUsageMode = 'normal', // 'normal', 'saver'
  } = options;

  // Don't prefetch in data saver mode
  if (dataUsageMode === 'saver') {
    return false;
  }

  // Don't prefetch if offline or slow network
  if (networkQuality === 'offline' || networkQuality === 'slow') {
    return false;
  }

  // Don't prefetch on low battery
  if (batteryLevel < 0.3) {
    return false;
  }

  // Only prefetch high priority data when not visible
  if (!isVisible && DATA_PRIORITIES[dataType] !== 'high') {
    return false;
  }

  // Only prefetch when user is active for low priority data
  if (!userActive && DATA_PRIORITIES[dataType] === 'low') {
    return false;
  }

  return true;
};

/**
 * Get cache duration based on data type and conditions
 * @param {string} dataType - Type of data
 * @param {Object} options - Additional options
 * @returns {number} - Cache duration in milliseconds
 */
export const getCacheDuration = (dataType, options = {}) => {
  const {
    networkQuality = 'good',
    storageAvailable = true,
  } = options;

  let baseDuration = FRESHNESS_THRESHOLDS[dataType] || FRESHNESS_THRESHOLDS.default;

  // Extend cache duration for slow networks
  if (networkQuality === 'slow') {
    baseDuration *= 2;
  }

  // Reduce cache duration if storage is limited
  if (!storageAvailable) {
    baseDuration *= 0.5;
  }

  return baseDuration;
};

/**
 * Smart cache invalidation strategy
 * @param {string} dataType - Type of data that was mutated
 * @returns {string[]} - Related data types that should be invalidated
 */
export const getInvalidationTargets = (dataType) => {
  const invalidationMap = {
    // When user data changes, invalidate enrollments and submissions
    user: ['enrollments', 'submissions'],
    
    // When enrolling in courses, invalidate courses and enrollments
    enrollments: ['courses', 'user'],
    
    // When submitting assignments, invalidate submissions and assignments
    submissions: ['assignments', 'enrollments'],
    
    // When completing lessons, invalidate lessons and enrollments
    lessons: ['enrollments', 'courses'],
    
    // When adding comments, invalidate comments and submissions
    comments: ['submissions'],
    
    // Portfolio content changes rarely affect other data
    projects: [],
    thoughts: [],
    work: [],
    
    // Course structure changes affect related data
    courses: ['enrollments'],
    assignments: ['submissions'],
  };

  return invalidationMap[dataType] || [];
};

/**
 * Detect user activity patterns for smart caching
 */
export class ActivityTracker {
  constructor() {
    this.lastActivity = Date.now();
    this.isActive = true;
    this.activityListeners = [];
    
    this.setupActivityListeners();
  }

  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.isActive = true;
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every minute
    setInterval(() => {
      const inactive = Date.now() - this.lastActivity > 5 * 60 * 1000; // 5 minutes
      if (inactive !== !this.isActive) {
        this.isActive = !inactive;
        this.notifyListeners();
      }
    }, 60 * 1000);
  }

  addListener(callback) {
    this.activityListeners.push(callback);
  }

  removeListener(callback) {
    this.activityListeners = this.activityListeners.filter(l => l !== callback);
  }

  notifyListeners() {
    this.activityListeners.forEach(callback => callback(this.isActive));
  }

  getActivityStatus() {
    return {
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      inactiveDuration: Date.now() - this.lastActivity,
    };
  }
}

// Global activity tracker instance
export const activityTracker = new ActivityTracker();

/**
 * Network quality detection
 */
export const getNetworkQuality = () => {
  if (!navigator.connection) {
    return 'good'; // Default assumption
  }

  const connection = navigator.connection;
  const effectiveType = connection.effectiveType;

  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }

  if (effectiveType === '3g' && connection.downlink < 1.5) {
    return 'slow';
  }

  return 'good';
};

/**
 * Battery level detection
 */
export const getBatteryLevel = async () => {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return battery.level;
    }
  } catch (error) {
    // Battery API not supported or failed
  }
  
  return 1; // Default to full battery
};

export default {
  isDataFresh,
  shouldRefetch,
  getRefetchInterval,
  shouldPrefetch,
  getCacheDuration,
  getInvalidationTargets,
  activityTracker,
  getNetworkQuality,
  getBatteryLevel,
};