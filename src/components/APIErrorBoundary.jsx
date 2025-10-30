import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * Error fallback component for API-related errors
 */
const APIErrorFallback = ({ error, resetErrorBoundary, resetKeys }) => {
  const isNetworkError = error?.message?.includes('Network') || 
                         error?.message?.includes('connection') ||
                         error?.code === 'NETWORK_ERROR';
  
  const isAuthError = error?.message?.includes('authentication') ||
                      error?.message?.includes('401') ||
                      error?.message?.includes('Unauthorized');

  const is404Error = error?.message?.includes('404') ||
                     error?.message?.includes('Not Found');

  const getErrorIcon = () => {
    if (isNetworkError) {return <WifiOff className="w-8 h-8 text-red-500" />;}
    if (isAuthError) {return <AlertTriangle className="w-8 h-8 text-yellow-500" />;}
    if (is404Error) {return <AlertTriangle className="w-8 h-8 text-orange-500" />;}
    return <AlertTriangle className="w-8 h-8 text-red-500" />;
  };

  const getErrorTitle = () => {
    if (isNetworkError) {return 'Connection Problem';}
    if (isAuthError) {return 'Authentication Required';}
    if (is404Error) {return 'Content Not Found';}
    return 'Something Went Wrong';
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (isAuthError) {
      return 'You need to be logged in to access this content. Please log in and try again.';
    }
    if (is404Error) {
      return 'The requested content could not be found. It may have been moved or deleted.';
    }
    return 'An unexpected error occurred while loading this content. Please try again.';
  };

  const getActionButton = () => {
    if (isAuthError) {
      return (
        <button
          onClick={() => window.location.href = '/login'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      );
    }

    return (
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    );
  };

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          {getErrorIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getErrorTitle()}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {getActionButton()}
          
          {!isAuthError && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reload Page
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
              {error?.stack || error?.message || 'Unknown error'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * API Error Boundary Component
 * 
 * Wraps components that make API calls and provides graceful error handling
 * for network, authentication, and other API-related errors.
 */
const APIErrorBoundary = ({ 
  children, 
  fallback: CustomFallback,
  onError,
  resetKeys = [],
  resetOnPropsChange = true,
}) => {
  const handleError = (error, errorInfo) => {
    // Log error for monitoring
    console.error('API Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Dispatch custom event for global error handling
    window.dispatchEvent(new CustomEvent('api-boundary-error', {
      detail: { error, errorInfo }
    }));
  };

  return (
    <ErrorBoundary
      FallbackComponent={CustomFallback || APIErrorFallback}
      onError={handleError}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component to wrap components with API error boundary
 */
export const withAPIErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <APIErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </APIErrorBoundary>
  );

  WrappedComponent.displayName = `withAPIErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook to manually trigger error boundary reset
 */
export const useAPIErrorBoundary = () => {
  const [resetKey, setResetKey] = React.useState(0);

  const resetBoundary = React.useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  return { resetKey, resetBoundary };
};

export default APIErrorBoundary;