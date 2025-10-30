import React, { memo } from 'react';

/**
 * SkeletonLoader component for displaying loading states
 * @param {Object} props
 * @param {string} props.variant - Type of skeleton ('card', 'list', 'text')
 * @param {number} props.count - Number of skeleton items to display
 */
const SkeletonLoader = memo(({ variant = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => index);

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return skeletons.map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            role="status"
            aria-label="Loading content"
          >
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="flex justify-between items-center mb-4">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-300 rounded flex-1" />
                <div className="h-10 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ));

      case 'list':
        return skeletons.map((index) => (
          <div
            key={index}
            className="animate-pulse mb-4"
            role="status"
            aria-label="Loading content"
          >
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        ));

      case 'text':
        return skeletons.map((index) => (
          <div
            key={index}
            className="animate-pulse mb-2"
            role="status"
            aria-label="Loading content"
          >
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        ));

      default:
        return null;
    }
  };

  // For card variant, don't wrap in space-y-6 since it's used in grid layouts
  if (variant === 'card') {
    return renderSkeleton();
  }
  
  return <div className="space-y-6">{renderSkeleton()}</div>;
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
