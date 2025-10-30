import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, handleDjangoError } from '../utils/djangoApi';
import TokenManager from '../utils/tokenManager';

// Create context with default values to prevent null context errors
const defaultAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshToken: async () => false
};

const AuthContext = createContext(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize token manager
        TokenManager.initialize();
        
        // Check if we have valid tokens
        if (!TokenManager.hasValidTokens()) {
          setIsLoading(false);
          return;
        }

        // Try to get current user from Django API
        const response = await authAPI.getCurrentUser();
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        
        // If auth check fails, clear tokens and reset state
        TokenManager.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function using Django API
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token, expires_in, user: userData } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('Invalid response from login endpoint');
      }

      // Store tokens using TokenManager with expiry info
      TokenManager.setTokens(access_token, refresh_token, expires_in);

      // Set user state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle Django-specific errors
      const djangoError = handleDjangoError(error);
      
      if (djangoError.type === 'validation' && djangoError.errors) {
        // Handle field-specific validation errors
        const errorMessage = Object.values(djangoError.errors)[0] || 'Login failed';
        throw new Error(errorMessage);
      } else {
        throw new Error(djangoError.message || 'Login failed');
      }
    }
  };

  // Register function using Django API
  const register = async (email, password, displayName) => {
    try {
      // First, register the user
      await authAPI.register({ 
        email, 
        password, 
        displayName 
      });
      
      // Registration successful, now log them in to get tokens
      const loginResponse = await authAPI.login({ email, password });
      const { access_token, refresh_token, expires_in, user: userData } = loginResponse.data;

      if (!access_token || !refresh_token) {
        throw new Error('Invalid response from login after registration');
      }

      // Store tokens using TokenManager with expiry info
      TokenManager.setTokens(access_token, refresh_token, expires_in);

      // Set user state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle Django-specific errors
      const djangoError = handleDjangoError(error);
      
      if (djangoError.type === 'validation' && djangoError.errors) {
        // Handle field-specific validation errors
        const errorMessages = Object.entries(djangoError.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(errorMessages);
      } else {
        throw new Error(djangoError.message || 'Registration failed');
      }
    }
  };

  // Logout function using Django API
  const logout = async () => {
    try {
      // Call Django logout endpoint if we have a token
      if (TokenManager.hasValidTokens()) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens and state regardless of API call result
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const newAccessToken = await TokenManager.refreshAccessToken();
      
      if (newAccessToken) {
        // Get updated user data
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear state on refresh failure
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) {return;}

    // Check token expiry every 5 minutes and refresh if needed
    const interval = setInterval(async () => {
      if (TokenManager.isTokenExpired()) {
        console.log('Token expired, attempting refresh...');
        await refreshToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
