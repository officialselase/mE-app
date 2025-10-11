import React, { memo } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * ErrorMessage component for displaying API failure messages with retry functionality
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {function} props.onRetry - Callback function for retry action
 * @param {boolean} props.isRetrying - Whether a retry is in progress
 * @param {string} props.type - Type of error ('network', 'api', 'generic')
 * @param {boolean} props.showRetry - Whether to show retry button (default: true)
 */
const ErrorMessage = memo(({ 
  message, 
  onRetry, 
  isRetrying = false, 
  type = 'generic',
  showRetry = true 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-6 w-6 text-red-500" />;
      case 'api':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Problem';
      case 'api':
        return 'Server Error';
      default:
        return 'Something went wrong';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'api':
        return 'We\'re having trouble connecting to our servers. Please try again in a moment.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
      <div className="flex justify-center mb-3">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        {getTitle()}
      </h3>
      
      <p className="text-red-700 mb-4 text-sm leading-relaxed">
        {message || getDefaultMessage()}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw 
            className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} 
          />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;