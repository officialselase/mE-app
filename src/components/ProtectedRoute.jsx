import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login', requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If route is for unauthenticated users only (like login/register) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from login/register pages
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // User has correct authentication status for this route
  return children;
};

export default ProtectedRoute;
