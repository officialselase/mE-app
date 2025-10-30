/**
 * Token Manager for handling JWT tokens with Django backend
 * Provides secure token storage, retrieval, refresh, and cleanup functionality
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

class TokenManager {
  /**
   * Get the current access token from localStorage
   * @returns {string|null} The access token or null if not found
   */
  static getAccessToken() {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get the current refresh token from localStorage
   * @returns {string|null} The refresh token or null if not found
   */
  static getRefreshToken() {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Store both access and refresh tokens securely
   * @param {string} accessToken - The JWT access token
   * @param {string} refreshToken - The JWT refresh token
   * @param {number} expiresIn - Token expiry time in seconds (optional)
   */
  static setTokens(accessToken, refreshToken, expiresIn = null) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      // Calculate and store expiry time if provided
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Clear all stored tokens from localStorage
   */
  static clearTokens() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if the current access token is expired
   * @returns {boolean} True if token is expired or expiry info is not available
   */
  static isTokenExpired() {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        return true;
      }

      // Try to decode the token to get expiry from JWT payload
      const payload = this.decodeToken(accessToken);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000); // Convert to seconds
        const bufferTime = 5 * 60; // 5 minutes buffer in seconds
        return now >= (payload.exp - bufferTime);
      }

      // Fallback to stored expiry time
      const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryTime) {
        // If no expiry info, check if token looks valid
        return false; // Don't assume expired if we can't determine
      }
      
      const expiry = parseInt(expiryTime, 10);
      const now = Date.now();
      
      // Add 5 minute buffer before actual expiry
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return now >= (expiry - bufferTime);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false; // Don't assume expired on error
    }
  }

  /**
   * Check if user has valid authentication tokens
   * @returns {boolean} True if both access and refresh tokens exist
   */
  static hasValidTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  /**
   * Refresh the access token using the refresh token
   * @returns {Promise<string>} Promise that resolves to the new access token
   * @throws {Error} If refresh fails or no refresh token is available
   */
  static async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Import axios here to avoid circular dependency
      const axios = (await import('axios')).default;
      const API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
        refresh: refreshToken,
      });

      const { access_token, access, expires_in } = response.data;
      const newAccessToken = access_token || access;
      
      if (!newAccessToken) {
        throw new Error('No access token received from refresh endpoint');
      }

      // Update the access token and expiry
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      
      if (expires_in) {
        const expiryTime = Date.now() + (expires_in * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, clear all tokens
      this.clearTokens();
      
      // Re-throw with a more user-friendly message
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error during token refresh. Please try again.');
      } else {
        throw new Error('Failed to refresh authentication. Please log in again.');
      }
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   * @returns {Promise<string|null>} Promise that resolves to a valid access token or null
   */
  static async getValidAccessToken() {
    try {
      const accessToken = this.getAccessToken();
      
      if (!accessToken) {
        return null;
      }

      // If token is not expired, return it
      if (!this.isTokenExpired()) {
        return accessToken;
      }

      // Token is expired, try to refresh
      console.log('Access token expired, attempting refresh...');
      return await this.refreshAccessToken();
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Decode JWT token payload (without verification)
   * @param {string} token - The JWT token to decode
   * @returns {object|null} The decoded payload or null if invalid
   */
  static decodeToken(token) {
    try {
      if (!token) {return null;}
      
      const parts = token.split('.');
      if (parts.length !== 3) {return null;}
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user information from the access token
   * @returns {object|null} User info from token or null if not available
   */
  static getUserFromToken() {
    const accessToken = this.getAccessToken();
    if (!accessToken) {return null;}
    
    const payload = this.decodeToken(accessToken);
    if (!payload) {return null;}
    
    return {
      userId: payload.user_id,
      email: payload.email,
      displayName: payload.display_name,
      exp: payload.exp,
      iat: payload.iat,
    };
  }

  /**
   * Check if the current user is authenticated
   * @returns {boolean} True if user has valid tokens
   */
  static isAuthenticated() {
    return this.hasValidTokens() && !this.isTokenExpired();
  }

  /**
   * Handle token expiration by clearing tokens and optionally redirecting
   * @param {boolean} redirect - Whether to redirect to login page
   */
  static handleTokenExpiration(redirect = true) {
    console.log('Handling token expiration...');
    this.clearTokens();
    
    if (redirect && typeof window !== 'undefined') {
      // Only redirect if not already on login/register pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Store the current path for redirect after login
        localStorage.setItem('redirect_after_login', currentPath);
        window.location.href = '/login';
      }
    }
  }

  /**
   * Get and clear the redirect path after login
   * @returns {string} The path to redirect to, or '/' as default
   */
  static getAndClearRedirectPath() {
    try {
      const redirectPath = localStorage.getItem('redirect_after_login');
      localStorage.removeItem('redirect_after_login');
      return redirectPath || '/';
    } catch (error) {
      console.error('Error getting redirect path:', error);
      return '/';
    }
  }

  /**
   * Initialize token management (call this on app startup)
   * Checks token validity and clears invalid tokens
   */
  static initialize() {
    try {
      // Check if we have tokens
      if (!this.hasValidTokens()) {
        this.clearTokens();
        return;
      }

      // Check if access token is expired
      if (this.isTokenExpired()) {
        console.log('Access token expired on initialization');
        // Don't automatically refresh on initialization to avoid unnecessary API calls
        // The refresh will happen when needed during API calls
      }
    } catch (error) {
      console.error('Error initializing token manager:', error);
      this.clearTokens();
    }
  }
}

export default TokenManager;