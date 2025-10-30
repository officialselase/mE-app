import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { handleAPIError, logError, formatErrorMessage } from '../utils/errorHandler';

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire application.
 * Enhanced for Django integration with specific error handling and recovery options.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: null,
      isOnline: navigator.onLine,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error handling for Django integration
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Determine error type and handle Django-specific errors
    let errorType = 'javascript';
    let processedError = error;
    
    // Check if it's an API error
    if (error.response || error.request) {
      const apiErrorInfo = handleAPIError(error);
      errorType = apiErrorInfo.type;
      processedError = apiErrorInfo;
    }
    
    this.setState({
      error: processedError,
      errorInfo: errorInfo,
      errorType: errorType
    });

    // Log error with context for monitoring
    logError(processedError, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);
  }

  handleOnlineStatusChange = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleRetry = () => {
    // Reset the error boundary state and increment retry count
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: null,
      retryCount: this.state.retryCount + 1
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorIcon = () => {
    switch (this.state.errorType) {
      case 'network':
      case 'connection':
      case 'timeout':
        return this.state.isOnline ? <Wifi className="h-16 w-16 text-orange-500" /> : <WifiOff className="h-16 w-16 text-red-500" />;
      case 'server':
        return <AlertTriangle className="h-16 w-16 text-red-500" />;
      case 'auth':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-red-500" />;
    }
  };

  getErrorTitle = () => {
    switch (this.state.errorType) {
      case 'network':
      case 'connection':
        return 'Connection Problem';
      case 'timeout':
        return 'Request Timed Out';
      case 'server':
        return 'Server Error';
      case 'auth':
        return 'Authentication Required';
      case 'permission':
        return 'Access Denied';
      default:
        return 'Something Went Wrong';
    }
  };

  getErrorMessage = () => {
    if (this.state.error && typeof this.state.error === 'object' && this.state.error.message) {
      return formatErrorMessage(this.state.error);
    }
    
    switch (this.state.errorType) {
      case 'network':
      case 'connection':
        return this.state.isOnline 
          ? 'Unable to connect to the server. Please check your connection and try again.'
          : 'You appear to be offline. Please check your internet connection.';
      case 'timeout':
        return 'The request took too long to complete. Please try again.';
      case 'server':
        return 'The server encountered an error. Please try again in a few moments.';
      case 'auth':
        return 'You need to log in to access this content.';
      case 'permission':
        return 'You do not have permission to access this content.';
      default:
        return 'An unexpected error occurred. Please try refreshing the page.';
    }
  };

  getRecoveryOptions = () => {
    const options = [];
    
    // Always show retry option
    options.push({
      label: 'Try Again',
      action: this.handleRetry,
      icon: <RefreshCw className="h-4 w-4 mr-2" />,
      primary: true
    });

    // Show refresh option for certain error types
    if (['javascript', 'server', 'unknown'].includes(this.state.errorType)) {
      options.push({
        label: 'Refresh Page',
        action: this.handleRefresh,
        icon: <RefreshCw className="h-4 w-4 mr-2" />,
        primary: false
      });
    }

    // Show go home option for auth/permission errors
    if (['auth', 'permission'].includes(this.state.errorType)) {
      options.push({
        label: 'Go to Home',
        action: this.handleGoHome,
        icon: null,
        primary: false
      });
    }

    return options;
  };

  render() {
    if (this.state.hasError) {
      const recoveryOptions = this.getRecoveryOptions();
      
      // Enhanced fallback UI with Django-specific error handling
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              {this.getErrorIcon()}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {this.getErrorTitle()}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {this.getErrorMessage()}
            </p>

            {/* Connection status indicator */}
            {(['network', 'connection', 'timeout'].includes(this.state.errorType)) && (
              <div className="mb-4 p-3 rounded-lg bg-gray-100">
                <div className="flex items-center justify-center text-sm">
                  {this.state.isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-green-700">Connected to Internet</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-700">No Internet Connection</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Retry count indicator */}
            {this.state.retryCount > 0 && (
              <div className="mb-4 text-sm text-gray-500">
                Retry attempts: {this.state.retryCount}
              </div>
            )}

            {/* Recovery options */}
            <div className="space-y-3">
              {recoveryOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                    option.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error Type:</strong> {this.state.errorType}
                  </div>
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.error.status && (
                    <div className="mb-2">
                      <strong>Status:</strong> {this.state.error.status}
                    </div>
                  )}
                  {this.state.error.details && (
                    <div className="mb-2">
                      <strong>Details:</strong> {JSON.stringify(this.state.error.details, null, 2)}
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Help text for persistent errors */}
            {this.state.retryCount >= 3 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  If this problem persists, please try again later or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;