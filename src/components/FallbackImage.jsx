import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * FallbackImage component that shows a fallback when image fails to load
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.fallbackSrc - Fallback image URL (optional)
 * @param {string} props.className - CSS classes to apply
 * @param {React.ReactNode} props.fallbackContent - Custom fallback content
 * @param {function} props.onError - Callback when image fails to load
 * @param {function} props.onLoad - Callback when image loads successfully
 */
const FallbackImage = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  fallbackContent,
  onError,
  onLoad,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = (e) => {
    setIsLoading(false);
    
    // If we have a fallback source and haven't tried it yet
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // Otherwise, show error state
    setHasError(true);
    
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    
    if (onLoad) {
      onLoad(e);
    }
  };

  // If image failed to load and no fallback content provided
  if (hasError && !fallbackContent) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <div className="text-center p-4">
          <ImageOff className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  // If image failed and custom fallback content is provided
  if (hasError && fallbackContent) {
    return fallbackContent;
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
          role="img"
          aria-label="Loading image"
        >
          <div className="text-gray-400">
            <div className="h-6 w-6 rounded-full bg-gray-300" />
          </div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...props}
      />
    </>
  );
};

export default FallbackImage;