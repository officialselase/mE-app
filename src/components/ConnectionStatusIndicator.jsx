import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useConnectionStatus, useConnectionQuality, useConnectionMessage } from '../hooks/useConnectionStatus';

/**
 * Connection Status Indicator Component
 * Shows current API connection status with visual indicators
 */
const ConnectionStatusIndicator = ({ 
  variant = 'badge', // 'badge', 'banner', 'icon'
  showMessage = true,
  showQuality = false,
  className = ''
}) => {
  const status = useConnectionStatus();
  const quality = useConnectionQuality();
  const message = useConnectionMessage();

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    
    switch (status.apiStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (!status.isOnline) {return 'text-red-500 bg-red-50 border-red-200';}
    
    switch (status.apiStatus) {
      case 'healthy':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'offline':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getQualityColor = () => {
    if (quality >= 80) {return 'text-green-600';}
    if (quality >= 60) {return 'text-yellow-600';}
    if (quality >= 40) {return 'text-orange-600';}
    return 'text-red-600';
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${getStatusColor().split(' ')[0]} ${className}`}>
        {getStatusIcon()}
      </div>
    );
  }

  if (variant === 'banner') {
    // Only show banner for non-healthy states
    if (status.isOnline && status.apiStatus === 'healthy') {
      return null;
    }

    return (
      <div className={`w-full px-4 py-2 border-l-4 ${getStatusColor()} ${className}`}>
        <div className="flex items-center">
          {getStatusIcon()}
          {showMessage && (
            <span className="ml-2 text-sm font-medium">
              {message}
            </span>
          )}
          {showQuality && (
            <span className={`ml-auto text-xs ${getQualityColor()}`}>
              {quality}% available
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      {showMessage && (
        <span className="ml-1">
          {message}
        </span>
      )}
      {showQuality && (
        <span className={`ml-2 ${getQualityColor()}`}>
          {quality}%
        </span>
      )}
    </div>
  );
};

/**
 * Detailed Connection Status Panel
 * Shows comprehensive connection information
 */
export const ConnectionStatusPanel = ({ className = '' }) => {
  const status = useConnectionStatus();
  const quality = useConnectionQuality();
  const message = useConnectionMessage();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {return 'Never';}
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Connection Status</h3>
        <ConnectionStatusIndicator variant="badge" showQuality />
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Internet:</span>
          <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
            {status.isOnline ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">API Status:</span>
          <span className={
            status.apiStatus === 'healthy' ? 'text-green-600' :
            status.apiStatus === 'degraded' ? 'text-yellow-600' :
            'text-red-600'
          }>
            {status.apiStatus.charAt(0).toUpperCase() + status.apiStatus.slice(1)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Quality:</span>
          <span className={
            quality >= 80 ? 'text-green-600' :
            quality >= 60 ? 'text-yellow-600' :
            quality >= 40 ? 'text-orange-600' :
            'text-red-600'
          }>
            {quality}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Last Check:</span>
          <span className="text-gray-700">
            {formatTimestamp(status.lastHealthCheck)}
          </span>
        </div>
        
        {status.hasRetryQueue && (
          <div className="flex justify-between">
            <span className="text-gray-500">Queued Requests:</span>
            <span className="text-orange-600">Pending</span>
          </div>
        )}
      </div>
      
      {Object.keys(status.endpointStatus).length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Endpoint Status</h4>
          <div className="space-y-1">
            {Object.entries(status.endpointStatus).map(([endpoint, isHealthy]) => (
              <div key={endpoint} className="flex justify-between text-xs">
                <span className="text-gray-500 truncate">{endpoint}</span>
                <span className={isHealthy ? 'text-green-600' : 'text-red-600'}>
                  {isHealthy ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;