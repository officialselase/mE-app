import React, { memo } from 'react';
import OptimizedImage from './OptimizedImage';

/**
 * Memoized ThoughtCard component for performance optimization
 */
const ThoughtCard = memo(({ thought, onClick, className = '' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-xl shadow-sm thought-card cursor-pointer ${className}`}
      onClick={onClick}
    >
      {thought.images && thought.images.length > 0 && (
        <div className="w-full h-48">
          <OptimizedImage
            src={thought.images[0]}
            alt={thought.title}
            className="w-full h-full object-cover rounded-t-xl"
          />
        </div>
      )}
      
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-2">{thought.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{thought.snippet}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formatDate(thought.date)}
          </span>
          {thought.featured && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Featured
            </span>
          )}
        </div>
        
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {thought.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ThoughtCard.displayName = 'ThoughtCard';

export default ThoughtCard;