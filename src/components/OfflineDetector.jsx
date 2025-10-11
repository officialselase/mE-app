import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * OfflineDetector component that shows a banner when the user goes offline
 * and automatically hides when they come back online
 */
const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Hide the banner after a short delay when coming back online
      setTimeout(() => {
        setShowOfflineBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if online and banner is not shown
  if (isOnline && !showOfflineBanner) {
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
      <div
        className={`px-4 py-3 text-center text-white font-medium ${
          isOnline ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        <div className="flex items-center justify-center">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              <span>You're back online!</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 mr-2" />
              <span>You're currently offline. Some features may not work.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineDetector;