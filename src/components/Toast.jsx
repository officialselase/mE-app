import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Toast component for displaying notifications
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast
 * @param {string} props.type - Type of toast ('success', 'error', 'info', 'warning')
 * @param {string} props.message - Message to display
 * @param {number} props.duration - Auto-dismiss duration in milliseconds (default: 5000)
 * @param {function} props.onDismiss - Callback when toast is dismissed
 */
const Toast = ({ 
  id, 
  type = 'info', 
  message, 
  duration = 5000, 
  onDismiss 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 mb-3 rounded-lg shadow-lg border-l-4 max-w-sm w-full transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconProps = { size: 20, className: "mr-3 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="mr-3 flex-shrink-0 text-green-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="mr-3 flex-shrink-0 text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="mr-3 flex-shrink-0 text-yellow-500" />;
      case 'info':
      default:
        return <Info {...iconProps} className="mr-3 flex-shrink-0 text-blue-500" />;
    }
  };

  return (
    <div 
      className={getToastStyles()}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="ml-3 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;