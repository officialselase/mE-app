/**
 * React hooks for connection status management
 */

import { useState, useEffect } from 'react';
import connectionStatusManager from '../utils/connectionStatusManager';

/**
 * Hook to get current connection status
 */
export const useConnectionStatus = () => {
  const [status, setStatus] = useState(connectionStatusManager.getStatus());
  
  useEffect(() => {
    const unsubscribe = connectionStatusManager.addListener(() => {
      setStatus(connectionStatusManager.getStatus());
    });
    
    return unsubscribe;
  }, []);
  
  return status;
};

/**
 * Hook to get connection quality score (0-100)
 */
export const useConnectionQuality = () => {
  const [quality, setQuality] = useState(connectionStatusManager.getConnectionQuality());
  
  useEffect(() => {
    const unsubscribe = connectionStatusManager.addListener(() => {
      setQuality(connectionStatusManager.getConnectionQuality());
    });
    
    return unsubscribe;
  }, []);
  
  return quality;
};

/**
 * Hook to get human-readable status message
 */
export const useConnectionMessage = () => {
  const [message, setMessage] = useState(connectionStatusManager.getStatusMessage());
  
  useEffect(() => {
    const unsubscribe = connectionStatusManager.addListener(() => {
      setMessage(connectionStatusManager.getStatusMessage());
    });
    
    return unsubscribe;
  }, []);
  
  return message;
};

/**
 * Hook to perform health checks
 */
export const useHealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await connectionStatusManager.performHealthCheck();
      setLastResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };
  
  const performFullVerification = async () => {
    setIsChecking(true);
    try {
      const result = await connectionStatusManager.performFullVerification();
      setLastResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };
  
  return {
    isChecking,
    lastResult,
    performHealthCheck,
    performFullVerification
  };
};