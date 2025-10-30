import { useState, useEffect, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { retryRequest, handleAPIError, formatErrorMessage } from '../utils/errorHandler';
import { healthAPI } from '../utils/djangoApi';

/**
 * Enhanced OfflineDetector component for Django API integration
 * Shows offline status, handles network reconnection, and provides retry functionality
 */
const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'good', 'poor', 'offline'
  const [lastError, setLastError] = useState(null);

  // Test Django API connectivity using the configured API client
  const testDjangoConnection = useCallback(async () => {
    try {
      const response = await healthAPI.check();
      
      // Verify the response contains expected health data
      if (response.data && response.data.status === 'healthy') {
        setConnectionQuality('good');
        return true;
      } else {
        console.warn('Health endpoint returned unexpected data:', response.data);
        setConnectionQuality('poor');
        return false;
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      
      // Log detailed error information for debugging
      console.warn('Django health check failed:', {
        type: errorInfo?.type || 'unknown',
        message: errorInfo?.message || error.message,
        status: errorInfo?.status || null,
        details: errorInfo?.details || error
      });
      
      // Store the last error for user feedback
      setLastError(errorInfo || { type: 'unknown', message: error.message });
      
      // Set connection quality based on error type
      if (errorInfo?.type === 'network' || errorInfo?.type === 'connection' || errorInfo?.type === 'timeout') {
        setConnectionQuality('offline');
      } else if (errorInfo?.status === 404) {
        // Health endpoint not found - this is a configuration issue
        console.error('Health endpoint not found. Please ensure Django backend is properly configured.');
        setConnectionQuality('poor');
      } else {
        setConnectionQuality('poor');
      }
      
      return false;
    }
  }, []);

  // Handle retry connection with improved error handling
  const handleRetryConnection = useCallback(async () => {
    setIsRetrying(true);
    
    try {
      const isConnected = await retryRequest(testDjangoConnection, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 5000
      });
      
      if (isConnected) {
        setIsOnline(true);
        setConnectionQuality('good');
        setLastError(null); // Clear any previous errors
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('django-connection-restored', {
          detail: { timestamp: new Date().toISOString() }
        }));
        
        // Show success message briefly before hiding banner
        setTimeout(() => {
          setShowOfflineBanner(false);
        }, 2000);
      } else {
        // Connection test failed even after retries
        console.warn('Connection retry failed after multiple attempts');
        
        // Update connection quality based on network status
        if (navigator.onLine) {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('offline');
        }
      }
    } catch (error) {
      const errorInfo = handleAPIError(error);
      console.error('Failed to reconnect to Django API:', {
        error: errorInfo,
        timestamp: new Date().toISOString()
      });
      
      // Set appropriate connection quality based on error type
      if (errorInfo.type === 'network' || errorInfo.type === 'connection') {
        setConnectionQuality('offline');
        setIsOnline(false);
      } else {
        setConnectionQuality('poor');
      }
    } finally {
      setIsRetrying(false);
    }
  }, [testDjangoConnection]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Test actual Django API connectivity, not just network
      const isApiConnected = await testDjangoConnection();
      
      if (isApiConnected) {
        setConnectionQuality('good');
        // Notify other components that Django API is available
        window.dispatchEvent(new CustomEvent('django-connection-restored'));
        
        // Hide the banner after a short delay when coming back online
        setTimeout(() => {
          setShowOfflineBanner(false);
        }, 3000);
      } else {
        setConnectionQuality('poor');
        setShowOfflineBanner(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      setShowOfflineBanner(true);
      setLastOfflineTime(new Date());
      
      // Notify other components about Django API being unavailable
      window.dispatchEvent(new CustomEvent('django-connection-lost'));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state and test Django connection
    if (!navigator.onLine) {
      setShowOfflineBanner(true);
      setLastOfflineTime(new Date());
    } else {
      // Test Django API on component mount
      testDjangoConnection().then(isConnected => {
        if (!isConnected) {
          setShowOfflineBanner(true);
        }
      });
    }

    // Periodic connection check (every 30 seconds when online)
    const connectionCheckInterval = setInterval(() => {
      if (navigator.onLine && !isRetrying) {
        testDjangoConnection().then(isConnected => {
          if (!isConnected && connectionQuality !== 'offline') {
            setShowOfflineBanner(true);
          } else if (isConnected && connectionQuality !== 'good') {
            // Connection restored, update status
            setConnectionQuality('good');
            window.dispatchEvent(new CustomEvent('django-connection-restored', {
              detail: { timestamp: new Date().toISOString(), source: 'periodic-check' }
            }));
          }
        }).catch(error => {
          // Silently handle periodic check errors to avoid spam
          console.debug('Periodic connection check failed:', error.message);
        });
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheckInterval);
    };
  }, [testDjangoConnection]);

  // Get banner color based on connection quality
  const getBannerColor = () => {
    switch (connectionQuality) {
      case 'good':
        return 'bg-green-600';
      case 'poor':
        return 'bg-yellow-600';
      case 'offline':
      default:
        return 'bg-red-600';
    }
  };

  // Get status message with more detailed feedback
  const getStatusMessage = () => {
    if (isOnline && connectionQuality === 'good') {
      return 'Connected to Django API';
    } else if (isOnline && connectionQuality === 'poor') {
      return 'Network connected but Django backend is unreachable';
    } else {
      return 'You\'re offline. Some features may not work properly.';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isRetrying) {
      return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />;
    } else if (isOnline && connectionQuality === 'good') {
      return <Wifi className="h-4 w-4 mr-2" />;
    } else if (isOnline && connectionQuality === 'poor') {
      return <AlertCircle className="h-4 w-4 mr-2" />;
    } else {
      return <WifiOff className="h-4 w-4 mr-2" />;
    }
  };

  // Format offline duration
  const getOfflineDuration = () => {
    if (!lastOfflineTime || isOnline) {return '';}
    
    const now = new Date();
    const diffMs = now - lastOfflineTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {return 'just now';}
    if (diffMins === 1) {return '1 minute ago';}
    if (diffMins < 60) {return `${diffMins} minutes ago`;}
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) {return '1 hour ago';}
    return `${diffHours} hours ago`;
  };

  // Don't render anything if connection is good and banner is not shown
  if (connectionQuality === 'good' && !showOfflineBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
        showOfflineBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`px-4 py-3 text-white font-medium ${getBannerColor()}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            {getStatusIcon()}
            <span>{getStatusMessage()}</span>
            {lastOfflineTime && !isOnline && (
              <span className="ml-2 text-sm opacity-90">
                (offline {getOfflineDuration()})
              </span>
            )}
          </div>
          
          {/* Retry button for poor connection or offline state */}
          {(connectionQuality === 'poor' || !isOnline) && (
            <button
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="ml-4 px-3 py-1 text-sm bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Retry connection"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin inline" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 inline" />
                  Retry
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Additional info for poor connection */}
        {connectionQuality === 'poor' && (
          <div className="mt-2 text-sm opacity-90 text-center">
            The Django backend server is not responding. This may be due to:
            <br />
            • Server maintenance or restart
            • Network connectivity issues
            • Backend configuration problems
            {lastError && lastError.status === 404 && (
              <>
                <br />
                • Health endpoint not configured (404 error)
              </>
            )}
            <br />
            Some features may not work until connection is restored.
          </div>
        )}
        
        {/* Additional info for offline state */}
        {!isOnline && (
          <div className="mt-2 text-sm opacity-90 text-center">
            No internet connection detected. Please check your network settings.
            {lastError && (
              <>
                <br />
                <span className="text-xs opacity-75">
                  Last error: {formatErrorMessage(lastError)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineDetector;