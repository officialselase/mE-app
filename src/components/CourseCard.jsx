import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, onEnroll, isEnrolling, showProgress = false }) => {
  const navigate = useNavigate();
  const [localEnrolling, setLocalEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (localEnrolling || isEnrolling) {return;}
    
    try {
      setLocalEnrolling(true);
      await onEnroll(course.id);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setLocalEnrolling(false);
    }
  };

  const handleViewCourse = () => {
    navigate(`/learn/courses/${course.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          {course.is_enrolled && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Enrolled
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Lessons: {course.lessons?.length || 0}</span>
          <span>{new Date(course.created_at).toLocaleDateString()}</span>
        </div>
        
        {/* Progress indicator for enrolled courses */}
        {showProgress && course.is_enrolled && course.enrollment && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {course.enrollment.completed_lessons?.length || 0} / {course.lessons?.length || 0} lessons
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${course.lessons?.length > 0 
                    ? ((course.enrollment.completed_lessons?.length || 0) / course.lessons.length) * 100 
                    : 0}%` 
                }}
               />
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {course.is_enrolled ? (
            <button
              onClick={handleViewCourse}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={localEnrolling || isEnrolling}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {(localEnrolling || isEnrolling) ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
          
          <button
            onClick={handleViewCourse}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;