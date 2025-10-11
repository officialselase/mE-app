import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

/**
 * Hook to use toast notifications
 * @returns {Object} Toast functions (success, error, info, warning, dismiss, dismissAll)
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * ToastProvider component that manages toast notifications globally
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Generate unique ID for each toast
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Add a new toast
  const addToast = useCallback((type, message, duration = 5000) => {
    const id = generateId();
    const newToast = {
      id,
      type,
      message,
      duration,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, [generateId]);

  // Remove a specific toast
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Remove all toasts
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Toast type functions
  const success = useCallback((message, duration) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast('error', message, duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast('info', message, duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  const contextValue = {
    success,
    error,
    info,
    warning,
    dismiss: dismissToast,
    dismissAll,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-50 space-y-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;