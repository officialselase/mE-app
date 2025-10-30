import React from 'react';
import { useCacheStats } from '../hooks/useCache';

/**
 * Debug component to display cache statistics
 * Only shown in development mode
 */
const CacheStatsDebug = () => {
  const { stats, updateStats, clearCache, cleanup } = useCacheStats();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Cache Stats</h3>
        <button
          onClick={updateStats}
          className="text-blue-400 hover:text-blue-300"
          title="Refresh stats"
        >
          ↻
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Total Entries: {stats.totalEntries}</div>
        <div>Expired: {stats.expired}</div>
        <div>Stale: {stats.stale}</div>
        
        {Object.keys(stats.byType).length > 0 && (
          <div className="mt-2">
            <div className="font-medium">By Type:</div>
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="ml-2">
                {type}: {count}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={cleanup}
          className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
          title="Clean up expired entries"
        >
          Cleanup
        </button>
        <button
          onClick={clearCache}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          title="Clear all cache"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default CacheStatsDebug;