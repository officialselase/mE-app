import React, { useState } from 'react';

/**
 * OptimizedImage component with WebP support, lazy loading, and fallbacks
 * @param {Object} props
 * @param {string} props.src - Image source path
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.className - CSS classes
 * @param {string} props.webpSrc - WebP version of the image (optional)
 * @param {Object} props.sizes - Responsive image sizes (optional)
 * @param {boolean} props.lazy - Enable lazy loading (default: true)
 * @param {string} props.fallbackSrc - Fallback image if main image fails
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  webpSrc,
  sizes,
  lazy = true,
  fallbackSrc = '/images/placeholder.svg',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If there's an error, show fallback
  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        {...props}
      />
    );
  }

  // If WebP source is provided, use picture element for format fallback
  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={lazy ? 'lazy' : 'eager'}
          onError={handleError}
          onLoad={handleLoad}
          {...(sizes && { sizes })}
          {...props}
        />
      </picture>
    );
  }

  // Standard image with lazy loading
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={lazy ? 'lazy' : 'eager'}
      onError={handleError}
      onLoad={handleLoad}
      {...(sizes && { sizes })}
      {...props}
    />
  );
};

export default OptimizedImage;