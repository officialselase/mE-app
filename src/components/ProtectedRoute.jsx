import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TokenManager from '../utils/tokenManager';

const ProtectedRoute = ({ children, redirectTo = '/login', requireAuth = true }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the current path for redirect after login
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      localStorage.setItem('redirect_after_login', location.pathname + location.search);
    }
    
    // Redirect to login, but save the location they were trying to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route is for unauthenticated users only (like login/register) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Get redirect path from storage or use default
    const redirectPath = TokenManager.getAndClearRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  // Additional check: if we think we're authenticated but don't have valid tokens
  if (requireAuth && isAuthenticated && !TokenManager.hasValidTokens()) {
    console.warn('User appears authenticated but has no valid tokens, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User has correct authentication status for this route
  return children;
};

export default ProtectedRoute;
