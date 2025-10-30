import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';

const StudentProgress = ({ courseId, completedLessons = [], totalLessons = 0, onLessonRecommendation }) => {
  const [progress, setProgress] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) {return;}
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/courses/${courseId}/progress`);
      const progressData = response.data;
      
      setProgress(progressData);
      
      // Find next lesson recommendation
      if (progressData.next_lesson) {
        setNextLesson(progressData.next_lesson);
      }
      
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleNextLessonClick = useCallback(() => {
    if (nextLesson && onLessonRecommendation) {
      onLessonRecommendation(nextLesson);
    }
  }, [nextLesson, onLessonRecommendation]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Calculate progress from props if API data not available
  const completedCount = progress?.completed_lessons?.length || completedLessons.length;
  const total = progress?.total_lessons || totalLessons;
  const progressPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-2 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchProgress}
            className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
        <div className="flex items-center justify-between">
          <span className="text-indigo-100">
            {completedCount} of {total} lessons completed
          </span>
          <span className="text-2xl font-bold">
            {progressPercentage}%
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Course Completion</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {completedCount}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {total - completedCount}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>

        {/* Next Lesson Recommendation */}
        {nextLesson ? (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Continue Learning</h4>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-indigo-900 mb-1">
                    Next: {nextLesson.title}
                  </h5>
                  <p className="text-indigo-700 text-sm mb-3">
                    Lesson {nextLesson.order}
                  </p>
                  {nextLesson.description && (
                    <p className="text-indigo-600 text-sm">
                      {nextLesson.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleNextLessonClick}
                  className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm"
                >
                  Start Lesson
                </button>
              </div>
            </div>
          </div>
        ) : progressPercentage === 100 ? (
          <div className="border-t pt-6">
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-green-900 mb-2">
                🎉 Course Completed!
              </h4>
              <p className="text-green-700 text-sm">
                Congratulations! You've completed all lessons in this course.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t pt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                Keep going! You're making great progress.
              </p>
            </div>
          </div>
        )}

        {/* Achievement Badges */}
        {progressPercentage > 0 && (
          <div className="border-t pt-6 mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {progressPercentage >= 25 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  🌟 Getting Started
                </span>
              )}
              {progressPercentage >= 50 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🚀 Halfway There
                </span>
              )}
              {progressPercentage >= 75 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  💪 Almost Done
                </span>
              )}
              {progressPercentage === 100 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🏆 Course Master
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;