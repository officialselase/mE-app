import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, onEnroll }) => {
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (enrolling) return;
    
    try {
      setEnrolling(true);
      await onEnroll(course.id);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setEnrolling(false);
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
          <span>Instructor: {course.instructor_name}</span>
          <span>{new Date(course.created_at).toLocaleDateString()}</span>
        </div>
        
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
              disabled={enrolling}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
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