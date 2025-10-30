import { useState, useCallback, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

const LessonView = ({ lesson, onComplete, isCompleted }) => {
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const handleMarkComplete = useCallback(async () => {
    if (completing || isCompleted) {return;}
    
    try {
      setCompleting(true);
      setError(null);
      
      await learnAPI.completeLesson(lesson.id);
      onComplete(lesson.id);
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      const djangoError = handleDjangoError(err);
      setError(djangoError.message);
    } finally {
      setCompleting(false);
    }
  }, [lesson.id, onComplete, completing, isCompleted]);

  // Fetch assignments for the lesson
  const fetchAssignments = useCallback(async () => {
    if (!lesson?.id) {return;}
    
    try {
      setLoadingAssignments(true);
      const response = await learnAPI.getAssignments(lesson.id);
      setAssignments(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      // Don't show error for assignments, just log it
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [lesson?.id]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  if (!lesson) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>No lesson selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
            <div className="flex items-center space-x-4 text-indigo-100">
              <span className="text-sm">Lesson {lesson.order_index + 1}</span>
              {isCompleted && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Completed</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Mark as Complete Button */}
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              disabled={completing}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {completing ? 'Marking Complete...' : 'Mark as Complete'}
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Video Section */}
        {lesson.video_url && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Video</h3>
            <VideoPlayer videoUrl={lesson.video_url} />
          </div>
        )}

        {/* Lesson Content */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Content</h3>
          <div className="prose max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        </div>

        {/* Assignments Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assignments {loadingAssignments ? '(Loading...)' : `(${assignments.length})`}
          </h3>
          
          {loadingAssignments ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {assignment.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {assignment.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                          {assignment.type}
                        </span>
                        {assignment.due_date && (
                          <span>
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {assignment.required && (
                          <span className="text-red-600 font-medium">Required</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          // This will be handled by the parent component or router
                          window.dispatchEvent(new CustomEvent('viewAssignment', { 
                            detail: { assignmentId: assignment.id } 
                          }));
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View Assignment →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No assignments for this lesson</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;