import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for detecting offline status and Django API connectivity
 * @returns {Object} Object containing online status, connection quality, and retry function
 */
export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'good', 'poor', 'offline'
  const [isRetrying, setIsRetrying] = useState(false);

  // Test Django API connectivity
  const testDjangoConnection = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/api/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        setConnectionQuality('good');
        return true;
      } else {
        setConnectionQuality('poor');
        return false;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setConnectionQuality('poor');
      } else {
        setConnectionQuality('offline');
      }
      return false;
    }
  }, []);

  // Retry connection function
  const retryConnection = useCallback(async () => {
    setIsRetrying(true);
    
    try {
      const isConnected = await testDjangoConnection();
      
      if (isConnected) {
        setIsOnline(true);
        setConnectionQuality('good');
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('django-connection-restored'));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to reconnect to Django API:', error);
      setConnectionQuality('offline');
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, [testDjangoConnection]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Test actual Django API connectivity
      const isApiConnected = await testDjangoConnection();
      
      if (isApiConnected) {
        window.dispatchEvent(new CustomEvent('django-connection-restored'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      window.dispatchEvent(new CustomEvent('django-connection-lost'));
    };

    const handleConnectionRestored = () => {
      setIsOnline(true);
      setConnectionQuality('good');
    };

    const handleConnectionLost = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('django-connection-restored', handleConnectionRestored);
    window.addEventListener('django-connection-lost', handleConnectionLost);

    // Initial connection test
    if (navigator.onLine) {
      testDjangoConnection();
    } else {
      setConnectionQuality('offline');
    }

    // Periodic connection check (every 30 seconds when online)
    const connectionCheckInterval = setInterval(() => {
      if (navigator.onLine) {
        testDjangoConnection();
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('django-connection-restored', handleConnectionRestored);
      window.removeEventListener('django-connection-lost', handleConnectionLost);
      clearInterval(connectionCheckInterval);
    };
  }, [testDjangoConnection]);

  return {
    isOnline,
    connectionQuality,
    isRetrying,
    retryConnection,
    isDjangoAvailable: connectionQuality === 'good',
    hasNetworkIssues: connectionQuality === 'poor' || !isOnline,
  };
};

export default useOfflineDetection;