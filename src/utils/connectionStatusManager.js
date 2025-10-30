/**
 * Connection Status Manager
 * Centralized utility for monitoring Django API connectivity and managing connection state
 */

import { testEndpoint, verifyAllEndpoints, quickHealthCheck } from './endpointVerification';
import { handleAPIError } from './errorHandler';

class ConnectionStatusManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.apiStatus = 'unknown'; // 'healthy', 'degraded', 'offline', 'unknown'
    this.lastHealthCheck = null;
    this.healthCheckInterval = null;
    this.listeners = new Set();
    this.endpointStatus = new Map();
    this.retryQueue = new Set();
    
    this.init();
  }

  init() {
    // Listen for browser online/offline events
    window.addEventListener('online', this.handleBrowserOnline.bind(this));
    window.addEventListener('offline', this.handleBrowserOffline.bind(this));
    
    // Listen for Django-specific connection events
    window.addEventListener('django-connection-lost', this.handleDjangoConnectionLost.bind(this));
    window.addEventListener('django-connection-restored', this.handleDjangoConnectionRestored.bind(this));
    
    // Start periodic health checks
    this.startHealthChecks();
    
    // Initial health check
    this.performHealthCheck();
  }

  /**
   * Add a listener for connection status changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status changes
   */
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      apiStatus: this.apiStatus,
      lastHealthCheck: this.lastHealthCheck,
      endpointStatus: Object.fromEntries(this.endpointStatus),
      hasRetryQueue: this.retryQueue.size > 0
    };
  }

  /**
   * Perform a quick health check of critical endpoints
   */
  async performHealthCheck() {
    try {
      const results = await quickHealthCheck();
      const healthyEndpoints = Object.values(results).filter(Boolean).length;
      const totalEndpoints = Object.keys(results).length;
      
      let newStatus;
      if (healthyEndpoints === totalEndpoints) {
        newStatus = 'healthy';
      } else if (healthyEndpoints > 0) {
        newStatus = 'degraded';
      } else {
        newStatus = 'offline';
      }
      
      const previousStatus = this.apiStatus;
      this.apiStatus = newStatus;
      this.lastHealthCheck = new Date();
      
      // Update individual endpoint status
      Object.entries(results).forEach(([endpoint, isHealthy]) => {
        this.endpointStatus.set(endpoint, isHealthy);
      });
      
      // Notify listeners if status changed
      if (previousStatus !== newStatus) {
        this.notifyListeners({
          type: 'status-change',
          previousStatus,
          currentStatus: newStatus,
          timestamp: this.lastHealthCheck,
          endpointResults: results
        });
      }
      
      return results;
    } catch (error) {
      console.error('Health check failed:', error);
      this.apiStatus = 'offline';
      this.lastHealthCheck = new Date();
      
      this.notifyListeners({
        type: 'health-check-failed',
        error: handleAPIError(error),
        timestamp: this.lastHealthCheck
      });
      
      return null;
    }
  }

  /**
   * Perform comprehensive endpoint verification
   */
  async performFullVerification() {
    try {
      const results = await verifyAllEndpoints();
      
      // Update endpoint status map
      Object.entries(results).forEach(([endpoint, result]) => {
        this.endpointStatus.set(endpoint, result.success);
      });
      
      this.notifyListeners({
        type: 'full-verification-complete',
        results,
        timestamp: new Date()
      });
      
      return results;
    } catch (error) {
      console.error('Full verification failed:', error);
      
      this.notifyListeners({
        type: 'full-verification-failed',
        error: handleAPIError(error),
        timestamp: new Date()
      });
      
      return null;
    }
  }

  /**
   * Test a specific endpoint
   */
  async testSpecificEndpoint(endpoint, method = 'GET', requiresAuth = false) {
    try {
      const result = await testEndpoint(endpoint, method, requiresAuth);
      
      this.endpointStatus.set(endpoint, result.success);
      
      this.notifyListeners({
        type: 'endpoint-tested',
        endpoint,
        result,
        timestamp: new Date()
      });
      
      return result;
    } catch (error) {
      console.error(`Failed to test endpoint ${endpoint}:`, error);
      
      this.endpointStatus.set(endpoint, false);
      
      this.notifyListeners({
        type: 'endpoint-test-failed',
        endpoint,
        error: handleAPIError(error),
        timestamp: new Date()
      });
      
      return { success: false, error: error.message, endpoint, method };
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(interval = 30000) { // 30 seconds
    this.stopHealthChecks();
    
    this.healthCheckInterval = setInterval(() => {
      if (this.isOnline) {
        this.performHealthCheck();
      }
    }, interval);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Add a failed request to the retry queue
   */
  addToRetryQueue(requestInfo) {
    this.retryQueue.add(requestInfo);
    
    this.notifyListeners({
      type: 'request-queued',
      requestInfo,
      queueSize: this.retryQueue.size,
      timestamp: new Date()
    });
  }

  /**
   * Process the retry queue when connection is restored
   */
  async processRetryQueue() {
    if (this.retryQueue.size === 0) {return;}
    
    const queuedRequests = Array.from(this.retryQueue);
    this.retryQueue.clear();
    
    this.notifyListeners({
      type: 'retry-queue-processing',
      requestCount: queuedRequests.length,
      timestamp: new Date()
    });
    
    const results = [];
    
    for (const requestInfo of queuedRequests) {
      try {
        // Attempt to retry the request
        if (typeof requestInfo.retry === 'function') {
          const result = await requestInfo.retry();
          results.push({ success: true, requestInfo, result });
        }
      } catch (error) {
        results.push({ success: false, requestInfo, error });
        // Re-queue failed requests
        this.retryQueue.add(requestInfo);
      }
    }
    
    this.notifyListeners({
      type: 'retry-queue-processed',
      results,
      remainingQueue: this.retryQueue.size,
      timestamp: new Date()
    });
    
    return results;
  }

  /**
   * Handle browser online event
   */
  handleBrowserOnline() {
    this.isOnline = true;
    
    this.notifyListeners({
      type: 'browser-online',
      timestamp: new Date()
    });
    
    // Perform health check when coming back online
    setTimeout(() => {
      this.performHealthCheck();
    }, 1000);
  }

  /**
   * Handle browser offline event
   */
  handleBrowserOffline() {
    this.isOnline = false;
    this.apiStatus = 'offline';
    
    this.notifyListeners({
      type: 'browser-offline',
      timestamp: new Date()
    });
  }

  /**
   * Handle Django connection lost event
   */
  handleDjangoConnectionLost() {
    this.apiStatus = 'offline';
    
    this.notifyListeners({
      type: 'django-connection-lost',
      timestamp: new Date()
    });
  }

  /**
   * Handle Django connection restored event
   */
  handleDjangoConnectionRestored() {
    this.apiStatus = 'healthy';
    
    this.notifyListeners({
      type: 'django-connection-restored',
      timestamp: new Date()
    });
    
    // Process any queued requests
    this.processRetryQueue();
  }

  /**
   * Get connection quality score (0-100)
   */
  getConnectionQuality() {
    if (!this.isOnline) {return 0;}
    
    const totalEndpoints = this.endpointStatus.size;
    if (totalEndpoints === 0) {return 50;} // Unknown
    
    const healthyEndpoints = Array.from(this.endpointStatus.values()).filter(Boolean).length;
    return Math.round((healthyEndpoints / totalEndpoints) * 100);
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage() {
    if (!this.isOnline) {
      return 'No internet connection';
    }
    
    switch (this.apiStatus) {
      case 'healthy':
        return 'All systems operational';
      case 'degraded':
        return 'Some services may be unavailable';
      case 'offline':
        return 'Backend services are unavailable';
      default:
        return 'Checking connection status...';
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopHealthChecks();
    
    window.removeEventListener('online', this.handleBrowserOnline);
    window.removeEventListener('offline', this.handleBrowserOffline);
    window.removeEventListener('django-connection-lost', this.handleDjangoConnectionLost);
    window.removeEventListener('django-connection-restored', this.handleDjangoConnectionRestored);
    
    this.listeners.clear();
    this.endpointStatus.clear();
    this.retryQueue.clear();
  }
}

// Create singleton instance
const connectionStatusManager = new ConnectionStatusManager();

// Export both the class and singleton instance
export { ConnectionStatusManager };
export default connectionStatusManager;

// Note: React hooks should be imported separately in components that use them
// These are provided as reference implementations